@echo off
setlocal enabledelayedexpansion

set DIRNAME=%~dp0
set /A NO_START=0

:GETOPTS
if /I "%1"=="-h" (
    echo Usage: %~nx0% [-n] [-t /path/to/test/directory]
    echo -n: do not start a new cql-translation-service container
    exit 1
)
if /I "%1"=="-n" (
    set /A NO_START = 1 & shift
)
if /I "%1" == "-t" set TEST_DIR=%2 & shift
shift
if not "%1" == "" goto GETOPTS

:: Don't start new container if user wants to keep existing running server
if %NO_START%==0 (
    echo ^> Starting cql-translation-service
    for /f %%i in ('docker ps ^| find "cql-translation-service"') do if not %%i==0 echo ^> Stopping existing container && docker stop %%i

    docker run --name cql-translation-service --rm -d -p 8080:8080 cqframework/cql-translation-service:latest

    :: Wait for cql-translation-service
    echo ^> Waiting for server
    :Waiting
    echo | set /p="."
    timeout /t 1 > nul
    curl --silent http://localhost:8080/cql/translator > nul
    if errorlevel 1 goto Waiting
)

echo ^> Translating CQL

call node %DIRNAME%/buildElm.js
if errorlevel 1 exit 1

echo ^> Running unit tests

call jest --testPathPattern=%TEST_DIR%

if %NO_START%==0 (
    echo ^> Stopping cql-translation-service
    docker stop cql-translation-service
)