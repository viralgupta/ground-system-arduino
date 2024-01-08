"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialport_1 = require("serialport");
const parser_readline_1 = require("@serialport/parser-readline");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const exceljs_1 = __importDefault(require("exceljs"));
const contentDisposition = __importStar(require("content-disposition"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use(body_parser_1.default.json());
app.use(express_1.default.static('public'));
app.use((0, cors_1.default)());
app.get('/api/getstream/:path', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const path = req.params.path;
    const connectToDevice = () => {
        serialport_1.SerialPort.list().then(ports => {
            const matchingPort = ports.find(p => p.path === path);
            if (matchingPort) {
                const port = new serialport_1.SerialPort({
                    baudRate: 9600,
                    path: matchingPort.path
                });
                const parser = port.pipe(new parser_readline_1.ReadlineParser({ delimiter: '\r\n' }));
                parser.on('data', (data) => {
                    res.write(`data: ${data}\n\n`);
                });
                port.on('error', (err) => {
                    res.end();
                });
                req.on('close', () => {
                    port.close();
                });
                port.on('close', () => {
                    res.end();
                });
            }
            else {
                setTimeout(connectToDevice, 1000);
            }
        });
    };
    connectToDevice();
}));
app.get('/api/ports', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ports = yield serialport_1.SerialPort.list();
    const pathlists = ports.map(port => port.path);
    res.json({ ports: pathlists });
}));
app.post('/api/savedata', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workbook = new exceljs_1.default.Workbook();
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
        { header: "Temprature 2", key: "temp1", width: 15 },
        { header: "Pressure", key: "press", width: 15 },
    ];
    req.body.forEach((data) => { worksheet.addRow(data); });
    const dispositionObject = contentDisposition.parse("attachment; filename=data.xlsx");
    const dispositionHeader = `attachment; filename="${dispositionObject.parameters.filename}"`;
    res.setHeader("Content-Disposition", dispositionHeader);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    workbook.xlsx.write(res).then(() => res.end());
}));
const port = 5000;
server.listen(port, () => {
    console.log(`SSE server is running on port ${port}`);
});
