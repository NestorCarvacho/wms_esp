# Cutover Fase 2 — notification-service externo (Render/Fly) + Upstash Redis
# Solo actualiza Railway (wms_esp + wms-frontend). El servicio de notificaciones
# debe estar ya desplegado y respondiendo en /health.

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
$NotificationsUrl = $NotificationsUrl.TrimEnd("/")

Write-Host "==> Verificando health de notification-service..."
try {
    $health = Invoke-RestMethod -Uri "$NotificationsUrl/health" -TimeoutSec 60
    if ($health.redis -ne $true) {
        Write-Warning "Health OK pero redis=false. Revisa REDIS_URL en Render/Fly."
    }
    Write-Host "    status=$($health.status) redis=$($health.redis)"
} catch {
    Write-Error "No responde $NotificationsUrl/health. Despliega primero en Render (ver docs/DEPLOY_NOTIFICATIONS_EXTERNAL.md)."
}

Write-Host "==> Enlazando proyecto $Project..."
railway link -p $Project | Out-Null

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
    Write-Host "==> Redeploy wms_esp y wms-frontend..."
    railway service link wms_esp
    railway redeploy --service wms_esp --yes
    railway service link wms-frontend
    railway up ./frontend --path-as-root --detach -m "VITE_NOTIFICATIONS external cutover"
}

Write-Host ""
Write-Host "Cutover aplicado."
Write-Host "  Notifications: $NotificationsUrl/health"
Write-Host "  Monolito:      https://wmsesp-production.up.railway.app/health (notifications_mode=remote)"
