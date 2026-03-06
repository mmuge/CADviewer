@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   CAD Viewer - GitHub Setup Script
echo ============================================
echo.

REM Check git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed.
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Ask for GitHub username
set /p GH_USER="Enter your GitHub username: "
if "!GH_USER!"=="" (
    echo [ERROR] Username cannot be empty.
    pause
    exit /b 1
)

REM Ask for repo name (default: CADviewer)
set /p REPO_NAME="Enter repo name [CADviewer]: "
if "!REPO_NAME!"=="" set REPO_NAME=CADviewer

echo.
echo [1/5] Initializing git repository...
git init
git branch -M main

echo [2/5] Staging all files...
git add -A

echo [3/5] Creating initial commit...
git commit -m "feat: initial commit - CAD Viewer PWA with measurement tools"

echo [4/5] Adding remote origin...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/!GH_USER!/!REPO_NAME!.git

echo.
echo ============================================
echo NEXT STEPS (manual - takes 1 minute):
echo ============================================
echo.
echo 1. Go to: https://github.com/new
echo 2. Repository name: !REPO_NAME!
echo 3. Set to PUBLIC
echo 4. Do NOT initialize with README (we have one)
echo 5. Click "Create repository"
echo.
echo Then come back here and press any key to push...
echo.
pause

echo [5/5] Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo [ERROR] Push failed. Make sure:
    echo   - The repo exists on GitHub
    echo   - You are logged in ^(run: git config --global credential.helper manager^)
    echo   - Try: git push -u origin main --force
) else (
    echo.
    echo ============================================
    echo SUCCESS! Your repo is live at:
    echo https://github.com/!GH_USER!/!REPO_NAME!
    echo ============================================
    echo.
    echo Next: Deploy to Vercel
    echo Go to: https://vercel.com/new
    echo Import: !GH_USER!/!REPO_NAME!
    echo Build:  npm run build
    echo Output: dist
)

echo.
pause
