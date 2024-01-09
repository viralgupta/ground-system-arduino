@echo off
echo Installing dependencies...
CALL npm install

echo Running npm start...
npm run start

echo Opening localhost:3000 in the default web browser...
start http://localhost:3000/

pause
