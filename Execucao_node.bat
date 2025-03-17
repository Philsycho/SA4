@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: Criar log
set "LOGFILE=%USERPROFILE%\CJLsoft\execucao_log.txt"
echo Iniciando script Execucao_node.bat... > "%LOGFILE%"

:: Define o caminho para a pasta CJLsoft
set "userpath=%USERPROFILE%\CJLsoft"
set "api_js_path=%userpath%\api.js"
set "setup_js_path=%userpath%\setup.js"
set "executar_api_bat_path=%userpath%\executar_api.bat"
set "xampp_installer=%userpath%\xampp-installer.exe"
set "xampp_default_path=C:\xampp"
set "mysql_script_path=%userpath%\MySQL\CREATE.sql"

:menu_principal
cls
echo ==========================================
echo               Menu Principal
echo ==========================================
echo.
echo Escolha uma opcao:
echo.
echo   1 - Instalacao/Atualizacao do Servidor
echo   2 - Execucao do Servidor
echo   3 - Configurar Banco de Dados MySQL
echo   4 - Encerrar Aplicacao
echo.
echo ==========================================
set /p "opcao=Digite o numero da opcao desejada: "

echo Opcao escolhida: !opcao! >> "%LOGFILE%"

if "!opcao!"=="1" goto :instalar_atualizar
if "!opcao!"=="2" goto :executar_servidor
if "!opcao!"=="3" goto :configurar_banco_dados
if "!opcao!"=="4" goto :encerrar_aplicacao

echo Opcao invalida. Por favor, escolha uma opcao valida.
echo.
pause
goto :menu_principal

:instalar_atualizar
echo.
echo Iniciando Instalacao/Atualizacao do Servidor...
echo Iniciando Instalacao/Atualizacao do Servidor... >> "%LOGFILE%"

:: 1. Criar a pasta no diretório do usuário atual
if not exist "%userpath%" mkdir "%userpath%"
echo [1] Pasta criada ou já existente: %userpath% >> "%LOGFILE%"

:: 2. Direcionar para a pasta criada
cd /d "%userpath%"
echo [2] Diretório de trabalho definido: %userpath% >> "%LOGFILE%"

:: 3. Validar se o Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado. Instale manualmente. >> "%LOGFILE%"
    echo Node.js não encontrado. Baixe e instale manualmente: https://nodejs.org/
    pause
    goto :menu_principal
)
echo [3] Node.js encontrado. >> "%LOGFILE%"

:: Verificar se o XAMPP está instalado
if not exist "%xampp_default_path%\mysql\bin\mysql.exe" (
    echo XAMPP não encontrado. Iniciando processo de instalação...
    echo [INFO] XAMPP não encontrado. Iniciando processo de instalação... >> "%LOGFILE%"
    
    echo Instalando XAMPP automaticamente...
    echo [INFO] Baixando instalador do XAMPP... >> "%LOGFILE%"
    
    :: URL do instalador do XAMPP (versão 8.0.28)
    set "XAMPP_URL=https://sourceforge.net/projects/xampp/files/XAMPP%%20Windows/8.0.28/xampp-windows-x64-8.0.28-0-VS16-installer.exe/download"
    
    :: Baixar o instalador do XAMPP
    powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%XAMPP_URL%', '%xampp_installer%')"
    
    if exist "%xampp_installer%" (
        echo [INFO] Instalador do XAMPP baixado com sucesso. >> "%LOGFILE%"
        echo Instalador do XAMPP baixado com sucesso.
        echo.
        echo Executando o instalador do XAMPP...
        echo Por favor, siga as instruções na tela do instalador.
        echo [INFO] Executando o instalador do XAMPP... >> "%LOGFILE%"
        
        :: Executar o instalador do XAMPP
        start "" "%xampp_installer%"
        
        echo.
        echo Aguardando a conclusão da instalação do XAMPP...
        echo Pressione qualquer tecla quando a instalação estiver concluída.
        pause > nul
        
        :: Verificar novamente se o XAMPP foi instalado
        if exist "%xampp_default_path%\mysql\bin\mysql.exe" (
            echo XAMPP instalado com sucesso!
            echo [INFO] XAMPP instalado com sucesso! >> "%LOGFILE%"
        ) else (
            echo [AVISO] Não foi possível confirmar a instalação do XAMPP.
            echo [AVISO] Não foi possível confirmar a instalação do XAMPP. >> "%LOGFILE%"
            echo Verifique se o caminho de instalação do XAMPP é diferente do padrão.
        )
        
        :: Limpar o instalador
        if exist "%xampp_installer%" del "%xampp_installer%"
    ) else (
        echo [ERRO] Falha ao baixar o instalador do XAMPP. >> "%LOGFILE%"
        echo Falha ao baixar o instalador do XAMPP.
    )
) else (
    echo [INFO] XAMPP já está instalado. >> "%LOGFILE%"
    echo XAMPP já está instalado.
)

:: Criar package.json se não existir
if not exist package.json (
    echo Criando package.json...
    echo {} > package.json
    call npm init -y > nul 2>> "%LOGFILE%"
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
    echo Instalando/atualizando bibliotecas: !UPGRADE_LIST!
    call npm install !UPGRADE_LIST! >> "%LOGFILE%" 2>&1
    echo [5] Bibliotecas instaladas/atualizadas: !UPGRADE_LIST! >> "%LOGFILE%"
) else (
    echo [5] Todas as bibliotecas ja estao atualizadas. >> "%LOGFILE%"
)

:: 7. Baixar o arquivo api.js e setup.js do GitHub
echo.
echo Baixando arquivos do GitHub...

:: URL para os arquivos raw do GitHub
set "API_JS_URL=https://raw.githubusercontent.com/Philsycho/SA4/a3287bf18107ddb35cbc53ea6498a45eca1d239d/server/api.js"
set "SETUP_JS_URL=https://raw.githubusercontent.com/Philsycho/SA4/a0bca03bb750ef05615ff44ee73e20de79662b5f/server/setup.js"
set "SQL_SCRIPT_URL=https://raw.githubusercontent.com/Philsycho/SA4/main/MySQL/CREATE.sql"

:: Baixar api.js
echo Baixando api.js...
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%API_JS_URL%', '%api_js_path%')"
if exist "%api_js_path%" (
    echo [7.1] api.js baixado e salvo em: %api_js_path% >> "%LOGFILE%"
    echo [7.1] api.js baixado com sucesso!
) else (
    echo [ERRO] Falha ao baixar api.js do GitHub. >> "%LOGFILE%"
    echo [ERRO] Falha ao baixar api.js do GitHub.
)

:: Baixar setup.js
echo Baixando setup.js...
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%SETUP_JS_URL%', '%setup_js_path%')"
if exist "%setup_js_path%" (
    echo [7.2] setup.js baixado e salvo em: %setup_js_path% >> "%LOGFILE%"
    echo [7.2] setup.js baixado com sucesso!
) else (
    echo [ERRO] Falha ao baixar setup.js do GitHub. >> "%LOGFILE%"
    echo [ERRO] Falha ao baixar setup.js do GitHub.
)

:: Criar pasta MySQL e baixar o script SQL
if not exist "%userpath%\MySQL" mkdir "%userpath%\MySQL"
echo Baixando script SQL...
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%SQL_SCRIPT_URL%', '%mysql_script_path%')"
if exist "%mysql_script_path%" (
    echo [7.3] Script SQL baixado e salvo em: %mysql_script_path% >> "%LOGFILE%"
    echo [7.3] Script SQL baixado com sucesso!
) else (
    echo [ERRO] Falha ao baixar script SQL do GitHub. >> "%LOGFILE%"
    echo [ERRO] Falha ao baixar script SQL do GitHub.
)

echo.
echo Instalacao/Atualizacao do Servidor Concluida!
echo.
pause
goto :menu_principal

:executar_servidor
echo.
echo Escolha o modo de execucao:
echo 1 - Executar api.js diretamente
echo 2 - Executar setup.js (utilitario de configuracao)
set /p "modo_exec=Digite o numero da opcao: "

if "%modo_exec%"=="1" (
    goto :executar_api
) else if "%modo_exec%"=="2" (
    goto :executar_setup
) else (
    echo Opcao invalida!
    pause
    goto :executar_servidor
)

:configurar_banco_dados
echo.
echo ==========================================
echo      Configurar Banco de Dados MySQL
echo ==========================================
echo.
echo Esta opcao vai configurar o banco de dados MySQL para a aplicacao.
echo Certifique-se de que o servidor MySQL está em execucao.
echo.

:: Verificar se o MySQL está disponível
if not exist "%xampp_default_path%\mysql\bin\mysql.exe" (
    echo [ERRO] MySQL não encontrado. Instale o XAMPP primeiro.
    echo [ERRO] MySQL não encontrado. >> "%LOGFILE%"
    pause
    goto :menu_principal
)

:: Verificar se o script SQL existe
if not exist "%mysql_script_path%" (
    echo [ERRO] Script SQL não encontrado em: %mysql_script_path%
    echo [ERRO] Script SQL não encontrado. >> "%LOGFILE%"
    echo Execute a opcao "1 - Instalacao/Atualizacao do Servidor" primeiro para baixar o script.
    pause
    goto :menu_principal
)

:: Solicitar credenciais do MySQL
echo Digite as credenciais do MySQL:
set /p "mysql_user=Usuario (normalmente 'root'): "
set /p "mysql_password=Senha (normalmente vazia, apenas pressione Enter): "

:: Verificar se o MySQL está executando
echo Verificando conexao com MySQL...
"%xampp_default_path%\mysql\bin\mysqladmin" -u %mysql_user% -p%mysql_password% ping >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Não foi possível conectar ao MySQL. Verifique se está em execução e se as credenciais estão corretas.
    echo [ERRO] Falha na conexão ao MySQL. >> "%LOGFILE%"
    pause
    goto :menu_principal
)

echo Conexao com MySQL estabelecida com sucesso!
echo [INFO] Conexão com MySQL estabelecida. >> "%LOGFILE%"

:: Executar o script SQL
echo Executando script para criar banco de dados...
"%xampp_default_path%\mysql\bin\mysql" -u %mysql_user% -p%mysql_password% < "%mysql_script_path%" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao executar o script SQL.
    echo [ERRO] Falha ao executar script SQL. >> "%LOGFILE%"
    pause
    goto :menu_principal
)

echo Banco de dados criado/atualizado com sucesso!
echo [INFO] Banco de dados criado/atualizado. >> "%LOGFILE%"

:: Atualizar credenciais no arquivo api.js
echo Atualizando credenciais no arquivo api.js...
if not exist "%api_js_path%" (
    echo [ERRO] Arquivo api.js não encontrado. Execute a opcao 1 primeiro.
    echo [ERRO] api.js não encontrado para atualizar credenciais. >> "%LOGFILE%"
    pause
    goto :menu_principal
)

:: Criar arquivo temporário para guardar o conteúdo modificado
set "temp_file=%userpath%\api_temp.js"
type nul > "%temp_file%"

:: Ler o arquivo api.js linha por linha e substituir as credenciais
for /f "tokens=* delims=" %%a in ('type "%api_js_path%"') do (
    set "line=%%a"
    echo !line! | findstr /C:"user: '" >nul
    if !errorlevel! equ 0 (
        echo     user: '%mysql_user%', >> "%temp_file%"
    ) else (
        echo !line! | findstr /C:"password: '" >nul
        if !errorlevel! equ 0 (
            echo     password: '%mysql_password%', >> "%temp_file%"
        ) else (
            echo !line! >> "%temp_file%"
        )
    )
)

:: Substituir o arquivo original pelo modificado
move /y "%temp_file%" "%api_js_path%" >nul
echo Credenciais atualizadas no arquivo api.js!
echo [INFO] Credenciais atualizadas em api.js. >> "%LOGFILE%"

echo.
echo Configuracao do banco de dados concluida com sucesso!
echo.
pause
goto :menu_principal

:executar_api
echo.
echo Executando api.js...
echo Executando api.js... >> "%LOGFILE%"

:: Navega para a pasta do usuário
cd /d "%userpath%"

:: Verifica se o arquivo api.js existe
if not exist "%api_js_path%" (
    echo [ERRO] Arquivo api.js nao encontrado em: %userpath%
    echo Execute a opcao "1 - Instalacao/Atualizacao do Servidor" primeiro.
    pause
    goto :menu_principal
)

:executar_api_loop
echo.
echo Iniciando api.js em segundo plano...
start /B node api.js
echo.
echo Servidor executando em segundo plano.
echo Para interromper e ver as opcoes, pressione Ctrl+C nesta janela...
pause > nul

:menu_ctrl_c_options
cls
echo ==========================================
echo         Servidor Interrompido
echo ==========================================
echo.
echo Escolha uma opcao:
echo.
echo   1 - Reiniciar Servidor (em segundo plano)
echo   2 - Voltar ao Menu Principal
echo   3 - Sair da Aplicacao
echo.
echo ==========================================
choice /c:123 /n /m "Digite o numero da opcao desejada: "
if errorlevel 3 goto :encerrar_aplicacao
if errorlevel 2 goto :menu_principal
if errorlevel 1 goto :reiniciar_servidor
goto :menu_principal

:executar_setup
echo.
echo Executando setup.js...
echo Executando setup.js... >> "%LOGFILE%"

:: Navega para a pasta do usuário
cd /d "%userpath%"

:: Verifica se o arquivo setup.js existe
if not exist "%setup_js_path%" (
    echo [ERRO] Arquivo setup.js nao encontrado em: %userpath%
    echo Execute a opcao "1 - Instalacao/Atualizacao do Servidor" primeiro.
    pause
    goto :menu_principal
)

:: Executa o setup.js
echo.
echo Iniciando setup.js...
node setup.js
echo.
echo Utilitario de configuracao finalizado.
pause
goto :menu_principal

:reiniciar_servidor
echo.
echo Reiniciando o servidor...
echo Interrompendo o servidor atual...
taskkill /F /IM node.exe > nul 2>&1
echo Iniciando novo servidor em segundo plano...
goto :executar_api_loop

:encerrar_aplicacao
echo.
echo Encerrando Aplicacao...
echo Encerrando Aplicacao... >> "%LOGFILE%"
echo.
echo ==========================================
echo          Aplicacao Encerrada
echo ==========================================
echo.
echo [LOG] Antes do comando EXIT >> "%LOGFILE%"
exit /b
echo [LOG] Depois do comando EXIT - Isto NAO deve aparecer no log >> "%LOGFILE%"

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