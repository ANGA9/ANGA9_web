Add-Type -AssemblyName System.Drawing
$files = @('ban1.png','ban2.png','ban3.png','ban4.png')
foreach ($f in $files) {
    $path = "c:\Users\shaws\ANGA9\anga-dashboard\assets\$f"
    $img = [System.Drawing.Image]::FromFile($path)
    Write-Output "$f : $($img.Width)x$($img.Height) (ratio: $([math]::Round($img.Width/$img.Height, 2)))"
    $img.Dispose()
}
