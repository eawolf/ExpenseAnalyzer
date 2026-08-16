Write-Host "Waiting for Docker to start..."
$dockerReady = $false
while (-not $dockerReady) {
    $dockerInfo = docker info 2>&1
    if ($dockerInfo -match "Server Version") {
        $dockerReady = $true
    } else {
        Start-Sleep -Seconds 2
    }
}
Write-Host "Docker is up! Starting docker-compose..."
docker-compose up -d

Write-Host "Starting Discovery Server (Port 8761)..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c mvnw.cmd spring-boot:run" -WorkingDirectory ".\discovery-server" -WindowStyle Minimized

Write-Host "Waiting for Discovery Server to initialize (Port 8761)..."
while (-not (Test-NetConnection -ComputerName localhost -Port 8761 -InformationLevel Quiet)) {
    Start-Sleep -Seconds 2
}

Write-Host "Starting Config Server (Port 8888)..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c mvnw.cmd spring-boot:run" -WorkingDirectory ".\config-server" -WindowStyle Minimized

Write-Host "Waiting for Config Server to initialize (Port 8888)..."
while (-not (Test-NetConnection -ComputerName localhost -Port 8888 -InformationLevel Quiet)) {
    Start-Sleep -Seconds 2
}

Write-Host "Starting Auth Service (Port 8081)..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c mvnw.cmd spring-boot:run" -WorkingDirectory ".\auth-service" -WindowStyle Minimized

Write-Host "Starting Expense Service (Port 8080)..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c mvnw.cmd spring-boot:run" -WorkingDirectory ".\expense-service" -WindowStyle Minimized

Write-Host "Starting Next.js Frontend (Port 3000)..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory ".\frontend" -WindowStyle Minimized

Write-Host "All services have been launched in background windows!"
