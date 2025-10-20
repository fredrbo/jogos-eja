# Script para build do GitHub Pages
Write-Host "Iniciando build para GitHub Pages..." -ForegroundColor Green

# Executa o build
ng build --configuration github-pages

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build executado com sucesso!" -ForegroundColor Green
    
    # Move arquivos da pasta browser para docs
    if (Test-Path "docs/browser") {
        Write-Host "Movendo arquivos da pasta browser..." -ForegroundColor Yellow
        
        # Copia todos os arquivos
        Copy-Item -Path "docs/browser/*" -Destination "docs/" -Recurse -Force
        
        # Remove a pasta browser
        Remove-Item -Path "docs/browser" -Recurse -Force
        
        Write-Host "Arquivos organizados para GitHub Pages!" -ForegroundColor Green
        Write-Host "Arquivos disponiveis em: docs/" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Proximos passos:" -ForegroundColor Yellow
        Write-Host "1. git add docs/" -ForegroundColor White
        Write-Host "2. git commit -m 'Deploy: Atualizacao do GitHub Pages'" -ForegroundColor White
        Write-Host "3. git push origin master" -ForegroundColor White
        Write-Host ""
        Write-Host "Apos o push, seu site estara disponivel em:" -ForegroundColor Cyan
        Write-Host "   https://fredrbo.github.io/jogos-eja/" -ForegroundColor Blue
    }
} else {
    Write-Host "Erro no build!" -ForegroundColor Red
    exit 1
}