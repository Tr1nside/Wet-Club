# Укажите путь к вашему локальному репозиторию
$repoPath = "C:\Users\Chertila\Documents\GitHub\Wet-Club"

# Укажите имя ветки, в которую будут отправляться коммиты (например, main или master)
$branchName = "main"

# Функция для автоматического коммита и пуша
function AutoCommitAndPush {
    # Небольшая задержка для завершения операций записи
    Start-Sleep -Seconds 2

    # Переход в директорию репозитория
    Set-Location $repoPath

    # Добавление всех изменений
    git add .

    # Формирование сообщения коммита с текущей датой и временем
    $commitMessage = "Автокоммит: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

    # Создание коммита (если есть изменения)
    $commitOutput = git commit -m $commitMessage 2>&1

    if ($commitOutput -notmatch "nothing to commit") {
        Write-Host "Создан коммит: $commitMessage"
        # Отправка изменений в удалённый репозиторий
        git push origin $branchName
        Write-Host "Изменения отправлены в удалённый репозиторий."
    }
    else {
        Write-Host "Нет изменений для коммита."
    }
}

# Создание FileSystemWatcher для отслеживания изменений в указанной директории
$fsw = New-Object System.IO.FileSystemWatcher $repoPath -Property @{
    IncludeSubdirectories = $true
    NotifyFilter = [System.IO.NotifyFilters]'LastWrite, FileName, DirectoryName'
}

# Определение действия, которое будет выполняться при срабатывании события
$action = {
    # Чтобы избежать множественных срабатываний, можно добавить простую проверку или задержку
    AutoCommitAndPush
}

# Регистрация событий для отслеживания изменений
Register-ObjectEvent $fsw "Changed" -Action $action | Out-Null
Register-ObjectEvent $fsw "Created" -Action $action | Out-Null
Register-ObjectEvent $fsw "Deleted" -Action $action | Out-Null
Register-ObjectEvent $fsw "Renamed" -Action $action | Out-Null

Write-Host "Автоматический мониторинг изменений запущен. Скрипт работает в фоне. Нажмите Ctrl+C для остановки."

# Бесконечный цикл, чтобы скрипт не завершался
while ($true) {
    Start-Sleep -Seconds 5
}
