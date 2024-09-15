const { exec } = require('child_process');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: "public/favicon.ico",
    arch: "x64",
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "ground_system_tt",
        title: "Ground System Thrust Tech",
        authors: "Viral Gupta",
        description: "Ground System Thrust Tech",
        iconUrl: "https://www.thrusttechindia.in/favicon.ico",
        setupExe: "GroundSystemTT.exe",
        setupIcon: "public/favicon.ico",
      },
    }
  ],
};
