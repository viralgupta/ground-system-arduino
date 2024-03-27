import { useEffect, useState } from "react";
import Chart from "./Chart";
// @ts-ignore
import Model from "./3dView.jsx";
import { extensions, events, os } from "@neutralinojs/lib";

function App() {
  const [connected, setConnected] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [canexport, setCanexport] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [data, setData] = useState([
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
    extensions.dispatch(
      "js.thrusttech.ground-system",
      "getPorts",
      true
    );
  };

  const getDataStream = async (port: string) => {
    await extensions.dispatch(
      "js.thrusttech.ground-system",
      "getDataStream",
      port
    );
  };

  const exportData = async () => {
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
    const filename = currentDate
      .toLocaleString("en-IN", options)
      .concat(".xlsx");
    const folder = await os.showFolderDialog("Select folder to save data", {
      defaultPath: "/",
    });
    console.log(folder);
    extensions.dispatch("js.thrusttech.ground-system", "exportData", {
      folder: folder,
      filename: filename,
    });
  };

  const refrestData = async () => {
    extensions.dispatch("js.thrusttech.ground-system", "refreshData", data);
    setData([
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
    ]);
  };

  events.on("extensionReady", (data) => {
    if (data.detail == "js.thrusttech.ground-system") {
      setBackendConnected(true);
    }
  });

  events.on("extClientDisconnect", (data) => {
    if (data.detail == "js.thrusttech.ground-system") {
      setBackendConnected(false);
      setConnected(false);
    }
  });

  events.on("ports", async (data) => {
    const response: { ports: string[] } = data.detail;
    const selectElement = document.getElementById("ports") as HTMLSelectElement;
    selectElement.innerHTML = "";
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
  });

  events.on("dataStream", (event) => {
    setCanexport(false);
    setConnected(true);
    const data = event.detail;
    console.log("data", data);
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
      setData((prevData) => [...prevData, newData]);
      setPosition({
        x: mapValueToRange(match[8], 0, 360, -180, 180),
        y: mapValueToRange(match[6], 0, 360, -180, 180),
        z: mapValueToRange(match[7], 0, 360, -180, 180),
      });
    }
  });

  events.on("streamEnded", () => {
    setCanexport(true);
    setConnected(false);
    getPorts();
  });

  events.on("dataExported", () => {
    alert("Data Exported Successfully");
    refrestData()
  })

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
    window.addEventListener("beforeunload", async () => {
      extensions.dispatch(
        "js.thrusttech.ground-system",
        "windowClose",
        "closed"
      );
      setConnected(false);
      setBackendConnected(false);
    });
    refrestData();
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
          {connected && backendConnected && (
            <div className={`px-5 text-green-600`}>Connected&nbsp;●</div>
          )}
          {!connected && backendConnected && (
            <div className={`px-5 text-yellow-600`}>
              Waiting&nbsp;for&nbsp;data...
            </div>
          )}
          {!backendConnected && (
            <div className="px-5 text-red-600">
              Server&nbsp;Not&nbsp;Connected
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
        </div>
      </div>
      <div className="flex flex-wrap justify-center w-full bg-slate-900 absolute p-2 lg:p-5 space-x-2 space-y-2 lg:overflow-hidden overflow-scroll hide-scroll">
        <span></span>
        <Model rotation={position} />
        <Chart
          name={"Latitude"}
          data={data.slice(-20).map((item) => ({ uv: item.lat }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
        <Chart
          name={"Longitude"}
          data={data.slice(-20).map((item) => ({ uv: item.long }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
        <Chart
          name={"Altitude"}
          data={data.slice(-20).map((item) => ({ uv: item.alt }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
        <Chart
          name={"Angle-X"}
          data={data.slice(-10).map((item) => ({ uv: item.angx }))}
          domainLeft={-90}
          domainRight={90}
        />
        <Chart
          name={"Angle-Y"}
          data={data.slice(-10).map((item) => ({ uv: item.angy }))}
          domainLeft={-90}
          domainRight={90}
        />
        <Chart
          name={"Angle-Z"}
          data={data.slice(-10).map((item) => ({ uv: item.angz }))}
        />
        <Chart
          name={"Acceleration-X"}
          data={data.slice(-10).map((item) => ({ uv: item.accelx }))}
          domainLeft={-5}
          domainRight={5}
        />
        <Chart
          name={"Acceleration-Y"}
          data={data.slice(-10).map((item) => ({ uv: item.accely }))}
          domainLeft={-5}
          domainRight={5}
        />
        <Chart
          name={"Acceleration-Z"}
          data={data.slice(-10).map((item) => ({ uv: item.accelz }))}
          domainLeft={-5}
          domainRight={5}
        />
        <Chart
          name={"Temprature 1"}
          data={data.slice(-20).map((item) => ({ uv: item.temp1 }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
        <Chart
          name={"Temprature 2"}
          data={data.slice(-20).map((item) => ({ uv: item.temp2 }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
        <Chart
          name={"Pressure"}
          data={data.slice(-20).map((item) => ({ uv: item.press }))}
          domainLeft={"auto"}
          domainRight={"auto"}
        />
      </div>
    </>
  );
}

export default App;
