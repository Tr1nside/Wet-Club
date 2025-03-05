# Укажите путь к вашему локальному репозиторию
$repoPath = "C:\Users\Chertila\Documents\GitHub\Wet-Club"

# Ветка, из которой обновляемся
$branchName = "main"

# Функция для автоматического pull
function AutoPull {
    Set-Location $repoPath

    # Проверяем, есть ли новые изменения в удалённом репозитории
    $localHash = git rev-parse HEAD
    $remoteHash = git ls-remote origin -h refs/heads/$branchName | ForEach-Object { $_ -split "`t" } | Select-Object -First 1

    if ($localHash -ne $remoteHash) {
        Write-Host "Обнаружены новые изменения. Выполняем git pull..."
        git pull origin $branchName
        Write-Host "Репозиторий обновлён."
    } else {
        Write-Host "Обновлений нет."
    }
}

Write-Host "Скрипт автообновления запущен. Нажмите Ctrl+C для остановки."

# Бесконечный цикл для проверки обновлений каждые 10 секунд
while ($true) {
    AutoPull
    Start-Sleep -Seconds 10
}
