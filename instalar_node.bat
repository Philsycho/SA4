@echo off
setlocal enabledelayedexpansion

:: Criar log
set "LOGFILE=%USERPROFILE%\CJLsoft\install_log.txt"
echo Iniciando instalacao... > "%LOGFILE%"

:: 1. Criar a pasta no diretório do usuário atual
set "userpath=%USERPROFILE%\CJLsoft"
if not exist "%userpath%" mkdir "%userpath%"
echo [1] Pasta criada ou já existente: %userpath% >> "%LOGFILE%"

:: 2. Direcionar a instalação das bibliotecas para a pasta criada
cd /d "%userpath%"
echo [2] Diretório de instalação definido: %userpath% >> "%LOGFILE%"

:: 3. Validar se o Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado. Instale manualmente. >> "%LOGFILE%"
    echo Node.js não encontrado. Baixe e instale manualmente: https://nodejs.org/
    pause
    exit /b
)
echo [3] Node.js encontrado. >> "%LOGFILE%"

:: Criar package.json se não existir
if not exist package.json (
    echo Criando package.json...
    echo {} > package.json
    call npm init -y
    echo [4] package.json criado. >> "%LOGFILE%"
) else (
    echo [4] package.json ja existente. >> "%LOGFILE%"
)

:: Lista de bibliotecas a serem verificadas
set LIBS=express mysql2 cors
set UPGRADE_LIST=
set STATUS_REPORT=

:: 4. Verificar bibliotecas instaladas e comparar versões
for %%L in (%LIBS%) do (
    call :CHECK_LIB %%L
)

:: 5. Instalar ou atualizar as bibliotecas necessárias
if not "!UPGRADE_LIST!"=="" (
    echo Instalando/atualizando: !UPGRADE_LIST!
    call npm install !UPGRADE_LIST! >> "%LOGFILE%" 2>&1
    echo [5] Bibliotecas instaladas/atualizadas: !UPGRADE_LIST! >> "%LOGFILE%"
) else (
    echo [5] Todas as bibliotecas ja estao atualizadas. >> "%LOGFILE%"
)

:: 7. Baixar o arquivo api.js do GitHub
echo.
echo Baixando api.js do GitHub...
set "API_JS_URL=https://raw.githubusercontent.com/Philsycho/SA4/8e14a6863cb698983d7cd437c8322f963bbe5555/server/api.js"
set "API_JS_DEST=%userpath%\api.js"
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%API_JS_URL%', '%API_JS_DEST%')"
if exist "%API_JS_DEST%" (
    echo [7] api.js baixado e salvo em: %API_JS_DEST% >> "%LOGFILE%"
    echo [7] api.js baixado com sucesso!
) else (
    echo [ERRO] Falha ao baixar api.js do GitHub. Verifique a URL e a conexao. >> "%LOGFILE%"
    echo [ERRO] Falha ao baixar api.js do GitHub. Verifique o log para detalhes.
)

:: 8. Criar o arquivo executar_api.bat
echo.
echo Criando executar_api.bat...
set "EXECUTAR_API_BAT_DEST=%userpath%\executar_api.bat"
(
echo @echo off
echo setlocal
echo.
echo :: Define o caminho para a pasta CJLsoft
echo set "userpath=%%USERPROFILE%%\CJLsoft"
echo set "api_js_path=%%userpath%%\api.js"
echo.
echo :: Navega para a pasta do usuário
echo cd /d "%%userpath%%"
echo.
echo :: Verifica se o arquivo api.js existe
echo if not exist "%%api_js_path%%" (
echo     echo [ERRO] Arquivo api.js nao encontrado em: %%userpath%%
echo     echo Certifique-se de que o arquivo api.js foi instalado corretamente.
echo     pause
echo     exit /b 1
echo )
echo.
echo echo Iniciando api.js...
echo node api.js
echo if %%errorlevel%% neq 0 (
echo     echo [ERRO] api.js retornou com erro. Verifique o log do servidor para mais detalhes.
echo     pause
echo     exit /b %%errorlevel%%
echo )
echo.
echo echo api.js executado com sucesso!
echo exit /b 0
) > "%EXECUTAR_API_BAT_DEST%"
if exist "%EXECUTAR_API_BAT_DEST%" (
    echo [8] executar_api.bat criado e salvo em: %EXECUTAR_API_BAT_DEST% >> "%LOGFILE%"
    echo [8] executar_api.bat criado com sucesso!
) else (
    echo [ERRO] Falha ao criar executar_api.bat. Verifique as permissoes de escrita na pasta. >> "%LOGFILE%"
    echo [ERRO] Falha ao criar executar_api.bat. Verifique o log para detalhes.
)

:: 6. Mensagem de conclusão
echo.
echo ===============================
echo  Instalacao concluida!
echo ===============================

:: Capturar data e hora e registrar no log
for /f "delims=" %%I in ('powershell -Command "Get-Date -Format 'dd/MM/yyyy HH:mm:ss'"') do set DATE_LOG=%%I
set "DATE_LOG=%datetime:~6,2%/%datetime:~4,2%/%datetime:~0,4% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%"

echo [9] Instalacao concluida em %DATE_LOG% >> "%LOGFILE%"
timeout /t 5 >nul
exit /b

:: Função para verificar a biblioteca e versão instalada
:CHECK_LIB
set "LIB_NAME=%1"
set "INSTALLED_VER="
for /f "delims=" %%V in ('npm list %LIB_NAME% --depth=0 2^>nul') do set "INSTALLED_VER=%%V"

if "!INSTALLED_VER!"=="" (
    echo %LIB_NAME% não está instalado. Será instalado.
    set "UPGRADE_LIST=!UPGRADE_LIST! %LIB_NAME%"
    echo [INFO] %LIB_NAME% nao encontrado. Agendado para instalacao. >> "%LOGFILE%"
    set "STATUS_REPORT=!STATUS_REPORT![%LIB_NAME%] -> Nao instalado (Será instalado)" & exit /b
)

for /f "tokens=2 delims=@ " %%A in ("!INSTALLED_VER!") do set "CUR_VER=%%A"
for /f "delims=" %%N in ('npm show %LIB_NAME% version') do set "NEW_VER=%%N"

if "!CUR_VER!" LSS "!NEW_VER!" (
    echo Atualizando %LIB_NAME% (!CUR_VER! -> !NEW_VER!)
    set "UPGRADE_LIST=!UPGRADE_LIST! %LIB_NAME%"
    echo [INFO] Atualizando %LIB_NAME% (!CUR_VER! -> !NEW_VER!) >> "%LOGFILE%"
    set "STATUS_REPORT=!STATUS_REPORT![%LIB_NAME%] -> Atualizando para versao !NEW_VER!" & exit /b
) else (
    echo %LIB_NAME% está atualizado (!CUR_VER!)
    echo [INFO] %LIB_NAME% atualizado (!CUR_VER!) >> "%LOGFILE%"
    set "STATUS_REPORT=!STATUS_REPORT![%LIB_NAME%] -> OK (versao !CUR_VER!)" & exit /b
)
