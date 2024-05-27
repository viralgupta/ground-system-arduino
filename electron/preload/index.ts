import { ipcRenderer, contextBridge } from 'electron'
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import excelJS from 'exceljs';

interface Data {
  time: string;
  packet_count: number;
  altitude: number;
  pressure: number;
  temperature1: number;
  temperature2: number;
  voltage: number;
  gnss_time: string;
  latitude: number;
  longitude: number;
  gps_altitude: number;
  sats: number;
  acceleration_x: number;
  acceleration_y: number;
  acceleration_z: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  pitch: number;
  roll: number;
  yaw: number;
  heading: number;
  parachute: number;
  flight_state: number;
  time_since_start: number;
}

let serialport: SerialPort;
let data: Data[] = [];
let position: {
  x: number;
  y: number;
  z: number;
} = { x: 0, y: 0, z: 0 };

function mapValueToRange(
  value: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number
) {
  const oldValueRange = oldMax - oldMin;
  const newValueRange = newMax - newMin;

  const normalizedValue = (value - oldMin) / oldValueRange;
  const newValue = normalizedValue * newValueRange + newMin;

  return newValue;
}

const getPorts = async () => {
  const ports = await SerialPort.list()
  const pathlists = ports.map(port => port.path)
  return {
    ports: pathlists
  }
}

const writePort = async (data: string) => {
  if (serialport) {
    serialport.write(data);
    return { message: 'Data written to the device', success: true }
} else {
    return { message: 'No device connected', success: false }
}
}

const saveData = async () => {
  const path: string = await ipcRenderer.invoke('dialog:openSave')
  if (!path) {
    return { message: 'File Saving Canceled!', success: false }
  }

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

  data.forEach((data) => {
    worksheet.addRow({ ...data }); 
  });

  try {
    await workbook.xlsx.writeFile(path);
    return { message: 'Data saved successfully', success: true };
  } catch (error) {
    return { message: `Error saving data`, success: false };
  }
}

const getStream = async (port: string) => {
  const connectToDevice = () => {
    SerialPort.list().then(ports => {
        const matchingPort = ports.find(p => p.path === port);

        if (matchingPort) {
            serialport = new SerialPort({
                baudRate: 9600,
                path: matchingPort.path
            });

            const parser = serialport.pipe(new ReadlineParser({ delimiter: '\r\n' }));

            parser.on('data', (datas) => {
              const regex = /<([\d.: -]+)>/g;
              const matches = [...datas.matchAll(regex)];
              const values = matches.map((match) => match[1]);
              if (
                values &&
                values[0] &&
                values[1] &&
                values[2] &&
                values[3] &&
                values[4] &&
                values[5] &&
                values[6] &&
                values[7] &&
                values[8] &&
                values[9] &&
                values[10] &&
                values[11] &&
                values[12] &&
                values[13] &&
                values[14] &&
                values[15] &&
                values[16] &&
                values[17] &&
                values[18] &&
                values[19] &&
                values[20] &&
                values[21] &&
                values[22] &&
                values[23] &&
                values[24]
              ) {
                const newData = {
                  time: values[0],
                  packet_count: parseInt(values[1]),
                  altitude: parseFloat(values[2]),
                  pressure: parseFloat(values[3]),
                  temperature1: parseFloat(values[4]),
                  temperature2: parseFloat(values[5]),
                  voltage: parseFloat(values[6]),
                  gnss_time: values[7],
                  latitude: parseFloat(values[8]),
                  longitude: parseFloat(values[9]),
                  gps_altitude: parseFloat(values[10]),
                  sats: parseInt(values[11]),
                  acceleration_x: parseFloat(values[12]),
                  acceleration_y: parseFloat(values[13]),
                  acceleration_z: parseFloat(values[14]),
                  gyro_x: parseFloat(values[15]),
                  gyro_y: parseFloat(values[16]),
                  gyro_z: parseFloat(values[17]),
                  pitch: parseFloat(values[18]),
                  roll: parseFloat(values[19]),
                  yaw: parseFloat(values[20]),
                  heading: parseFloat(values[21]),
                  parachute: parseInt(values[22]),
                  flight_state: parseInt(values[23]),
                  time_since_start: parseFloat(values[24]),
                };
                data = [...data, newData];
                position = {
                  x: mapValueToRange(values[18], 0, 360, -180, 180),
                  y: mapValueToRange(values[21], 0, 360, -180, 180),
                  z: mapValueToRange(values[19], 0, 360, -180, 180),
                }
                window.postMessage("fetch-data", "*");
              }
            });


            serialport.on('error', (err) => { 
              window.postMessage("serialport-error", "*");
            })

            serialport.on('close', () => {
              window.postMessage("serialport-close", "*");
            })

        } else {
            setTimeout(connectToDevice, 1000);
        }
    });
  };

  connectToDevice();
}

const closeStream = async () => {
  if (serialport) {
    serialport.close();
  }
}

const getData = () => {
  return data;
}

const getPosition = () => {
  return position;
}

contextBridge.exposeInMainWorld("backend", {
  getPorts,
  writePort,
  saveData,
  getStream,
  closeStream,
  getData,
  getPosition
})