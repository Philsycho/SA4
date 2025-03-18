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

:: Verificar se o XAMPP está instalado corretamente
set "xampp_phpmyadmin_config=%xampp_default_path%\phpMyAdmin\config.inc.php"
if not exist "%xampp_default_path%\mysql\bin\mysql.exe" (
    set "xampp_instalacao_incompleta=1"
) else if not exist "%xampp_default_path%\phpMyAdmin" (
    set "xampp_instalacao_incompleta=1"
) else (
    set "xampp_instalacao_incompleta=0"
)

if "%xampp_instalacao_incompleta%"=="1" (
    call :log_message "XAMPP não encontrado ou instalação incompleta. Iniciando processo de instalação"
    echo XAMPP não encontrado ou instalação incompleta. Iniciando processo de instalação...
    
    :: Remover instalação anterior incompleta
    if exist "%xampp_default_path%" (
        echo Removendo instalação anterior incompleta...
        call :log_message "Tentando remover instalação anterior incompleta"
        rmdir /S /Q "%xampp_default_path%" > nul 2>&1
    )
    
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
        echo.
        echo ==========================================
        echo             IMPORTANTE!
        echo ==========================================
        echo.
        echo Ao iniciar o instalador do XAMPP:
        echo.
        echo 1. Certifique-se de aceitar todas as opções padrão
        echo 2. Mantenha TODOS os componentes selecionados
        echo 3. NÃO desmarque nenhuma opção, especialmente:
        echo    - MySQL
        echo    - phpMyAdmin
        echo 4. Instale no caminho padrão: C:\xampp
        echo.
        echo O script aguardará até você concluir a instalação
        echo ==========================================
        echo.
        pause
        
        :: Executar o instalador do XAMPP com direitos de administrador
        echo Iniciando instalador do XAMPP...
        powershell -Command "Start-Process '%xampp_installer%' -Verb RunAs -Wait"
        
        echo Aguardando a conclusão da instalação do XAMPP...
        echo Pressione qualquer tecla quando a instalação estiver concluída.
        pause > nul
        
        call :log_message "Usuário confirmou conclusão da instalação do XAMPP"
        
        :: Verificar novamente se o XAMPP foi instalado
        if not exist "%xampp_default_path%\mysql\bin\mysql.exe" (
            call :log_message "[ERRO] Falha na instalação do XAMPP - MySQL não encontrado"
            echo [ERRO] Falha na instalação do XAMPP - MySQL não encontrado.
            goto :manter_janela_aberta
        )
        
        :: Verificar se o phpMyAdmin foi instalado
        if not exist "%xampp_default_path%\phpMyAdmin" (
            call :log_message "[ERRO] Falha na instalação do XAMPP - phpMyAdmin não encontrado"
            echo [ERRO] Falha na instalação do XAMPP - phpMyAdmin não encontrado.
            goto :manter_janela_aberta
        )
        
        :: Verificar se o arquivo config.inc.php existe ou criar um padrão
        if not exist "%xampp_phpmyadmin_config%" (
            call :log_message "Criando arquivo config.inc.php para phpMyAdmin"
            echo Criando arquivo de configuração para phpMyAdmin...
            
            :: Criar um arquivo config.inc.php padrão
            echo ^<?php > "%xampp_phpmyadmin_config%"
            echo $cfg['blowfish_secret'] = 'xa2MJsg4BK8w5gJRxrZO1LL9LlbV2fdF'; >> "%xampp_phpmyadmin_config%"
            echo $i = 0; >> "%xampp_phpmyadmin_config%"
            echo $i++; >> "%xampp_phpmyadmin_config%"
            echo $cfg['Servers'][$i]['auth_type'] = 'cookie'; >> "%xampp_phpmyadmin_config%"
            echo $cfg['Servers'][$i]['host'] = 'localhost'; >> "%xampp_phpmyadmin_config%"
            echo $cfg['Servers'][$i]['compress'] = false; >> "%xampp_phpmyadmin_config%"
            echo $cfg['Servers'][$i]['AllowNoPassword'] = true; >> "%xampp_phpmyadmin_config%"
            echo $cfg['UploadDir'] = ''; >> "%xampp_phpmyadmin_config%"
            echo $cfg['SaveDir'] = ''; >> "%xampp_phpmyadmin_config%"
            echo ?^> >> "%xampp_phpmyadmin_config%"
        )
        
        call :log_message "XAMPP instalado com sucesso"
        echo XAMPP instalado com sucesso!
        
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
    
    :: Verificar se o arquivo config.inc.php existe ou criar um padrão
    if not exist "%xampp_phpmyadmin_config%" (
        call :log_message "Arquivo config.inc.php não encontrado, criando um padrão"
        echo Criando arquivo de configuração para phpMyAdmin...
        
        :: Criar um arquivo config.inc.php padrão
        echo ^<?php > "%xampp_phpmyadmin_config%"
        echo $cfg['blowfish_secret'] = 'xa2MJsg4BK8w5gJRxrZO1LL9LlbV2fdF'; >> "%xampp_phpmyadmin_config%"
        echo $i = 0; >> "%xampp_phpmyadmin_config%"
        echo $i++; >> "%xampp_phpmyadmin_config%"
        echo $cfg['Servers'][$i]['auth_type'] = 'cookie'; >> "%xampp_phpmyadmin_config%"
        echo $cfg['Servers'][$i]['host'] = 'localhost'; >> "%xampp_phpmyadmin_config%"
        echo $cfg['Servers'][$i]['compress'] = false; >> "%xampp_phpmyadmin_config%"
        echo $cfg['Servers'][$i]['AllowNoPassword'] = true; >> "%xampp_phpmyadmin_config%"
        echo $cfg['UploadDir'] = ''; >> "%xampp_phpmyadmin_config%"
        echo $cfg['SaveDir'] = ''; >> "%xampp_phpmyadmin_config%"
        echo ?^> >> "%xampp_phpmyadmin_config%"
    )
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

:: Verificar se o XAMPP já está em execução
tasklist /FI "IMAGENAME eq xampp-control.exe" | find "xampp-control.exe" > nul
if %errorlevel% equ 0 (
    call :log_message "XAMPP Control Panel já está em execução. Trazendo para frente."
    echo XAMPP Control Panel já está em execução. Trazendo janela para frente...
    
    :: Trazer para frente usando PowerShell
    powershell -command "$xamppWindow = (New-Object -ComObject WScript.Shell).AppActivate('XAMPP Control Panel')"
) else (
    :: Abrir XAMPP Control Panel se não estiver em execução
    call :log_message "Abrindo XAMPP Control Panel"
    echo Abrindo XAMPP Control Panel...
    start "" "%xampp_default_path%\xampp-control.exe"
)

:: Instruir o usuário a iniciar os serviços
echo.
echo ==========================================
echo             ATENÇÃO!
echo ==========================================
echo.
echo 1. No XAMPP Control Panel:
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
call :display_step "5.1/7" "Configurando conexão com o banco de dados"
call :set_checkpoint "CONFIGURACAO_CONEXAO_BD"

echo Configurando conexão com banco de dados existente...
call :log_message "Recriando arquivo api.js com as configurações corretas"

:: Fazer backup do arquivo original
copy "%api_js_path%" "%api_js_path%.bak" > nul 2>&1
call :log_message "Backup do arquivo api.js criado em %api_js_path%.bak"

:: Criar um arquivo completamente novo usando o conteúdo original, mas corrigindo apenas a parte do banco de dados
echo const express = require('express');> "%api_js_path%"
echo const mysql = require('mysql2');>> "%api_js_path%"
echo const cors = require('cors');>> "%api_js_path%"
echo.>> "%api_js_path%"
echo const app = express();>> "%api_js_path%"
echo const port = 3000;>> "%api_js_path%"
echo.>> "%api_js_path%"
echo app.use(express.json());>> "%api_js_path%"
echo app.use(cors());>> "%api_js_path%"
echo.>> "%api_js_path%"
echo // Configuração do banco de dados>> "%api_js_path%"
echo const db = mysql.createConnection({>> "%api_js_path%"
echo     host: 'localhost',>> "%api_js_path%"
echo     user: 'root',>> "%api_js_path%"
echo     password: '',>> "%api_js_path%"
echo     database: 'sistema_pedidos',>> "%api_js_path%"
echo     connectTimeout: 300000,>> "%api_js_path%"
echo     timeout: 300000>> "%api_js_path%"
echo });>> "%api_js_path%"
echo.>> "%api_js_path%"

:: Anexar o resto do arquivo a partir da linha 14
powershell -Command "$content = Get-Content '%api_js_path%.bak'; $content[14..($content.Length-1)] | Out-File -Append -Encoding utf8 '%api_js_path%'"

call :log_message "Arquivo api.js recriado com configuração de banco de dados correta"
echo Configuração de conexão com banco de dados concluída.

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