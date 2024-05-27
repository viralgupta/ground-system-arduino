import { useEffect, useState } from "react";
import Chart from "@/components/Chart";
import Model from "@/components/3dView.js";
import MultiChart from "@/components/MultiChart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

function App() {
  const [connected, setConnected] = useState(false);
  const [canexport, setCanexport] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [port, setPort] = useState<null | string>(null);
  const [writedata, setWritedata] = useState("");
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

  const getPorts = async () => {
    const response: { ports: string[] } = await window.backend.getPorts()
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


  const getDataStream = async (port: string) => {
    window.backend.getStream(port)

    window.addEventListener("beforeunload", async () => {
      window.backend.closeStream();
      setConnected(false);
    });
  };

  const exportData = async () => {
    const response = await window.backend.saveData()
    response.success ? toast.success(response.message) : toast.error(response.message)
  };

  const postData = async () => {
    const response = await window.backend.writePort(writedata)
    response.success ? toast.success(response.message) : toast.error(response.message)
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
        setPort(selectElement.value);
      }
      selectElement.blur();
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.source === window) {
        if(event.data === "fetch-data") {
          setData(window.backend.getData());
          setPosition(window.backend.getPosition());
          setCanexport(false);
          setConnected(true);
        } else if (event.data === "serialport-close" || event.data === "serialport-error") {
          setCanexport(true);
          setConnected(false);
          getPorts();
        }
      }
    })
  }, [])


  
  return (
    <>
      <Toaster />
      <div className="bg-black h-20 text-white text-3xl px-10 font-mono flex items-center justify-between">
        <span className="flex">
          <img
            src="tt.png"
            alt="Thrust Tech logo"
            className="h-10 rounded-lg"
          />
          &nbsp;Thrust&nbsp;Tech&nbsp;India
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
              className="text-base border rounded-md px-2 bg-blue-400 disabled:opacity-50 disabled:cursor-default mr-2"
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
          <Dialog>
            <DialogTrigger
              disabled={!connected}
              className="text-base border rounded-md px-2 bg-yellow-400 disabled:opacity-50 disabled:cursor-default"
            >
              Write&nbsp;Data
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="font-bold">
                Write data to {port}
              </DialogHeader>
              <DialogDescription className="flex gap-4">
                <Input
                  type="text"
                  onChange={(e) => setWritedata(e.target.value)}
                />
                <Button
                  onClick={postData}
                  disabled={!(writedata.length > 0) || !connected}
                >
                  POST
                </Button>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex flex-wrap justify-center bg-slate-900 absolute p-2 lg:p-5 space-x-2 space-y-2 lg:overflow-hidden overflow-scroll">
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
        {/* <Chart
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
        /> */}
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
            .map((item) => ({ x: item.pitch, y: item.roll, z: item.heading }))}
          domainLeft={-90}
          domainRight={90}
        />
        <Chart
          name={"Voltage"}
          data={data.slice(-20).map((item) => ({ uv: item.voltage }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
      </div>
    </>
  );
}

export default App;


