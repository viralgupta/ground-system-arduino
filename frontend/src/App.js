import { useEffect, useState } from 'react'
import Chart from './Chart';
import Model from './3dView';

function App() {
  const [connected, setConnected] = useState(false);
  const [canexport, setCanexport] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 })
  const [data, setData] = useState([
    {
      time: 0,
      alt: 0,
      accx: 0,
      accy: 0,
      accz: 0,
      gyrox: 0,
      gyroy: 0,
      gyroz: 0,
      lat: 0,
      long: 0
    }
  ])

  function mapValueToRange(value, oldMin, oldMax, newMin, newMax) {
    const oldValueRange = oldMax - oldMin;
    const newValueRange = newMax - newMin;

    const normalizedValue = (value - oldMin) / oldValueRange;
    const newValue = normalizedValue * newValueRange + newMin;

    return newValue;
  }


  const getPorts = async () => {
    const res = await fetch("http://localhost:5000/api/ports", { method: "GET" });
    const response = await res.json()
    const selectElement = document.getElementById('ports');
    const doption = document.createElement('option');
    doption.defaultSelected = true;
    doption.text = "Select Port";
    selectElement.add(doption)
    response.ports.forEach(port => {
      const option = document.createElement('option');
      option.value = port;
      option.text = port;
      selectElement.add(option);
    });
  }

  let eventSource

  const getDataStream = async (port) => {
    eventSource = new EventSource(`http://localhost:5000/api/getstream/${port}`);
    eventSource.onmessage = function (event) {
      setCanexport(false)
      setConnected(true);
      const data = event.data;
      let match = data.match(/alt:(.*), acc-x:(.*), acc-y:(.*), acc-z:(.*), lat:(.*), long:(.*), gyro-x:(.*), gyro-y:(.*), gyro-z:(.*)/);
      if (match) {
        const newData = {
          time: 0, // Set the appropriate time value
          alt: parseFloat(match[1]),
          accx: parseFloat(match[2]),
          accy: parseFloat(match[3]),
          accz: parseFloat(match[4]),
          gyrox: parseFloat(match[7]),
          gyroy: parseFloat(match[8]),
          gyroz: parseFloat(match[9]),
          lat: parseFloat(match[5]),
          long: parseFloat(match[6]),
        };
        setData((prevData) => [...prevData, newData]);
        setPosition({
          x: mapValueToRange(match[2], -2, 2, -180, 180),
          y: 0,
          z: 0,
        });
      };

      eventSource.onerror = function () {
        eventSource.close();
        setCanexport(true)
        setConnected(false);
        getPorts();
      };
    };

    window.addEventListener('beforeunload', async () => {
      eventSource.close();
      setConnected(false);
    });
  }

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
    const options = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
    };
    const formattedDate = currentDate.toLocaleString('en-IN', options);
    a.download = `${formattedDate}.xlsx`;
    document.body.appendChild(a);
    a.click();
  
    window.URL.revokeObjectURL(url);
    setCanexport(false)
  };
  

  useEffect(() => {
    const selectElement = document.getElementById('ports');
    selectElement.addEventListener('focus', function () {
      selectElement.innerHTML = ''
      getPorts()
    });
    selectElement.addEventListener('change', function () {
      if (selectElement.value !== "Select Port") {
        getDataStream(selectElement.value)
      }
      selectElement.blur();
    });
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <div className='bg-black w-full h-20 text-white text-3xl px-10 font-mono flex items-center justify-between'>
        <span className='flex'>Thrust&nbsp;Tech&nbsp;India<img src="tt.png" alt="Thrust Tech logo" className='h-10' /></span>
        <div className='flex'>
          {connected && <div className={`px-5 text-green-600`}>Connected&nbsp;●</div>}
          {!connected && <div className={`px-5 text-red-600`}>Waiting&nbsp;for&nbsp;data...</div>}
          <select id="ports" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option defaultValue>Select Port</option>
          </select>
          <button onClick={exportData} disabled={!canexport} className='bg-green-600 text-base p-2 rounded-md mx-2 disabled:cursor-not-allowed disabled:bg-green-200 cursor-pointer'>Export</button>
        </div>
      </div>
      <div className='flex flex-wrap  w-full bg-slate-900 absolute p-2 lg:p-5 space-x-2 space-y-2 lg:overflow-hidden overflow-scroll'>
        <span></span>
        <Model rotation={position} />
        <Chart name={"Latitude"} data={data.map((item) => ({ uv: item.long }))} />
        <Chart name={"Longitued"} data={data.map((item) => ({ uv: item.lat }))} />
        <Chart name={"Accelerometer-X"} data={data.slice(-10).map((item) => ({ uv: item.accx }))} />
        <Chart name={"Accelerometer-Y"} data={data.slice(-10).map((item) => ({ uv: item.accy }))} />
        <Chart name={"Accelerometer-Z"} data={data.slice(-10).map((item) => ({ uv: item.accz }))} />
        <Chart name={"GyroScope-X"} data={data.slice(-10).map((item) => ({ uv: item.gyrox }))} />
        <Chart name={"GyroScope-Y"} data={data.slice(-10).map((item) => ({ uv: item.gyroy }))} />
        <Chart name={"GyroScope-Z"} data={data.slice(-10).map((item) => ({ uv: item.gyroz }))} />
        <Chart name={"Altitude"} data={data.map((item) => ({ uv: item.alt }))} />
      </div>
    </>
  );
}

export default App;
