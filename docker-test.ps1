# Test script to verify the Docker build works locally
# Run this after rebuilding the Docker image

Write-Host "Testing Docker container..." -ForegroundColor Green

# Run container in detached mode
$containerId = docker run -d -p 3000:3000 --name qms-test qms-backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "Container started successfully!" -ForegroundColor Green
    Write-Host "Container ID: $containerId" -ForegroundColor Yellow
    
    # Wait a moment for startup
    Start-Sleep -Seconds 3
    
    # Check if container is still running
    $status = docker ps --filter "name=qms-test" --format "table {{.Status}}"
    Write-Host "Container status: $status" -ForegroundColor Yellow
    
    # Show logs
    Write-Host "`nContainer logs:" -ForegroundColor Green
    docker logs qms-test
    
    # Cleanup
    Write-Host "`nCleaning up test container..." -ForegroundColor Green
    docker stop qms-test
    docker rm qms-test
} else {
    Write-Host "Failed to start container!" -ForegroundColor Red
    docker logs qms-test -ErrorAction SilentlyContinue
    docker rm qms-test -ErrorAction SilentlyContinue
}
