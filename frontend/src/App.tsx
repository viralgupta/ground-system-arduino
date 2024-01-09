import { useEffect, useState } from 'react'
import Chart from './Chart';
import Model from './3dView';

function App() {
  const [connected, setConnected] = useState(false);
  const [canexport, setCanexport] = useState(false)
  const [position, setPosition] = useState({ x: 180, y: 0, z: 0 })
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
      press: 0
    }
  ])

  function mapValueToRange(value: number, oldMin: number, oldMax: number, newMin: number, newMax: number) {
    const oldValueRange = oldMax - oldMin;
    const newValueRange = newMax - newMin;

    const normalizedValue = (value - oldMin) / oldValueRange;
    const newValue = normalizedValue * newValueRange + newMin;

    return newValue;
  }


  const getPorts = async () => {
    const res = await fetch("http://localhost:5000/api/ports", { method: "GET" });
    const response: {ports: string[]} = await res.json()
    const selectElement = document.getElementById('ports') as HTMLSelectElement;
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

  let eventSource: EventSource;

  const getDataStream = async (port: string) => {
    eventSource = new EventSource(`http://localhost:5000/api/getstream/${port}`);
    eventSource.onmessage = function (event) {
      setCanexport(false)
      setConnected(true);
      const data = event.data;
      console.log("data", data)
      let match = data.match(/(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+) ,(-?[\d.]+)/);
      console.log("match", match)
      if (match && match[1] && match[2] && match[3] && match[4] && match[5] && match[6] && match[7] && match[8] && match[9] && match[10] && match[11] && match[12]) {
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
          x: mapValueToRange(match[7], 0, 360, -180, 180),
          y: mapValueToRange(match[9], 0, 360, -180, 180),
          z: mapValueToRange(match[8], 0, 360, -180, 180),
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
    const options: Intl.DateTimeFormatOptions = {
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
    const selectElement = document.getElementById('ports') as HTMLSelectElement;
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
          <option value="">Select Port</option>
          </select>
          <button onClick={exportData} disabled={!canexport} className='bg-green-600 text-base p-2 rounded-md mx-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-green-300 cursor-pointer'>Export</button>
        </div>
      </div>
      <div className='flex flex-wrap justify-center w-full bg-slate-900 absolute p-2 lg:p-5 space-x-2 space-y-2 lg:overflow-hidden overflow-scroll'>
        <span></span>
        <Chart name={"Latitude"} data={data.map((item) => ({ uv: item.lat }))} />
        <Chart name={"Longitude"} data={data.map((item) => ({ uv: item.long }))} />
        <Chart name={"Angle-X"} data={data.slice(-10).map((item) => ({ uv: item.angx }))} />
        <Chart name={"Angle-Y"} data={data.slice(-10).map((item) => ({ uv: item.angy }))} />
        <Chart name={"Angle-Z"} data={data.slice(-10).map((item) => ({ uv: item.angz }))} />
        <Chart name={"Acceleration-X"} data={data.slice(-10).map((item) => ({ uv: item.accelx }))} />
        <Chart name={"Acceleration-Y"} data={data.slice(-10).map((item) => ({ uv: item.accely }))} />
        <Chart name={"Acceleration-Z"} data={data.slice(-10).map((item) => ({ uv: item.accelz }))} />
        <Chart name={"Altitude"} data={data.map((item) => ({ uv: item.alt }))} />        
        <Chart name={"Temprature 1"} data={data.map((item) => ({ uv: item.temp1 }))} />        
        <Chart name={"Temprature 2"} data={data.map((item) => ({ uv: item.temp2 }))} />        
        <Chart name={"Pressure"} data={data.map((item) => ({ uv: item.press }))} />        
        <Model rotation={position} />
      </div>
    </>
  );
}

export default App;
