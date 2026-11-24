# ============================================
# سحب كود مشروع Next.js بالكامل
# ============================================

param(
    [string]$ProjectPath = ".",                          # مسار المشروع
    [string]$OutputFile = "nextjs-project-code.txt",     # ملف الخروج
    [string]$Extensions = ".js,.jsx,.ts,.tsx,.json,.css,.scss,.sass,.less,.md,.mdx,.html,.mjs,.cjs,.yml,.yaml,.env,.env.local,.env.development,.env.production"  # الامتدادات
)

# تحويل المسار إلى مسار مطلق
$ProjectPath = (Resolve-Path $ProjectPath).Path

# المجلدات المستثناة
$ExcludeDirs = @(
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    "out",
    "coverage",
    ".turbo",
    ".vercel",
    ".idea",
    ".vscode",
    "public\static",
    ".cache",
    "tmp",
    "temp"
)

# الملفات المستثناة
$ExcludeFiles = @(
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "nextjs-project-code.txt"
)

# تقسيم الامتدادات
$ExtList = $Extensions -split "," | ForEach-Object { $_.Trim().ToLower() }

Write-Host "🔍 جاري البحث عن ملفات المشروع..." -ForegroundColor Cyan
Write-Host "📁 المسار: $ProjectPath" -ForegroundColor Gray
Write-Host ""

# جمع كل الملفات
$AllFiles = Get-ChildItem -Path $ProjectPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $file = $_
    
    # استثناء الملفات المحظورة
    if ($ExcludeFiles -contains $file.Name) { return $false }
    
    # استثناء المجلدات المحظورة
    $relativePath = $file.FullName.Substring($ProjectPath.Length).TrimStart('\', '/')
    foreach ($dir in $ExcludeDirs) {
        if ($relativePath -like "$dir\*" -or $relativePath -like "$dir/*" -or $relativePath -eq $dir) {
            return $false
        }
    }
    
    # التحقق من الامتداد
    $ext = $file.Extension.ToLower()
    if ($file.Name -like ".env*") { return $true }
    if ($ExtList -contains $ext) { return $true }
    
    return $false
}

$TotalFiles = $AllFiles.Count
Write-Host "✅ تم العثور على $TotalFiles ملف" -ForegroundColor Green
Write-Host ""

# إنشاء ملف الخروج
$OutputPath = Join-Path $ProjectPath $OutputFile
"" | Out-File -FilePath $OutputPath -Encoding UTF8

# إضافة معلومات المشروع
$Header = @"
========================================
مشروع Next.js - سحب كود كامل
========================================
تاريخ السحب: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
المسار: $ProjectPath
عدد الملفات: $TotalFiles
========================================

"@
$Header | Out-File -FilePath $OutputPath -Encoding UTF8 -Append

# عداد التقدم
$counter = 0

# كتابة كل ملف
foreach ($file in $AllFiles) {
    $counter++
    $relativePath = $file.FullName.Substring($ProjectPath.Length).TrimStart('\', '/')
    
    Write-Progress -Activity "سحب الملفات" -Status "$counter من $TotalFiles : $relativePath" -PercentComplete (($counter / $TotalFiles) * 100)
    
    # كتابة عنوان الملف
    $separator = "=" * 80
    $fileHeader = @"

$separator
📄 الملف: $relativePath
📏 الحجم: $([math]::Round($file.Length / 1KB, 2)) KB
$separator

"@
    $fileHeader | Out-File -FilePath $OutputPath -Encoding UTF8 -Append
    
    # كتابة محتوى الملف
    try {
        # تحديد اللغة لصيغة Markdown
        $lang = switch ($file.Extension.ToLower()) {
            ".js"   { "javascript" }
            ".jsx"  { "jsx" }
            ".ts"   { "typescript" }
            ".tsx"  { "tsx" }
            ".json" { "json" }
            ".css"  { "css" }
            ".scss" { "scss" }
            ".sass" { "sass" }
            ".less" { "less" }
            ".md"   { "markdown" }
            ".mdx"  { "mdx" }
            ".html" { "html" }
            ".yml"  { "yaml" }
            ".yaml" { "yaml" }
            default { "" }
        }
        
        "``````$lang" | Out-File -FilePath $OutputPath -Encoding UTF8 -Append
        Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop | Out-File -FilePath $OutputPath -Encoding UTF8 -Append
        "``````" | Out-File -FilePath $OutputPath -Encoding UTF8 -Append
        "" | Out-File -FilePath $OutputPath -Encoding UTF8 -Append
    }
    catch {
        "❌ خطأ في قراءة الملف: $($_.Exception.Message)" | Out-File -FilePath $OutputPath -Encoding UTF8 -Append
    }
}

Write-Progress -Activity "سحب الملفات" -Completed

Write-Host ""
Write-Host "🎉 تم الانتهاء بنجاح!" -ForegroundColor Green
Write-Host "📄 الملف الناتج: $OutputPath" -ForegroundColor Yellow
Write-Host "📦 الحجم: $([math]::Round((Get-Item $OutputPath).Length / 1KB, 2)) KB" -ForegroundColor Yellow