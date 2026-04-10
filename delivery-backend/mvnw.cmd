@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a keystroke before ending
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@REM Begin all REM lines with a '@' in case MAVEN_BATCH_ECHO is 'on'
@echo off
@REM set title of command prompt window
title %0
@REM enable echoing by setting MAVEN_BATCH_ECHO to 'on'
@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@REM set %HOME% to equivalent of $HOME
if "%HOME%" == "" (set "HOME=%USERPROFILE%")

@REM Execute a user defined script before this one
if not "%MAVEN_SKIP_RC%" == "on" (
  if exist "%HOME%\mavenrc_pre.bat" call "%HOME%\mavenrc_pre.bat"
)

setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.\

set "MAVEN_PROJECTBASEDIR=%DIRNAME%"
:findBaseDir
if exist "%MAVEN_PROJECTBASEDIR%\.mvn" goto baseDirFound
set "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR%..\"
goto findBaseDir

:baseDirFound
@REM Remove trailing backslash from MAVEN_PROJECTBASEDIR
set "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR%"
if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

set "W_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set "W_PROP=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"

if exist "%W_JAR%" goto boot
if not exist "%W_PROP%" (
  echo Could not find %W_PROP% >&2
  exit /b 1
)

echo Downloading Maven Wrapper...
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', '%W_JAR%') }"

:boot
set "JAVA_EXE=java.exe"
if not "%JAVA_HOME%" == "" set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"

set "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"

"%JAVA_EXE%" %MAVEN_OPTS% -classpath "%W_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" %WRAPPER_LAUNCHER% %*

if "%MAVEN_BATCH_PAUSE%" == "on" pause

if "%MAVEN_SKIP_RC%" == "on" goto end
if exist "%HOME%\mavenrc_post.bat" call "%HOME%\mavenrc_post.bat"

:end
exit /b %ERRORLEVEL%
