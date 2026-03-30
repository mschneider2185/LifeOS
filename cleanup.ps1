# ============================================================
# LifeOS Repo Cleanup Script (PowerShell)
# Run from F:\LifeOS
# ============================================================

Write-Host "=== LifeOS Repo Cleanup ===" -ForegroundColor Cyan
Write-Host ""

# -----------------------------------------------------------
# Step 1: Check what's in the mind-map-pro subfolder
# -----------------------------------------------------------
Write-Host "[1/7] Checking mind-map-pro subfolder..." -ForegroundColor Yellow

if (Test-Path ".\mind-map-pro") {
    $mmpContents = Get-ChildItem ".\mind-map-pro" -Force | Select-Object Name
    Write-Host "Contents of mind-map-pro/:" -ForegroundColor Gray
    $mmpContents | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    
    # Check if it has a .git folder (it's a separate clone)
    if (Test-Path ".\mind-map-pro\.git") {
        Write-Host "  -> This is a separate git clone. Safe to delete." -ForegroundColor Green
    }
    
    $confirm = Read-Host "Delete mind-map-pro subfolder? (y/n)"
    if ($confirm -eq "y") {
        Remove-Item -Recurse -Force ".\mind-map-pro"
        Write-Host "  Deleted." -ForegroundColor Green
    } else {
        Write-Host "  Skipped. You can delete it later." -ForegroundColor Yellow
    }
} else {
    Write-Host "  Not found, skipping." -ForegroundColor Gray
}

Write-Host ""

# -----------------------------------------------------------
# Step 2: Gitignore the Cowork folder
# -----------------------------------------------------------
Write-Host "[2/7] Adding Cowork folder to .gitignore..." -ForegroundColor Yellow

$gitignorePath = ".\.gitignore"
$coworkEntry = "`nLifeOS*Product*System/"
$coworkEntry2 = "LifeOS — Product & System/"

if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -Raw
    if ($gitignoreContent -notmatch "LifeOS") {
        Add-Content $gitignorePath "`n# Cowork project docs (local only)`n$coworkEntry2"
        Write-Host "  Added to .gitignore" -ForegroundColor Green
    } else {
        Write-Host "  Already in .gitignore" -ForegroundColor Gray
    }
} else {
    Write-Host "  .gitignore not found!" -ForegroundColor Red
}

Write-Host ""

# -----------------------------------------------------------
# Step 3: Move planning docs to /docs
# -----------------------------------------------------------
Write-Host "[3/7] Moving planning docs to /docs..." -ForegroundColor Yellow

if (-not (Test-Path ".\docs")) {
    New-Item -ItemType Directory -Path ".\docs" | Out-Null
}

$planningDocs = @(
    "lifeos-agency-workflow.md",
    "lifeos-existing-codebase-v2.md",
    "lifeos-personality-engine.md",
    "lifeos-product-knowledge.md",
    "lifeos-supabase-setup.md"
)

foreach ($doc in $planningDocs) {
    if (Test-Path ".\$doc") {
        Move-Item ".\$doc" ".\docs\$doc" -Force
        Write-Host "  Moved $doc -> docs/" -ForegroundColor Green
    } else {
        Write-Host "  $doc not found, skipping" -ForegroundColor Gray
    }
}

# Also move the DISC implementation readme to docs
if (Test-Path ".\DISC_IMPLEMENTATION_README.md") {
    Move-Item ".\DISC_IMPLEMENTATION_README.md" ".\docs\DISC_IMPLEMENTATION_README.md" -Force
    Write-Host "  Moved DISC_IMPLEMENTATION_README.md -> docs/" -ForegroundColor Green
}

Write-Host ""

# -----------------------------------------------------------
# Step 4: Replace CLAUDE.md (you already downloaded the new one)
# -----------------------------------------------------------
Write-Host "[4/7] Replace CLAUDE.md..." -ForegroundColor Yellow
Write-Host "  -> Copy the new CLAUDE.md from your downloads to F:\LifeOS\CLAUDE.md" -ForegroundColor White
Write-Host "  (overwrite the existing one)" -ForegroundColor Gray
Write-Host ""

# -----------------------------------------------------------
# Step 5: Replace database-setup.sql
# -----------------------------------------------------------
Write-Host "[5/7] Replace database-setup.sql..." -ForegroundColor Yellow
Write-Host "  -> Copy the new lifeos-database-setup.sql from downloads" -ForegroundColor White
Write-Host "  -> Rename it to database-setup.sql and overwrite the existing one" -ForegroundColor Gray
Write-Host ""

# -----------------------------------------------------------
# Step 6: Add new files
# -----------------------------------------------------------
Write-Host "[6/7] Add new TypeScript files..." -ForegroundColor Yellow
Write-Host "  -> Copy types/lifeos.ts into F:\LifeOS\types\" -ForegroundColor White
Write-Host "  -> Copy lib/personality-config.ts into F:\LifeOS\lib\" -ForegroundColor White
Write-Host ""

# -----------------------------------------------------------
# Step 7: Update package.json name
# -----------------------------------------------------------
Write-Host "[7/7] Updating package.json name..." -ForegroundColor Yellow

if (Test-Path ".\package.json") {
    $pkg = Get-Content ".\package.json" -Raw
    if ($pkg -match '"name":\s*"mind-map-pro"') {
        $pkg = $pkg -replace '"name":\s*"mind-map-pro"', '"name": "lifeos-app"'
        Set-Content ".\package.json" $pkg -NoNewline
        Write-Host "  Updated package.json name to 'lifeos-app'" -ForegroundColor Green
    } elseif ($pkg -match '"name":\s*"lifeos-app"') {
        Write-Host "  Already set to 'lifeos-app'" -ForegroundColor Gray
    } else {
        Write-Host "  Could not find name field to update" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Cleanup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Remaining manual steps:" -ForegroundColor White
Write-Host "  1. Copy downloaded files (CLAUDE.md, database-setup.sql, types/lifeos.ts, lib/personality-config.ts)" -ForegroundColor Gray
Write-Host "  2. Create lifeos-app repo on GitHub" -ForegroundColor Gray
Write-Host "  3. Run:" -ForegroundColor Gray
Write-Host '     git remote set-url origin https://github.com/mschneider2185/lifeos-app.git' -ForegroundColor White
Write-Host '     git add -A' -ForegroundColor White
Write-Host '     git commit -m "chore: fork mind-map-pro -> lifeos-app with unified schema"' -ForegroundColor White
Write-Host '     git push -u origin main' -ForegroundColor White
Write-Host ""
