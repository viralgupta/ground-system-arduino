import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

async function createWindow() {
  win = new BrowserWindow({
    title: "Ground System Thrust Tech",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload: preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      nodeIntegration: true,
    },
    minWidth: 1190,
    minHeight: 700,
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml);
  }

  // // Auto update
  // update(win);
}

app.whenReady().then(()=>{
  ipcMain.handle("dialog:openSave", async () => {
    if (!win) return;
    const currentDate = new Date();
    const options1: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    };
    const rawFormattedDate = currentDate.toLocaleString("en-IN", options1).replace(/[^\d]/g, "");
    const formattedDate = rawFormattedDate.substring(0, 2) + "-" + rawFormattedDate.substring(2, 4) + "-" + rawFormattedDate.substring(4, 8) + "_" + rawFormattedDate.substring(8, 10) + "-" + rawFormattedDate.substring(10, 12);
    const {filePath} = await dialog.showSaveDialog(win, {title: "Save Exported Data", defaultPath: `${formattedDate}`, filters: [{name: "XLSX File", extensions: ["xlsx"]}]})
    return filePath == "" ? null : filePath;
  })
  ipcMain.handle("is-dev", () => {
    return VITE_DEV_SERVER_URL ? true : false;
  })
  createWindow();
});

app.on("before-quit", () => {
  if (win) win.webContents.send("close-port");
})

app.on("window-all-closed", () => {
  win = null;
  app.quit();
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
