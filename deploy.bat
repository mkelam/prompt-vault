@echo off
REM BizPrompt Vault - Hostinger Deployment Script (Windows)
REM Usage: deploy.bat

setlocal enabledelayedexpansion

echo ======================================
echo   BizPrompt Vault Deployment Script
echo ======================================

REM Configuration
set REMOTE_USER=root
set REMOTE_HOST=141.136.44.168
set REMOTE_PATH=/var/www/html
set LOCAL_BUILD_DIR=out

REM Step 1: Install dependencies
echo.
echo Step 1: Installing dependencies...
call npm ci --production=false
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    exit /b 1
)

REM Step 2: Run tests
echo.
echo Step 2: Running tests...
call npm test -- --passWithNoTests
if errorlevel 1 (
    echo ERROR: Tests failed
    exit /b 1
)

REM Step 3: Build the application
echo.
echo Step 3: Building production bundle...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    exit /b 1
)

REM Check if build directory exists
if not exist "%LOCAL_BUILD_DIR%" (
    echo ERROR: Build failed - %LOCAL_BUILD_DIR% directory not found
    exit /b 1
)

echo Build successful!

REM Step 4: Deploy to Hostinger
echo.
echo Step 4: Deploying to Hostinger...
echo Target: %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%

REM Create backup on remote server
echo Creating backup of current deployment...
ssh %REMOTE_USER%@%REMOTE_HOST% "if [ -d %REMOTE_PATH%/backup ]; then rm -rf %REMOTE_PATH%/backup; fi && if [ -d %REMOTE_PATH%/current ]; then mv %REMOTE_PATH%/current %REMOTE_PATH%/backup; fi"

REM Upload new build using scp
echo Uploading new build...
scp -r %LOCAL_BUILD_DIR%\* %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/

REM Set permissions
echo Setting permissions...
ssh %REMOTE_USER%@%REMOTE_HOST% "chmod -R 755 %REMOTE_PATH%"

echo.
echo ======================================
echo   Deployment Complete!
echo ======================================
echo.
echo Your site should now be live at your domain.
echo If something went wrong, restore the backup with:
echo   ssh %REMOTE_USER%@%REMOTE_HOST% "rm -rf %REMOTE_PATH%/* && mv %REMOTE_PATH%/backup/* %REMOTE_PATH%/"

endlocal
