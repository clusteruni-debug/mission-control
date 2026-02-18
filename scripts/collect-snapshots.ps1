param(
  [string]$BaseUrl = $(if ($env:MC_BASE_URL) { $env:MC_BASE_URL } else { "http://localhost:3000" }),
  [string]$Token = $env:COLLECTOR_SECRET
)

# 등록:
# schtasks /create /tn "MissionControl-Collector" /tr "powershell -ExecutionPolicy Bypass -File C:\Users\.박준희\Desktop\바이브코딩\projects\mission-control\scripts\collect-snapshots.ps1" /sc minute /mo 5 /f
# 해제:
# schtasks /delete /tn "MissionControl-Collector" /f

$ErrorActionPreference = "Continue"
$logDir = Join-Path $env:TEMP "vibe-coding-logs"
$logFile = Join-Path $logDir "collector.log"
$maxLogBytes = 100MB

function Ensure-LogDir {
  New-Item -Path $logDir -ItemType Directory -Force | Out-Null
}

function Rotate-LogIfNeeded {
  if (-not (Test-Path $logFile)) { return }
  $size = (Get-Item $logFile).Length
  if ($size -lt $maxLogBytes) { return }
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $archived = Join-Path $logDir ("collector-{0}.log" -f $stamp)
  Move-Item -Path $logFile -Destination $archived -Force
}

function Write-Log([string]$Message) {
  Rotate-LogIfNeeded
  $line = ("[{0}] {1}" -f (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"), $Message)
  try {
    [System.IO.File]::AppendAllText($logFile, $line + [Environment]::NewLine, [System.Text.Encoding]::UTF8)
  } catch {
    # logging failure should never break scheduler run
  }
}

function Invoke-CollectorPost([string]$Path, [hashtable]$Headers) {
  $url = "{0}{1}" -f $BaseUrl.TrimEnd('/'), $Path
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $resp = Invoke-WebRequest -Method Post -Uri $url -Headers $Headers -TimeoutSec 20 -UseBasicParsing
    $sw.Stop()
    Write-Log ("{0} http={1} elapsed_ms={2}" -f $Path, [int]$resp.StatusCode, [int]$sw.ElapsedMilliseconds)
  } catch {
    $sw.Stop()
    $status = $_.Exception.Response.StatusCode.value__
    if ($status) {
      Write-Log ("{0} http={1} elapsed_ms={2} err={3}" -f $Path, $status, [int]$sw.ElapsedMilliseconds, $_.Exception.Message)
    } else {
      Write-Log ("{0} failed elapsed_ms={1} err={2}" -f $Path, [int]$sw.ElapsedMilliseconds, $_.Exception.Message)
    }
  }
}

Ensure-LogDir
Write-Log ("collector start base={0}" -f $BaseUrl)

if (-not $Token) {
  Write-Log "missing COLLECTOR_SECRET (skip this run)"
  exit 0
}

$headers = @{ Authorization = "Bearer $Token" }
Invoke-CollectorPost -Path "/api/snapshot" -Headers $headers
Invoke-CollectorPost -Path "/api/trades-sync" -Headers $headers
Write-Log "collector done"
exit 0

