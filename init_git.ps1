# Check for Git installation
$gitPaths = @(
    "${env:ProgramFiles}\Git\bin\git.exe",
    "${env:ProgramFiles(x86)}\Git\bin\git.exe",
    "${env:LOCALAPPDATA}\Programs\Git\bin\git.exe"
)

$gitFound = $false
$gitCmd = $null

foreach ($path in $gitPaths) {
    if (Test-Path $path) {
        $gitFound = $true
        $gitCmd = $path
        Write-Host "Found Git at: $path"
        break
    }
}

if (-not $gitFound) {
    Write-Host "Git not found! Please install Git first from https://git-scm.com/download/win"
    exit 1
}

# Check if already a git repo
if (Test-Path ".git") {
    Write-Host "This directory is already a Git repository!"
    exit 0
}

# Initialize git repo
Write-Host "Initializing Git repository..."
& $gitCmd init

# Add all files
Write-Host "Adding files..."
& $gitCmd add .

# Make initial commit
Write-Host "Making initial commit..."
& $gitCmd commit -m "Initial commit"

# Add remote
Write-Host "Adding remote repository..."
& $gitCmd remote add origin https://github.com/wangler9121/xignxingtan987.git

Write-Host ""
Write-Host "Git repository initialized successfully!"
Write-Host "Next steps:"
Write-Host "1. Configure your Git user info if needed:"
Write-Host "   git config user.name 'Your Name'"
Write-Host "   git config user.email 'your.email@example.com'"
Write-Host "2. Push to GitHub:"
Write-Host "   git push -u origin main"
Write-Host "   (or git push -u origin master if using master branch)"
