@echo off
REM BizPrompt Vault - Automated Deployment to Hostinger
REM Usage: auto-deploy.bat

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   BizPrompt Vault - Auto Deploy
echo   Target: root@141.136.44.168
echo ========================================
echo.

REM Configuration
set REMOTE_USER=root
set REMOTE_HOST=141.136.44.168
set REMOTE_PATH=/var/www/html
set LOCAL_BUILD_DIR=out

REM Step 1: Build
echo [1/4] Building production bundle...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

if not exist "%LOCAL_BUILD_DIR%" (
    echo ERROR: Build output not found!
    pause
    exit /b 1
)
echo       Build complete!
echo.

REM Step 2: Copy .htaccess to build folder
echo [2/4] Preparing deployment files...
copy /Y "public\.htaccess" "%LOCAL_BUILD_DIR%\.htaccess" >nul 2>&1
echo       Files ready!
echo.

REM Step 3: Deploy via SCP
echo [3/4] Uploading to Hostinger...
echo       Connecting to %REMOTE_HOST%...
scp -r "%LOCAL_BUILD_DIR%\*" "%LOCAL_BUILD_DIR%\.htaccess" %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/
if errorlevel 1 (
    echo ERROR: Upload failed! Check your SSH connection.
    pause
    exit /b 1
)
echo       Upload complete!
echo.

REM Step 4: Set permissions
echo [4/4] Setting file permissions...
ssh %REMOTE_USER%@%REMOTE_HOST% "chmod -R 755 %REMOTE_PATH% && echo 'Permissions set successfully'"
if errorlevel 1 (
    echo WARNING: Could not set permissions. You may need to do this manually.
)
echo.

echo ========================================
echo   DEPLOYMENT SUCCESSFUL!
echo ========================================
echo.
echo   Your site is now live at:
echo   http://141.136.44.168
echo.
echo ========================================

pause
endlocal
