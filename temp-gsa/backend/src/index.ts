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

let serialport: SerialPort;

app.get('/api/getstream/:path', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const path = req.params.path;

    const connectToDevice = () => {
        SerialPort.list().then(ports => {
            const matchingPort = ports.find(p => p.path === path);

            if (matchingPort) {
                serialport = new SerialPort({
                    baudRate: 9600,
                    path: matchingPort.path
                });

                const parser = serialport.pipe(new ReadlineParser({ delimiter: '\r\n' }));

                parser.on('data', (data) => {
                    res.write(`data: ${data}\n\n`);
                });

                serialport.on('error', (err) => {
                    res.end()
                })

                req.on('close', () => {
                    serialport.close();
                });

                serialport.on('close', () => {
                    res.end()
                })

            } else {
                setTimeout(connectToDevice, 1000);
            }
        });
    };

    connectToDevice();
});

app.post('/api/write', async (req, res) => {
    const data = req.body.data;
    if (serialport) {
        serialport.write(data);
        res.json({ success: 'Data written to the device' });
    } else {
        res.json({ message: 'No device connected' });
    }
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
        { header: "Time Stamp", key: "time", width: 25 },
        { header: "Packet Count", key: "packet_count", width: 15 },
        { header: "Altitude", key: "altitude", width: 15 },
        { header: "Pressure", key: "pressure", width: 15 },
        { header: "Temprature 1", key: "temperature1", width: 15 },
        { header: "Temprature 2", key: "temperature2", width: 15 },
        { header: "Voltage", key: "voltage", width: 15 },
        { header: "GPS Time", key: "gnss_time", width: 15 },
        { header: "Latitude", key: "latitude", width: 15 },
        { header: "Longitude", key: "longitude", width: 15 },
        { header: "GPS Altitude", key: "gps_altitude", width: 15 },
        { header: "Sats", key: "sats", width: 15 },
        { header: "Acceleration-X", key: "acceleration_x", width: 15 },
        { header: "Acceleration-Y", key: "acceleration_y", width: 15 },
        { header: "Acceleration-Z", key: "acceleration_z", width: 15 },
        { header: "Gyro-X", key: "gyro_x", width: 15 },
        { header: "Gyro-Y", key: "gyro_y", width: 15 },
        { header: "Gyro-Z", key: "gyro_z", width: 15 },
        { header: "Pitch", key: "pitch", width: 15 },
        { header: "Roll", key: "roll", width: 15 },
        { header: "Yaw", key: "yaw", width: 15 },
        { header: "Heading", key: "heading", width: 15 },
        { header: "Parachute", key: "parachute", width: 15 },
        { header: "Flight State", key: "flight_state", width: 15 },
        { header: "Time Since Start", key: "time_since_start", width: 15 },
    ];
    req.body.forEach((data:any) => {
        worksheet.addRow({ ...data }); 
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

