@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo  PUBLIC BICYCLE SHARING AND RENTAL MANAGEMENT SYSTEM (PBS-RMS)
echo  GITHUB REPOSITORY PUSH AUTOMATION
echo  Student: SUJAL REDDY ^| Hall Ticket: 2303A51713 ^| Academic Year: 2026-2027
echo  Target: https://github.com/sujalreddy21/PUBLIC-BICYCLE-SHARING-AND-RENTAL-
echo ==============================================================================
echo.

cd /d "%~dp0"

:: 1. Verify git repository status
git status >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Not a valid Git repository directory.
    pause
    exit /b 1
)

:: 2. Ensure remote origin is configured
git remote set-url origin "https://github.com/sujalreddy21/PUBLIC-BICYCLE-SHARING-AND-RENTAL-.git" 2>nul
if %ERRORLEVEL% neq 0 (
    git remote add origin "https://github.com/sujalreddy21/PUBLIC-BICYCLE-SHARING-AND-RENTAL-.git"
)

:: 3. Ensure branch is main
git branch -M main

echo [INFO] Remote URL:
git remote -v
echo.
echo Choose authentication method:
echo   [1] Browser Login via Git Credential Manager (Recommended - pops up browser)
echo   [2] GitHub Personal Access Token (PAT)
echo.
set /p AUTH_CHOICE="Select option [1 or 2, default: 1]: "
if "%AUTH_CHOICE%"=="" set AUTH_CHOICE=1

if "%AUTH_CHOICE%"=="2" (
    echo.
    echo To generate a token: https://github.com/settings/tokens (Select 'repo' scope)
    set /p GITHUB_PAT="Enter your GitHub Personal Access Token: "
    if "!GITHUB_PAT!"=="" (
        echo [ERROR] Token cannot be empty.
        pause
        exit /b 1
    )
    echo.
    echo [INFO] Pushing with Personal Access Token...
    git push https://sujalreddy21:!GITHUB_PAT!@github.com/sujalreddy21/PUBLIC-BICYCLE-SHARING-AND-RENTAL-.git main --force
) else (
    echo.
    echo [INFO] Pushing with Git Credential Manager...
    echo (A browser window or GitHub login dialog will open for authorization)
    git push -u origin main --force
)

if %ERRORLEVEL% equ 0 (
    echo.
    echo ==============================================================================
    echo  SUCCESS! PROJECT PUSHED TO GITHUB REPOSITORY:
    echo  https://github.com/sujalreddy21/PUBLIC-BICYCLE-SHARING-AND-RENTAL-
    echo ==============================================================================
) else (
    echo.
    echo [ERROR] Push failed. If you received a 403 error:
    echo 1. Ensure you are signed in as 'sujalreddy21' in your browser.
    echo 2. Or generate a Personal Access Token with 'repo' scope at:
    echo    https://github.com/settings/tokens
    echo    and choose Option [2].
)

echo.
pause
