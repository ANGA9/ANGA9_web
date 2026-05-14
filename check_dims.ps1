Add-Type -AssemblyName System.Drawing
Get-ChildItem 'c:\Users\shaws\ANGA9\anga-dashboard\public\banners\*.png' | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    Write-Output "$($_.Name) : $($img.Width)x$($img.Height)"
    $img.Dispose()
}
