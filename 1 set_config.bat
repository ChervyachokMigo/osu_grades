@echo off
echo config sample will be copy, if you sure press any key;
pause
xcopy misc\config-sample.js data\* /E /S /Q /Y /F
rename data\config-sample.js config.js
start data\config.js
pause