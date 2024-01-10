import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import excelJS from 'exceljs';
import * as contentDisposition from 'content-disposition';
import express, { Request, Response } from 'express'

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors())


app.get('/api/getstream/:path', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const path = req.params.path;

    const connectToDevice = () => {
        SerialPort.list().then(ports => {
            const matchingPort = ports.find(p => p.path === path);

            if (matchingPort) {
                const port = new SerialPort({
                    baudRate: 9600,
                    path: matchingPort.path
                });
                const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

                parser.on('data', (data) => {
                    res.write(`data: ${data}\n\n`);
                });

                port.on('error', (err) => {
                    res.end()
                })

                req.on('close', () => {
                    port.close();
                });

                port.on('close', () => {
                    res.end()
                })

            } else {
                setTimeout(connectToDevice, 1000);
            }
        });
    };

    connectToDevice();
});

app.get('/api/ports', async (req, res) => {
    const ports = await SerialPort.list()
    const pathlists = ports.map(port => port.path)
    res.json({ ports: pathlists })
});

app.post('/api/savedata', async (req, res) => {
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("data");
    worksheet.columns = [
        { header: "Time", key: "time", width: 25 },
        { header: "Altitude", key: "alt", width: 15 },
        { header: "Angle-X", key: "angx", width: 15 },
        { header: "Angle-Y", key: "angy", width: 15 },
        { header: "Angle-Z", key: "angz", width: 15 },
        { header: "Acceleration-X", key: "accelx", width: 15 },
        { header: "Acceleration-Y", key: "accely", width: 15 },
        { header: "Acceleration-Z", key: "accelz", width: 15 },
        { header: "Latitude", key: "lat", width: 15 },
        { header: "Longitude", key: "long", width: 15 },
        { header: "Temprature 1", key: "temp1", width: 15 },
        { header: "Temprature 2", key: "temp2", width: 15 },
        { header: "Pressure", key: "press", width: 15 },
    ];
    req.body.forEach((data:any, index:number) => {
        worksheet.addRow({ ...data, time: index }); 
    });

    const dispositionObject = contentDisposition.parse("attachment; filename=data.xlsx");

    const dispositionHeader = `attachment; filename="${dispositionObject.parameters.filename}"`

    res.setHeader("Content-Disposition", dispositionHeader);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); 

    workbook.xlsx.write(res).then(() => res.end());

})

const port = 5000;
server.listen(port, () => {
    console.log(`SSE server is running on port ${port}`);
});

