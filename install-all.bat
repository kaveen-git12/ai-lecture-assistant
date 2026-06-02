@echo off
REM Install all dependencies
echo ============================================
echo Installing Root Dependencies...
echo ============================================
cd /d "c:\AI LECTURE ASSISTANT(project1)"
call npm install

echo.
echo ============================================
echo Installing Frontend Dependencies...
echo ============================================
cd /d "c:\AI LECTURE ASSISTANT(project1)\frontend"
call npm install

echo.
echo ============================================
echo Installing Backend Dependencies...
echo ============================================
cd /d "c:\AI LECTURE ASSISTANT(project1)\backend"
call npm install

echo.
echo ============================================
echo All dependencies installed successfully!
echo ============================================
pause
