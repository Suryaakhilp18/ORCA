# ORCA Unified System Launcher
# SIH 2026 / ISRO Problem Statement SIH26176
# Starts FastAPI Backend (Port 8000) and Next.js Frontend (Port 3000)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ORCA: Marine EcOsystem Reasoning with Collaborative Agents" -ForegroundColor White
Write-Host "  Problem Statement: SIH26176 (ISRO) - Software Track" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$webDir = Join-Path $PSScriptRoot "apps\web"
$pythonExe = Join-Path $PSScriptRoot "venv\Scripts\python.exe"

# 1. Start Backend in separate console
Write-Host "[1/3] Starting ORCA FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
$backendCmd = "`$env:PYTHONPATH = '$backendDir'; & '$pythonExe' -m uvicorn api.main:app --host 127.0.0.1 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WorkingDirectory $backendDir

# 2. Start Frontend in separate console
Write-Host "[2/3] Starting ORCA Next.js Web Console on http://localhost:3000..." -ForegroundColor Green
$frontendCmd = "npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WorkingDirectory $webDir

# 3. Wait and open browser
Start-Sleep -Seconds 4
Write-Host "[3/3] Opening ORCA in default web browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  ORCA IS NOW RUNNING LIVE!" -ForegroundColor White
Write-Host "  • Operations Console: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  • Backend Engine:     http://localhost:8000" -ForegroundColor Cyan
Write-Host "  • API Swagger Docs:   http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Green
