const fs = require("fs");
const WS = require("websocket").w3cwebsocket;
const { v4: uuidv4 } = require("uuid");
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import excelJS from "exceljs";

const processInput = JSON.parse(fs.readFileSync(process.stdin.fd, "utf-8"));
const NL_PORT = processInput.nlPort;
const NL_TOKEN = processInput.nlToken;
const NL_CTOKEN = processInput.nlConnectToken;
const NL_EXTID = processInput.nlExtensionId;
const WS_URL = `ws://localhost:${NL_PORT}?extensionId=${NL_EXTID}&connectToken=${NL_CTOKEN}`;
const client = new WS(WS_URL);

let dataStream:
  | {
      time: number;
      alt: number;
      angx: number;
      angy: number;
      angz: number;
      accelx: number;
      accely: number;
      accelz: number;
      lat: number;
      long: number;
      temp1: number;
      temp2: number;
      press: number;
    }[] = [
  {
    time: 0,
    alt: 0,
    angx: 0,
    angy: 0,
    angz: 0,
    accelx: 0,
    accely: 0,
    accelz: 0,
    lat: 0,
    long: 0,
    temp1: 0,
    temp2: 0,
    press: 0,
  },
];

client.onclose = () => {
  console.log("Connection to NodeLink server closed!");
  client.close(0);
  process.exit(0);
};

client.onmessage = (e: any) => {
  if (typeof e.data === "string") {
    const message = JSON.parse(e.data);

    // Use extensions.dispatch or extensions.broadcast from the app,
    // to send an event here
    const eventName = message.event;
    switch (eventName) {
      // this event is received when the neutralino app's window is closed. Thiis code closes the extension websocket connection.
      case "windowClose":
        client.close(0);
        process.exit(0);
      case "getPorts":
        getPorts().then((data) => {
          client.send(
            JSON.stringify({
              id: uuidv4(),
              method: "app.broadcast",
              accessToken: NL_TOKEN,
              data: data
            })
          );
        });
        break;
      case "refreshData":
        dataStream = [
          {
            time: 0,
            alt: 0,
            angx: 0,
            angy: 0,
            angz: 0,
            accelx: 0,
            accely: 0,
            accelz: 0,
            lat: 0,
            long: 0,
            temp1: 0,
            temp2: 0,
            press: 0,
          },
        ];
        break;
      case "getDataStream":
        getDataStream(message.data.port);
        break;
      case "exportData":
        exportData({
          filepath: message.data.filepath,
          folder: message.data.folder,
        });
        break;
    }
  }
};

const getPorts: () => Promise<{
  event: string;
  data: { ports: string[] };
}> = async () => {
  const ports = await SerialPort.list();
  const pathlists = ports.map((port) => port.path);
  return { event: "ports", data: { ports: pathlists } };
};

const getDataStream: (port: string) => void = async (port) => {
  const connectToDevice = (port: string) => {
    SerialPort.list().then((ports) => {
      const matchingPort = ports.find((p) => p.path === port);

      if (matchingPort) {
        const port = new SerialPort({
          baudRate: 9600,
          path: matchingPort.path,
        });
        const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

        parser.on("data", (data) => {
          JSON.stringify({
            id: uuidv4(),
            method: "app.broadcast",
            accessToken: NL_TOKEN,
            data: {
              event: "dataStream",
              data: `${data}`,
            },
          });

          let match = data.match(
            /(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+)/
          );
          if (
            match &&
            match[1] &&
            match[2] &&
            match[3] &&
            match[4] &&
            match[5] &&
            match[6] &&
            match[7] &&
            match[8] &&
            match[9] &&
            match[10] &&
            match[11] &&
            match[12]
          ) {
            const newData = {
              time: 0,
              lat: parseFloat(match[1]),
              long: parseFloat(match[2]),
              alt: parseFloat(match[3]),
              temp1: parseFloat(match[4]),
              press: parseFloat(match[5]),
              angx: parseFloat(match[6]),
              angy: parseFloat(match[7]),
              angz: parseFloat(match[8]),
              accelx: parseFloat(match[9]),
              accely: parseFloat(match[10]),
              accelz: parseFloat(match[11]),
              temp2: parseFloat(match[12]),
            };
            dataStream.push(newData);
          }
        });

        port.on("error", () => {
          JSON.stringify({
            id: uuidv4(),
            method: "app.broadcast",
            accessToken: NL_TOKEN,
            data: {
              event: "streamEnded",
              data: true,
            },
          });
        });

        port.on("close", () => {
          JSON.stringify({
            id: uuidv4(),
            method: "app.broadcast",
            accessToken: NL_TOKEN,
            data: {
              event: "streamEnded",
              data: true,
            },
          });
        });
      } else {
        setTimeout(connectToDevice, 1000);
      }
    });
  };
  connectToDevice(port);
};

const exportData: ({
  filepath,
  folder,
}: {
  filepath: string;
  folder: string;
}) => void = async ({ filepath, folder }) => {
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
  dataStream.forEach((data: any, index: number) => {
    worksheet.addRow({ ...data, time: index });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  fs.writeFileSync(`${folder}/${filepath}`, buffer);
};
