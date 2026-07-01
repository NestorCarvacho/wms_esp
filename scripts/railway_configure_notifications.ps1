# Configura notification-service en Railway (Fase 2)
# Ejecutar desde la raíz del repo con Railway CLI autenticado.
# Requiere plan que permita un 4.º servicio y Redis (Upstash o plugin Railway).

param(
    [Parameter(Mandatory = $true)]
    [string]$NotificationsUrl,

    [Parameter(Mandatory = $true)]
    [string]$RedisUrl,

    [string]$Project = "WMS_ESP",
    [string]$FrontendUrl = "https://wms-frontend-production-296e.up.railway.app",
    [switch]$SkipDeploy
)

$ErrorActionPreference = "Stop"

Write-Host "==> Enlazando proyecto $Project..."
railway link -p $Project | Out-Null

Write-Host "==> Variables wms-notifications..."
railway variable set `
    "REDIS_URL=$RedisUrl" `
    "NOTIFICATIONS_MODE=local" `
    "CORS_ORIGINS=$FrontendUrl" `
    "DEBUG=False" `
    --service wms-notifications `
    --skip-deploys

Write-Host "==> Copiando DATABASE_URL y SECRET_KEY desde wms_esp..."
$dbUrl = (railway variable list --service wms_esp --kv | Select-String "^DATABASE_URL=").ToString().Split("=", 2)[1]
$secret = (railway variable list --service wms_esp --kv | Select-String "^SECRET_KEY=").ToString().Split("=", 2)[1]
railway variable set `
    "DATABASE_URL=$dbUrl" `
    "SECRET_KEY=$secret" `
    --service wms-notifications `
    --skip-deploys

Write-Host "==> Cutover wms_esp -> remote..."
railway variable set `
    "NOTIFICATIONS_MODE=remote" `
    "REDIS_URL=$RedisUrl" `
    --service wms_esp `
    --skip-deploys

Write-Host "==> Frontend build vars..."
railway variable set `
    "VITE_NOTIFICATIONS_API_URL=$NotificationsUrl" `
    "VITE_NOTIFICATIONS_WS_URL=$NotificationsUrl" `
    --service wms-frontend `
    --skip-deploys

if (-not $SkipDeploy) {
    Write-Host "==> Redeploy servicios..."
    railway service link wms-notifications
    railway up --detach -m "notification-service cutover"
    railway service link wms_esp
    railway up --detach -m "NOTIFICATIONS_MODE=remote"
    railway service link wms-frontend
    railway up ./frontend --path-as-root --detach -m "VITE_NOTIFICATIONS_*"
}

Write-Host ""
Write-Host "Listo. Verificar:"
Write-Host "  curl $NotificationsUrl/health"
Write-Host "  curl https://wmsesp-production.up.railway.app/health"
