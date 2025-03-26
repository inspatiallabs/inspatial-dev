# PowerShell script to run snapshot tests

param (
    [switch]$Update
)

Write-Host "Running snapshot tests..."

if ($Update) {
    Write-Host "Updating snapshots..."
    deno task test:snapshot:update
}
else {
    deno task test:snapshot
}

Write-Host "Done!" 