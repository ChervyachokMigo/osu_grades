@echo off
echo config sample will be copy, if you sure press any key;
pause
xcopy misc\config-sample.json data\* /E /S /Q /Y /F
rename data\config-sample.json config.json
start data\config.json
pause