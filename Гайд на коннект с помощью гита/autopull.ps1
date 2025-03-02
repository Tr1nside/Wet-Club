# ������� ���� � ������ ���������� �����������
$repoPath = "C:\Users\Chertila\Documents\GitHub\Wet-Club"

# �����, �� ������� �����������
$branchName = "main"

# ������� ��� ��������������� pull
function AutoPull {
    Set-Location $repoPath

    # ���������, ���� �� ����� ��������� � �������� �����������
    $localHash = git rev-parse HEAD
    $remoteHash = git ls-remote origin -h refs/heads/$branchName | ForEach-Object { $_ -split "`t" } | Select-Object -First 1

    if ($localHash -ne $remoteHash) {
        Write-Host "���������� ����� ���������. ��������� git pull..."
        git pull origin $branchName
        Write-Host "����������� �������."
    } else {
        Write-Host "���������� ���."
    }
}

Write-Host "������ �������������� �������. ������� Ctrl+C ��� ���������."

# ����������� ���� ��� �������� ���������� ������ 10 ������
while ($true) {
    AutoPull
    Start-Sleep -Seconds 10
}
