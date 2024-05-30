/// <reference types="vite/client" />

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

interface Window {
  // expose in the `electron/preload/index.ts`
  // ipcRenderer: import('electron').IpcRenderer
  backend: {
    getPorts: () => Promise<{
      ports: string[];
    }>;
    writePort: (data: string) => Promise<{
      message: string;
      success: boolean;
    }>;
    saveData: () => Promise<{
      message: string;
      success: boolean;
      path: string;
    }>;
    getStream: (port: string) => Promise<void>;
    closeStream: () => void;
    getData: () => Data[];
    getPosition: () => {
      x: number;
      y: number;
      z: number;
    };
    showSavedFile: (path: string) => void;
  };
}
