@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\bin\build.js" %*
) ELSE (
  node  "%~dp0\bin\build.js" %*
)