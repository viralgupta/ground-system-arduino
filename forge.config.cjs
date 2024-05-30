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
  // first fix the chunk size problem
  // hooks: {
  //   prePackage: async () => {
  //     return new Promise((resolve, reject) => {
  //       exec('npm run build', (error, stdout, stderr) => {
  //         if (error) {
  //           console.error(`Error executing npm run build: ${error.message}`);
  //           return reject(error);
  //         }
  //         if (stderr) {
  //           console.error(`stderr: ${stderr}`);
  //           return reject(new Error(stderr));
  //         }
  //         console.log(`stdout: ${stdout}`);
  //         resolve();
  //       });
  //     });
  //   }
  // }
};
