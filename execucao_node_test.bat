@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: Definições iniciais
set "userpath=%USERPROFILE%\CJLsoft"
set "api_js_path=%userpath%\api.js"
set "logfile=%userpath%\execucao_log.txt"
set "checkpoint_file=%userpath%\checkpoint.txt"
set "xampp_installer=%userpath%\xampp-installer.exe"
set "xampp_default_path=C:\xampp"

:: Criar a pasta de instalação se não existir
if not exist "%userpath%" mkdir "%userpath%" 2>nul

:: Iniciar o arquivo de log
echo ==========================================  > "%logfile%"
echo    REGISTRO DE EXECUÇÃO - %date% %time%    >> "%logfile%"
echo ==========================================  >> "%logfile%"
echo. >> "%logfile%"

:: Função para log
call :log_message "Iniciando script execucao_node_test.bat"
call :log_message "Sistema: %OS%, Usuário: %USERNAME%"

:: Função para salvar checkpoint (para rastreamento de falhas)
call :set_checkpoint "INICIO"

echo ==========================================
echo      Inicializador do Servidor Node.js
echo ==========================================
echo.

:: 1. Criar a pasta no diretório do usuário
call :display_step "1/7" "Verificando diretório de instalação"
call :set_checkpoint "VERIFICACAO_DIRETORIO"

if not exist "%userpath%" (
    mkdir "%userpath%"
    call :log_message "Pasta CJLsoft criada em: %userpath%"
    echo Pasta CJLsoft criada em: %userpath%
) else (
    call :log_message "Pasta CJLsoft já existe em: %userpath%"
    echo Pasta CJLsoft já existe em: %userpath%
)

:: Direcionar para a pasta criada
cd /d "%userpath%"
call :log_message "Diretório de trabalho definido: %userpath%"

:: 2. Validar Node.js e bibliotecas
call :display_step "2/7" "Verificando Node.js e bibliotecas"
call :set_checkpoint "VERIFICACAO_NODEJS"

where node >nul 2>nul
if %errorlevel% neq 0 (
    call :log_message "[ERRO] Node.js não encontrado"
    echo [ERRO] Node.js não encontrado. Instale manualmente: https://nodejs.org/
    goto :manter_janela_aberta
)
call :log_message "Node.js encontrado"
echo Node.js encontrado.

:: Criar package.json
call :set_checkpoint "CRIACAO_PACKAGE_JSON"
if not exist package.json (
    call :log_message "Criando package.json"
    echo Criando package.json...
    echo {} > package.json
    call npm init -y > nul 2>> "%logfile%"
) else (
    call :log_message "package.json já existente"
    echo package.json já existente.
)

:: Bibliotecas
call :set_checkpoint "VERIFICACAO_BIBLIOTECAS"
set "LIBS=express mysql2 cors"
set "UPGRADE_LIST="

:: Verificar bibliotecas de forma mais segura
echo Verificando bibliotecas necessárias...
call :log_message "Iniciando verificação de bibliotecas"

:: Instalar diretamente todas as bibliotecas necessárias sem verificação prévia
echo Instalando/atualizando bibliotecas necessárias...
call :log_message "Instalando todas as bibliotecas necessárias"
call :set_checkpoint "INSTALACAO_BIBLIOTECAS_INICIADA"

echo Instalando express...
call npm install express --save >> "%logfile%" 2>&1
call :log_message "express instalado"

echo Instalando mysql2...
call npm install mysql2 --save >> "%logfile%" 2>&1
call :log_message "mysql2 instalado"

echo Instalando cors...
call npm install cors --save >> "%logfile%" 2>&1
call :log_message "cors instalado"

call :log_message "Todas as bibliotecas instaladas/atualizadas"
call :set_checkpoint "INSTALACAO_BIBLIOTECAS_CONCLUIDA"

:: 3. Baixar o arquivo api.js
call :display_step "3/7" "Baixando arquivo api.js do GitHub"
call :set_checkpoint "DOWNLOAD_API_JS"

set "API_JS_URL=https://raw.githubusercontent.com/Philsycho/SA4/c0629dd3c8263df411c88015a31ad82df204e2c7/server/api.js"

call :log_message "Iniciando download de api.js"
echo Baixando api.js...
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%API_JS_URL%', '%api_js_path%')" 2>> "%logfile%"

if exist "%api_js_path%" (
    call :log_message "api.js baixado com sucesso em: %api_js_path%"
    echo api.js baixado com sucesso em: %api_js_path%
) else (
    call :log_message "[ERRO] Falha ao baixar api.js do GitHub"
    echo [ERRO] Falha ao baixar api.js do GitHub.
    goto :manter_janela_aberta
)

:: 4. Verificar/Instalar XAMPP
call :display_step "4/7" "Verificando instalação do XAMPP"
call :set_checkpoint "VERIFICACAO_XAMPP"

if not exist "%xampp_default_path%\mysql\bin\mysql.exe" (
    call :log_message "XAMPP não encontrado. Iniciando processo de instalação"
    echo XAMPP não encontrado. Iniciando processo de instalação...
    
    call :log_message "Baixando instalador do XAMPP"
    echo Baixando instalador do XAMPP...
    
    :: URL do instalador do XAMPP (versão 8.0.28)
    set "XAMPP_URL=https://sourceforge.net/projects/xampp/files/XAMPP%%20Windows/8.0.28/xampp-windows-x64-8.0.28-0-VS16-installer.exe/download"
    
    :: Baixar o instalador do XAMPP
    powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%XAMPP_URL%', '%xampp_installer%')" 2>> "%logfile%"
    
    if exist "%xampp_installer%" (
        call :log_message "Instalador do XAMPP baixado com sucesso"
        echo Instalador do XAMPP baixado com sucesso.
        
        call :log_message "Executando o instalador do XAMPP"
        echo Executando o instalador do XAMPP...
        echo Por favor, siga as instruções na tela do instalador.
        
        :: Executar o instalador do XAMPP
        start /wait "" "%xampp_installer%"
        
        echo Aguardando a conclusão da instalação do XAMPP...
        echo Pressione qualquer tecla quando a instalação estiver concluída.
        pause > nul
        
        call :log_message "Usuário confirmou conclusão da instalação do XAMPP"
        
        :: Verificar novamente se o XAMPP foi instalado
        if exist "%xampp_default_path%\mysql\bin\mysql.exe" (
            call :log_message "XAMPP instalado com sucesso"
            echo XAMPP instalado com sucesso!
        ) else (
            call :log_message "[AVISO] Não foi possível confirmar a instalação do XAMPP"
            echo [AVISO] Não foi possível confirmar a instalação do XAMPP.
            echo Verifique se o caminho de instalação do XAMPP é diferente do padrão.
            goto :manter_janela_aberta
        )
        
        :: Limpar o instalador
        if exist "%xampp_installer%" del "%xampp_installer%"
    ) else (
        call :log_message "[ERRO] Falha ao baixar o instalador do XAMPP"
        echo [ERRO] Falha ao baixar o instalador do XAMPP.
        goto :manter_janela_aberta
    )
) else (
    call :log_message "XAMPP já está instalado"
    echo XAMPP já está instalado.
)

:: 5. Iniciar XAMPP
call :display_step "5/7" "Iniciando XAMPP"
call :set_checkpoint "INICIALIZACAO_XAMPP"

:: Verificar se o XAMPP Control Panel existe
if not exist "%xampp_default_path%\xampp-control.exe" (
    call :log_message "[ERRO] XAMPP Control Panel não encontrado"
    echo [ERRO] XAMPP Control Panel não encontrado.
    goto :manter_janela_aberta
)

:: Abrir XAMPP Control Panel
call :log_message "Abrindo XAMPP Control Panel"
echo Abrindo XAMPP Control Panel...
start "" "%xampp_default_path%\xampp-control.exe"

:: Instruir o usuário a iniciar os serviços
echo.
echo ==========================================
echo             ATENÇÃO!
echo ==========================================
echo.
echo 1. No XAMPP Control Panel que foi aberto:
echo    - Clique no botão "Start" ao lado de "MySQL"
echo    - Clique no botão "Start" ao lado de "Apache"
echo.
echo 2. Aguarde até que os indicadores fiquem verdes
echo.
echo 3. IMPORTANTE: Aguarde pelo menos 10 segundos após
echo    os indicadores ficarem verdes para garantir que
echo    o MySQL esteja completamente inicializado.
echo.
echo 4. Pressione qualquer tecla aqui quando terminar
echo    para continuar com a execução da aplicação.
echo ==========================================
echo.

pause > nul
call :log_message "Usuário confirmou que os serviços do XAMPP foram iniciados"

:: Aguardar para garantir que o MySQL esteja pronto
echo Aguardando o MySQL inicializar completamente...
timeout /t 10 /nobreak > nul
call :log_message "Aguardou período adicional para inicialização do MySQL"

:: Verificar configurações no api.js para conexão com o banco
call :display_step "5.1/7" "Verificando configurações de conexão do banco de dados"
call :set_checkpoint "VERIFICACAO_CONFIG_MYSQL"

:: Criar um arquivo temporário para modificar api.js
if exist "%api_js_path%" (
    echo Verificando e ajustando configurações de conexão no api.js...
    call :log_message "Verificando configurações do banco de dados no api.js"
    
    set "temp_file=%userpath%\api_temp.js"
    type nul > "%temp_file%"
    
    set "modificado=0"
    for /f "usebackq delims=" %%a in ("%api_js_path%") do (
        set "linha=%%a"
        
        :: Verificar se a linha contém as configurações de host do MySQL
        echo !linha! | findstr /C:"const db = mysql.createConnection({" > nul
        if !errorlevel! equ 0 (
            echo %%a >> "%temp_file%"
            echo.>> "%temp_file%"
            echo   // Configurações de conexão com timeout aumentado>> "%temp_file%"
            set "modificado=1"
            call :log_message "Encontrado bloco de configuração do MySQL"
        ) else if !modificado! equ 1 (
            echo !linha! | findstr /C:"host:" > nul
            if !errorlevel! equ 0 (
                echo   host: 'localhost', >> "%temp_file%"
                call :log_message "Definido host para localhost"
            ) else echo !linha! | findstr /C:"user:" > nul
            if !errorlevel! equ 0 (
                echo   user: 'root', >> "%temp_file%"
                call :log_message "Definido user para root"
            ) else echo !linha! | findstr /C:"password:" > nul
            if !errorlevel! equ 0 (
                echo   password: '', >> "%temp_file%"
                call :log_message "Definida password vazia"
            ) else echo !linha! | findstr /C:"database:" > nul
            if !errorlevel! equ 0 (
                echo   database: 'sistema_pedidos', >> "%temp_file%"
                call :log_message "Definido database para sistema_pedidos"
                echo   connectTimeout: 60000, // Aumentar timeout para 60 segundos >> "%temp_file%"
                call :log_message "Aumentado o timeout de conexão para 60 segundos"
                set "modificado=0"
            ) else (
                echo %%a >> "%temp_file%"
            )
        ) else (
            echo %%a >> "%temp_file%"
        )
    )
    
    :: Substituir o arquivo original pelo modificado
    if exist "%temp_file%" (
        move /y "%temp_file%" "%api_js_path%" > nul
        call :log_message "Arquivo api.js atualizado com configurações otimizadas"
        echo Configurações do banco de dados ajustadas com timeout aumentado.
    )
) else (
    call :log_message "[AVISO] Arquivo api.js não encontrado para ajustar configurações"
    echo [AVISO] Não foi possível ajustar as configurações do banco de dados.
)

:: 6. Executar api.js
call :display_step "6/7" "Iniciando servidor Node.js"
call :set_checkpoint "INICIALIZACAO_API_JS"

if not exist "%api_js_path%" (
    call :log_message "[ERRO] Arquivo api.js não encontrado em: %api_js_path%"
    echo [ERRO] Arquivo api.js não encontrado em: %api_js_path%
    goto :manter_janela_aberta
)

:: Executar o servidor em segundo plano
call :log_message "Executando comando: node api.js"
echo Iniciando api.js...
start /B node api.js
call :log_message "Servidor Node.js iniciado em segundo plano"

echo.
echo ==========================================
echo        Servidor em execução!
echo ==========================================
echo.

:: Loop para manter o servidor ativo
call :set_checkpoint "SERVIDOR_EM_EXECUCAO"

echo O servidor está rodando em segundo plano.
echo API disponível em: http://localhost:3000
echo.
echo Para encerrar a aplicação, pressione Ctrl+C ou feche esta janela.
echo.
echo ==========================================
echo   Para monitorar o servidor, digite:
echo   1 - Ver status do servidor
echo   2 - Encerrar aplicação
echo ==========================================
echo.

:loop_monitoramento
set /p "opcao_servidor=Digite uma opção (1 ou 2): "
call :log_message "Usuário selecionou opção: %opcao_servidor%"

if "%opcao_servidor%"=="1" (
    echo.
    echo Verificando status do servidor...
    tasklist | findstr "node.exe" > nul
    if %errorlevel% equ 0 (
        echo Servidor Node.js está em execução.
        call :log_message "Status verificado: Servidor Node.js em execução"
    ) else (
        echo [AVISO] Servidor Node.js não está em execução!
        call :log_message "[AVISO] Servidor Node.js não está em execução"
        echo Tentando reiniciar o servidor...
        start /B node api.js
    )
    echo.
    goto :loop_monitoramento
)

if "%opcao_servidor%"=="2" (
    goto :encerrar_aplicacao
) else (
    echo.
    echo Opção inválida. Por favor, escolha 1 ou 2.
    call :log_message "Usuário digitou opção inválida: %opcao_servidor%"
    goto :loop_monitoramento
)

:encerrar_aplicacao
:: 7. Encerrar aplicação
call :display_step "7/7" "Encerrando aplicação"
call :set_checkpoint "ENCERRAMENTO_APLICACAO"

:: Aguardar antes de matar processos
echo Encerrando em 5 segundos...
timeout /t 5 /nobreak > nul

:: Encerrar Node.js
taskkill /F /IM node.exe > nul 2>&1
call :log_message "Processo Node.js encerrado"

:: Fechar XAMPP (tentar fechar o control panel primeiro)
taskkill /F /IM xampp-control.exe > nul 2>&1
call :log_message "XAMPP Control Panel encerrado"

:: Tentar parar serviços do XAMPP
if exist "%xampp_default_path%\apache_stop.bat" (
    call "%xampp_default_path%\apache_stop.bat" > nul 2>&1
    call :log_message "Serviço Apache encerrado"
)
if exist "%xampp_default_path%\mysql_stop.bat" (
    call "%xampp_default_path%\mysql_stop.bat" > nul 2>&1
    call :log_message "Serviço MySQL encerrado"
)

call :log_message "Aplicação encerrada com sucesso"
echo ==========================================
echo          Aplicação Encerrada
echo ==========================================
echo.
goto :manter_janela_aberta

:manter_janela_aberta
echo.
echo ==========================================
echo      FINALIZAÇÃO DO SCRIPT
echo ==========================================
echo.
echo A execução do script foi concluída.
echo Verifique o arquivo de log para detalhes: %logfile%
echo Último checkpoint: 
type "%checkpoint_file%" 2>nul || echo Nenhum checkpoint registrado
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause > nul
exit /b 0

:: Função para exibir o passo atual
:display_step
echo.
echo ==========================================
echo    [%~1] %~2
echo ==========================================
call :log_message "ETAPA %~1: %~2"
exit /b 0

:: Função para registrar mensagem no log
:log_message
echo [%date% %time%] %~1 >> "%logfile%"
exit /b 0

:: Função para salvar checkpoint
:set_checkpoint
echo %~1 > "%checkpoint_file%"
call :log_message "CHECKPOINT: %~1"
exit /b 0 