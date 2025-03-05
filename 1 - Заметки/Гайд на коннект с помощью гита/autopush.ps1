# ������� ���� � ������ ���������� �����������
$repoPath = "C:\Users\Chertila\Documents\GitHub\Wet-Club"

# ������� ��� �����, � ������� ����� ������������ ������� (��������, main ��� master)
$branchName = "main"

# ������� ��� ��������������� ������� � ����
function AutoCommitAndPush {
    # ��������� �������� ��� ���������� �������� ������
    Start-Sleep -Seconds 2

    # ������� � ���������� �����������
    Set-Location $repoPath

    # ���������� ���� ���������
    git add .

    # ������������ ��������� ������� � ������� ����� � ��������
    $commitMessage = "����������: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

    # �������� ������� (���� ���� ���������)
    $commitOutput = git commit -m $commitMessage 2>&1

    if ($commitOutput -notmatch "nothing to commit") {
        Write-Host "������ ������: $commitMessage"
        # �������� ��������� � �������� �����������
        git push origin $branchName
        Write-Host "��������� ���������� � �������� �����������."
    }
    else {
        Write-Host "��� ��������� ��� �������."
    }
}

# �������� FileSystemWatcher ��� ������������ ��������� � ��������� ����������
$fsw = New-Object System.IO.FileSystemWatcher $repoPath -Property @{
    IncludeSubdirectories = $true
    NotifyFilter = [System.IO.NotifyFilters]'LastWrite, FileName, DirectoryName'
}

# ����������� ��������, ������� ����� ����������� ��� ������������ �������
$action = {
    # ����� �������� ������������� ������������, ����� �������� ������� �������� ��� ��������
    AutoCommitAndPush
}

# ����������� ������� ��� ������������ ���������
Register-ObjectEvent $fsw "Changed" -Action $action | Out-Null
Register-ObjectEvent $fsw "Created" -Action $action | Out-Null
Register-ObjectEvent $fsw "Deleted" -Action $action | Out-Null
Register-ObjectEvent $fsw "Renamed" -Action $action | Out-Null

Write-Host "�������������� ���������� ��������� �������. ������ �������� � ����. ������� Ctrl+C ��� ���������."

# ����������� ����, ����� ������ �� ����������
while ($true) {
    Start-Sleep -Seconds 5
}
