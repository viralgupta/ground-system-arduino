// const { FusesPlugin } = require('@electron-forge/plugin-fuses');
// const { FuseV1Options, FuseVersion } = require('@electron/fuses');

// module.exports = {
//   packagerConfig: {
//     asar: true,
//     icon: "public/favicon.ico",
//     arch: "x64",
//   },
//   rebuildConfig: {},
//   makers: [
//     {
//       name: '@electron-forge/maker-squirrel',
//       config: {
//         name: "ground_system_tt",
//         title: "Ground System Thrust Tech",
//         authors: "Viral Gupta",
//         description: "Ground System Thrust Tech",
//         iconUrl: "https://www.thrusttechindia.in/favicon.ico",
//         setupExe: "GroundSystemTT.exe",
//         setupIcon: "public/favicon.ico",
//       },
//     }
//   ],
//   // plugins: [
//   //   {
//   //     name: '@electron-forge/plugin-auto-unpack-natives',
//   //     config: {},
//   //   },
//   //   // Fuses are used to enable/disable various Electron functionality
//   //   // at package time, before code signing the application
//   //   new FusesPlugin({
//   //     version: FuseVersion.V1,
//   //     [FuseV1Options.RunAsNode]: false,
//   //     [FuseV1Options.EnableCookieEncryption]: true,
//   //     [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
//   //     [FuseV1Options.EnableNodeCliInspectArguments]: false,
//   //     [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
//   //     [FuseV1Options.OnlyLoadAppFromAsar]: true,
//   //   }),
//   // ],
// };

const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
