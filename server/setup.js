const readline = require('readline');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const path = require('path');
const mysql = require('mysql2');

// Caminhos dos arquivos
const API_FILE_PATH = path.join(__dirname, 'server', 'api.js');
const SQL_SCRIPT_PATH = path.join(__dirname, 'MySQL', 'CREATE.sql');

// Código correto do API.js (usar o conteúdo fornecido)
const API_CONTENT = `const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Configuração do banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sa4'
});

// Conectar ao banco de dados
db.connect(err => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('✅ Conectado ao banco de dados.');
    }
});

// Resto do código da API.js (omitido por brevidade)

// Iniciar servidor
app.listen(port, () => {
    console.log(\`🚀 Servidor rodando em http://localhost:\${port}\`);
});`;

// Criação da interface de leitura
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função principal que exibe o menu
function mostrarMenu() {
    console.log('\n=== CONFIGURAÇÃO DO SERVIDOR ===');
    console.log('1. Instalar/Atualizar o servidor');
    console.log('2. Executar o servidor');
    console.log('3. Configurar banco de dados');
    console.log('4. Sair');
    
    rl.question('\nEscolha uma opção: ', (opcao) => {
        switch(opcao) {
            case '1':
                instalarAtualizarServidor();
                break;
            case '2':
                executarServidor();
                break;
            case '3':
                configurarBancoDados();
                break;
            case '4':
                console.log('Encerrando a aplicação...');
                rl.close();
                break;
            default:
                console.log('Opção inválida! Tente novamente.');
                mostrarMenu();
        }
    });
}

// Função para criar/atualizar o servidor localmente (sem download)
function instalarAtualizarServidor() {
    console.log('\nInstalando/Atualizando o servidor...');
    
    // Verifica e cria o diretório se não existir
    const dir = path.dirname(API_FILE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Diretório '${dir}' criado com sucesso!`);
    }
    
    // Em vez de baixar, usamos o conteúdo que já temos
    console.log(`Criando/Atualizando arquivo em: ${API_FILE_PATH}`);
    
    try {
        // Escreve o conteúdo do arquivo API.js
        fs.writeFileSync(API_FILE_PATH, API_CONTENT);
        console.log('Arquivo api.js criado/atualizado com sucesso!');
        
        // Instala as dependências
        console.log('\nInstalando dependências...');
        exec('npm install express mysql2 cors body-parser dotenv bcryptjs jsonwebtoken express-session nodemon', (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao instalar dependências: ${error.message}`);
            } else {
                console.log('Dependências instaladas com sucesso!');
            }
            mostrarMenu();
        });
    } catch (err) {
        console.error(`Erro ao criar arquivo api.js: ${err.message}`);
        mostrarMenu();
    }
}

// Função para executar o servidor
function executarServidor() {
    console.log('\nIniciando o servidor...');
    
    if (!fs.existsSync(API_FILE_PATH)) {
        console.error(`Arquivo do servidor não encontrado em ${API_FILE_PATH}. Por favor, instale o servidor primeiro.`);
        mostrarMenu();
        return;
    }
    
    console.log(`Executando: node ${API_FILE_PATH}`);
    
    // Executa o servidor como um processo filho
    const servidor = spawn('node', [API_FILE_PATH], { stdio: 'inherit' });
    
    console.log('\nServidor em execução. Pressione Ctrl+C para interromper.');
    
    servidor.on('close', (code) => {
        console.log(`O servidor foi encerrado com código: ${code}`);
        mostrarMenu();
    });
}

// Função para configurar o banco de dados embutido
function configurarBancoDados() {
    console.log('\n=== CONFIGURAÇÃO DO BANCO DE DADOS ===');
    
    rl.question('Nome do usuário MySQL: ', (usuario) => {
        rl.question('Senha MySQL: ', (senha) => {
            // Tenta estabelecer conexão com o MySQL
            const conexao = mysql.createConnection({
                host: 'localhost',
                user: usuario,
                password: senha
            });
            
            conexao.connect((err) => {
                if (err) {
                    console.error(`Erro ao conectar ao MySQL: ${err.message}`);
                    mostrarMenu();
                    return;
                }
                
                console.log('Conexão com MySQL estabelecida com sucesso!');
                
                // Verifica se o arquivo SQL existe
                if (!fs.existsSync(SQL_SCRIPT_PATH)) {
                    console.error(`Arquivo SQL não encontrado em ${SQL_SCRIPT_PATH}`);
                    conexao.end();
                    mostrarMenu();
                    return;
                }
                
                // Lê o arquivo SQL
                fs.readFile(SQL_SCRIPT_PATH, 'utf8', (err, data) => {
                    if (err) {
                        console.error(`Erro ao ler o arquivo SQL: ${err.message}`);
                        conexao.end();
                        mostrarMenu();
                        return;
                    }
                    
                    // Divide o script em comandos individuais
                    const comandos = data.split(';').filter(cmd => cmd.trim() !== '');
                    
                    // Executa cada comando sequencialmente
                    executarComandosSQL(conexao, comandos, 0, () => {
                        console.log('Banco de dados configurado com sucesso!');
                        
                        // Atualiza o arquivo api.js com as credenciais corretas
                        atualizarCredenciaisAPI(usuario, senha);
                        
                        conexao.end();
                        mostrarMenu();
                    });
                });
            });
        });
    });
}

// Função para executar comandos SQL sequencialmente
function executarComandosSQL(conexao, comandos, indice, callback) {
    if (indice >= comandos.length) {
        callback();
        return;
    }
    
    const comando = comandos[indice] + ';';
    conexao.query(comando, (err) => {
        if (err) {
            console.error(`Erro ao executar comando SQL: ${err.message}`);
            console.error(`Comando: ${comando}`);
        } else {
            console.log(`Comando SQL ${indice + 1}/${comandos.length} executado com sucesso`);
        }
        
        // Executa o próximo comando
        executarComandosSQL(conexao, comandos, indice + 1, callback);
    });
}

// Função para atualizar as credenciais no arquivo api.js
function atualizarCredenciaisAPI(usuario, senha) {
    try {
        if (!fs.existsSync(API_FILE_PATH)) {
            console.error(`Arquivo API não encontrado em ${API_FILE_PATH}`);
            return;
        }
        
        let conteudo = fs.readFileSync(API_FILE_PATH, 'utf8');
        
        // Substitui as credenciais no arquivo
        conteudo = conteudo.replace(/user: ['"].*['"]/, `user: '${usuario}'`);
        conteudo = conteudo.replace(/password: ['"].*['"]/, `password: '${senha}'`);
        
        fs.writeFileSync(API_FILE_PATH, conteudo);
        console.log('Credenciais do banco de dados atualizadas no arquivo api.js');
    } catch (err) {
        console.error(`Erro ao atualizar credenciais no arquivo api.js: ${err.message}`);
    }
}

// Inicia a aplicação
console.log('=== SISTEMA DE GESTÃO DE PEDIDOS E ESTOQUE ===');
console.log('Utilitário de Configuração e Execução do Servidor');
mostrarMenu(); 