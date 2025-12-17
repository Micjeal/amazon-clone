# PowerShell script to update all shopping cart emojis to SVG logos

$logoSvgReplacement = @"
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bagGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" /><stop offset="50%" style="stop-color:#FF8E53;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" /></linearGradient></defs><path d="M6 10L8 26C8.2 27.7 9.6 29 11.3 29H20.7C22.4 29 23.8 27.7 24 26L26 10H6Z" fill="url(#bagGradient)" stroke="url(#bagGradient)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 13V8C11 5.2 13.2 3 16 3C18.8 3 21 5.2 21 8V13" stroke="url(#bagGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="16" r="1.5" fill="#FFF"/><circle cx="20" cy="16" r="1.5" fill="#FFF"/></svg>
"@

$cartSvgReplacement = @"
<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cartGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" /><stop offset="50%" style="stop-color:#FF8E53;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" /></linearGradient></defs><path d="M6 10L8 26C8.2 27.7 9.6 29 11.3 29H20.7C22.4 29 23.8 27.7 24 26L26 10H6Z" fill="url(#cartGradient)" stroke="url(#cartGradient)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 13V8C11 5.2 13.2 3 16 3C18.8 3 21 5.2 21 8V13" stroke="url(#cartGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="16" r="1.5" fill="#FFF"/><circle cx="20" cy="16" r="1.5" fill="#FFF"/></svg>
"@

$files = Get-ChildItem -Path "c:\Users\Admin\OneDrive\Desktop\AMAZON" -Filter "*.html" -Recurse
$count = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Replace logo-icon emoji
    $content = $content -replace '<span class="logo-icon">🛒</span>', "<span class=`"logo-icon`">$logoSvgReplacement</span>"
    
    # Replace cart-icon emoji  
    $content = $content -replace '<span class="cart-icon">🛒</span>', "<span class=`"cart-icon`">$cartSvgReplacement</span>"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.Name)"
        $count++
    }
}

Write-Host "`nTotal files updated: $count"
