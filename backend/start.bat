@echo off
REM Smart Agriculture API - Quick Start Script for Windows

echo.
echo 🌾 Smart Agriculture API - Setup ^& Run 🌾
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Node.js is not installed. Please install Node.js 16+ first.
  exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js detected: %NODE_VERSION%

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm detected: %NPM_VERSION%

echo.

REM Check if .env exists
if not exist .env (
  echo 📝 Creating .env from .env.example...
  copy .env.example .env
  echo ✅ .env file created. Please edit it with your configuration.
) else (
  echo ✅ .env file already exists
)

echo.
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
  echo ❌ Failed to install dependencies
  exit /b 1
)

echo.
echo ✅ Dependencies installed
echo.
echo 🚀 Starting server in development mode...
echo.
echo Server will run on: http://localhost:5000
echo Health check: http://localhost:5000/health
echo API docs: http://localhost:5000/api
echo.
echo To stop server: Press Ctrl+C
echo.

call npm run dev
