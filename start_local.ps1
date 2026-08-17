Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Starting ExpenseAnalyzer Local Env" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Ensure clean slate for local Java and Node processes
Write-Host "Cleaning up any dangling Java/Node processes to prevent port conflicts..." -ForegroundColor Yellow
Get-Process java, node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "`nWaiting for Docker to start (for Postgres/Kafka/Redis)..." -ForegroundColor Yellow
$dockerReady = $false
while (-not $dockerReady) {
    $dockerInfo = docker info 2>&1
    if ($dockerInfo -match "Server Version") {
        $dockerReady = $true
    } else {
        Start-Sleep -Seconds 2
    }
}
Write-Host "Docker is up! Starting docker-compose for local dependencies..." -ForegroundColor Green
# Start the default compose file which has zookeeper, kafka, redis
docker-compose up -d

# Check if postgres is running (user might run it locally or via docker prod file)
if (-not (Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet)) {
    Write-Host "WARNING: PostgreSQL is not responding on port 5432. Please ensure PostgreSQL is running!" -ForegroundColor Red
} else {
    Write-Host "PostgreSQL is running on port 5432." -ForegroundColor Green
}

# Wait function
function Wait-ForPort($Port, $ServiceName) {
    Write-Host "Waiting for $ServiceName to initialize on port $Port..." -ForegroundColor Yellow
    while (-not (Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet)) {
        Start-Sleep -Seconds 2
    }
    Write-Host "$ServiceName is UP!" -ForegroundColor Green
}

# Start services with visible windows so errors are visible!
Write-Host "`nStarting Discovery Server (Port 8761)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title Discovery Server && mvnw.cmd spring-boot:run" -WorkingDirectory ".\discovery-server"
Wait-ForPort 8761 "Discovery Server"

Write-Host "`nStarting Config Server (Port 8888)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title Config Server && mvnw.cmd spring-boot:run" -WorkingDirectory ".\config-server"
Wait-ForPort 8888 "Config Server"

Write-Host "`nStarting Auth Service (Port 8081)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title Auth Service && mvnw.cmd spring-boot:run" -WorkingDirectory ".\auth-service"
Wait-ForPort 8081 "Auth Service"

Write-Host "`nStarting Expense Service (Port 8080)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title Expense Service && mvnw.cmd spring-boot:run" -WorkingDirectory ".\expense-service"
Wait-ForPort 8080 "Expense Service"

Write-Host "`nStarting Notification Service (Port 8082)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title Notification Service && mvnw.cmd spring-boot:run" -WorkingDirectory ".\notification-service"
Wait-ForPort 8082 "Notification Service"

Write-Host "`nStarting Vision Service (Port 8000)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title Vision Service && uvicorn main:app --host 0.0.0.0 --port 8000 --reload" -WorkingDirectory ".\vision-service"
Wait-ForPort 8000 "Vision Service"

Write-Host "`nStarting Next.js Frontend (Port 3000)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title Frontend && npm run dev" -WorkingDirectory ".\frontend"
Wait-ForPort 3000 "Frontend"

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  All services successfully launched!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
