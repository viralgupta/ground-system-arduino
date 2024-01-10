@echo off

echo Retrieving IPv4 address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4 Address"') do set ip=%%a
set ip=%ip:~1%

echo Installing dependencies...
CALL npm install

echo Running npm start on http://%ip%:3000
npm run start -- --host %ip%

echo Opening %ip%:3000 in the default web browser...
start http://%ip%:3000/

pause
