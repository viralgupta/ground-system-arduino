import { useEffect, useState } from "react";
import Chart from "./Chart";
import Model from "./3dView";
import MultiChart from "./MultiChart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from "./components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";

function App() {
  const [connected, setConnected] = useState(false);
  const [canexport, setCanexport] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [data, setData] = useState([
    {
      time: "00:00:00",
      packet_count: 0,
      altitude: 0,
      pressure: 0,
      temperature1: 0,
      temperature2: 0,
      voltage: 0,
      gnss_time: "00:00:00",
      latitude: 0,
      longitude: 0,
      gps_altitude: 0,
      sats: 0,
      acceleration_x: 0,
      acceleration_y: 0,
      acceleration_z: 0,
      gyro_x: 0,
      gyro_y: 0,
      gyro_z: 0,
      pitch: 0,
      roll: 0,
      yaw: 0,
      heading: 0,
      parachute: 0,
      flight_state: 0,
      time_since_start: 0,
    },
  ]);

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
    const res = await fetch("http://localhost:5000/api/ports", {
      method: "GET",
    });
    const response: { ports: string[] } = await res.json();
    const selectElement = document.getElementById("ports") as HTMLSelectElement;
    const doption = document.createElement("option");
    doption.defaultSelected = true;
    doption.text = "Select Port";
    selectElement.add(doption);
    response.ports.forEach((port) => {
      const option = document.createElement("option");
      option.value = port;
      option.text = port;
      selectElement.add(option);
    });
  };

  let eventSource: EventSource;

  const getDataStream = async (port: string) => {
    eventSource = new EventSource(
      `http://localhost:5000/api/getstream/${port}`
    );
    eventSource.onmessage = function (event) {
      setCanexport(false);
      setConnected(true);
      const data = event.data;
      console.log("data", data);
      const regex = /<([\d.: -]+)>/g;
      const matches = [...data.matchAll(regex)];
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
        setData((prevData) => [...prevData, newData]);
        setPosition({
          x: mapValueToRange(values[18], 0, 360, -180, 180),
          y: mapValueToRange(values[19], 0, 360, -180, 180),
          z: mapValueToRange(values[21], 0, 360, -180, 180),
        });
      }

      eventSource.onerror = function () {
        eventSource.close();
        setCanexport(true);
        setConnected(false);
        getPorts();
      };
    };

    window.addEventListener("beforeunload", async () => {
      eventSource.close();
      setConnected(false);
    });
  };

  const exportData = async () => {
    const response = await fetch("http://localhost:5000/api/savedata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const currentDate = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    };
    const formattedDate = currentDate.toLocaleString("en-IN", options);
    a.download = `${formattedDate}.xlsx`;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    setCanexport(false);
  };

  useEffect(() => {
    const selectElement = document.getElementById("ports") as HTMLSelectElement;
    selectElement.addEventListener("focus", function () {
      selectElement.innerHTML = "";
      getPorts();
    });
    selectElement.addEventListener("change", function () {
      if (selectElement.value !== "Select Port") {
        getDataStream(selectElement.value);
      }
      selectElement.blur();
    });
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="bg-black w-full h-20 text-white text-3xl px-10 font-mono flex items-center justify-between">
        <span className="flex">
          Thrust&nbsp;Tech&nbsp;India
          <img src="tt.png" alt="Thrust Tech logo" className="h-10" />
        </span>
        <div className="flex">
          {connected && (
            <div className={`px-5 text-green-600`}>Connected&nbsp;●</div>
          )}
          {!connected && (
            <div className={`px-5 text-red-600`}>
              Waiting&nbsp;for&nbsp;data...
            </div>
          )}
          <select
            id="ports"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Select Port</option>
          </select>
          <button
            onClick={exportData}
            disabled={!canexport}
            className="bg-green-600 text-base p-2 rounded-md mx-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-green-300 cursor-pointer"
          >
            Export
          </button>
          <Dialog>
            <DialogTrigger
              disabled={!connected}
              className="text-base border rounded-md px-2 bg-blue-400 disabled:opacity-50 disabled:cursor-default"
            >
              Raw&nbsp;Data
            </DialogTrigger>
            <DialogContent>
              <DialogDescription>
                <Table>
                  <TableCaption>Live data from the satalite</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time Stamp</TableHead>
                      <TableHead>Volt</TableHead>
                      <TableHead>Gnss Time</TableHead>
                      <TableHead>Packets</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Parachute</TableHead>
                      <TableHead>Alt</TableHead>
                      <TableHead>GPS Alt</TableHead>
                      <TableHead>Lati</TableHead>
                      <TableHead>Long</TableHead>
                      <TableHead>SATS</TableHead>
                      <TableHead>Pitch</TableHead>
                      <TableHead>Roll</TableHead>
                      <TableHead>Yaw</TableHead>
                      <TableHead>Heading</TableHead>
                      <TableHead>Pres</TableHead>
                      <TableHead>Temp-1</TableHead>
                      <TableHead>Temp-2</TableHead>
                      <TableHead>X-Accel</TableHead>
                      <TableHead>Y-Accel</TableHead>
                      <TableHead>Z-Accel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.slice(-10).map((data, index) => (
                      <TableRow key={index}>
                        <TableCell>{data.time}</TableCell>
                        <TableCell>{data.voltage}</TableCell>
                        <TableCell>{data.gnss_time}</TableCell>
                        <TableCell>{data.packet_count}</TableCell>
                        <TableCell>{data.flight_state}</TableCell>
                        <TableCell>{data.parachute}</TableCell>
                        <TableCell>{data.altitude}</TableCell>
                        <TableCell>{data.gps_altitude}</TableCell>
                        <TableCell>{data.latitude}</TableCell>
                        <TableCell>{data.longitude}</TableCell>
                        <TableCell>{data.sats}</TableCell>
                        <TableCell>{data.pitch}</TableCell>
                        <TableCell>{data.roll}</TableCell>
                        <TableCell>{data.yaw}</TableCell>
                        <TableCell>{data.heading}</TableCell>
                        <TableCell>{data.pressure}</TableCell>
                        <TableCell>{data.temperature1}</TableCell>
                        <TableCell>{data.temperature2}</TableCell>
                        <TableCell>{data.acceleration_x}</TableCell>
                        <TableCell>{data.acceleration_y}</TableCell>
                        <TableCell>{data.acceleration_z}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex flex-wrap justify-center w-full bg-slate-900 absolute p-2 lg:p-5 space-x-2 space-y-2 lg:overflow-hidden overflow-scroll">
        <span></span>
        <Model rotation={position} />
        <MultiChart
          name={"Altitude"}
          data={data
            .slice(-20)
            .map((item) => ({ nomal: item.altitude, gps: item.gps_altitude }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
        <Chart
          name={"Pressure"}
          data={data.slice(-20).map((item) => ({ uv: item.pressure }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
        <MultiChart
          name={"Temperature"}
          data={data
            .slice(-20)
            .map((item) => ({ 1: item.temperature1, 2: item.temperature2 }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
        <Chart
          name={"Voltage"}
          data={data.slice(-20).map((item) => ({ uv: item.voltage }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
        <Chart
          name={"Latitude"}
          data={data.slice(-20).map((item) => ({ uv: item.latitude }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
        <Chart
          name={"Longitude"}
          data={data.slice(-20).map((item) => ({ uv: item.longitude }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
        <MultiChart
          name={"Acceleration"}
          data={data.slice(-10).map((item) => ({
            x: item.acceleration_x,
            y: item.acceleration_y,
            z: item.acceleration_z,
          }))}
          domainLeft={-5}
          domainRight={5}
        />
        <MultiChart
          name={"Gyroscope"}
          data={data.slice(-10).map((item) => ({
            x: item.gyro_x,
            y: item.gyro_y,
            z: item.gyro_z,
          }))}
          domainLeft={-90}
          domainRight={90}
        />
        <MultiChart
          name={"Orientation"}
          data={data
            .slice(-10)
            .map((item) => ({ x: item.pitch, y: item.roll, z: item.yaw }))}
          domainLeft={-90}
          domainRight={90}
        />
      </div>
    </>
  );
}

export default App;
