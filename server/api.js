const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;

// Configurando o CORS
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Permitindo apenas este domínio
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Headers permitidos
}));

app.use(express.json());

// Configuração do banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Ajuste conforme necessário
    password: '', // Ajuste conforme necessário
    database: 'sa4'
});

// Conectar ao banco de dados
db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados.');
    }
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('API de Automação de Solicitação de Compras');
});

// CRUD Usuários
app.get('/usuarios', (req, res) => {
    const query = 'SELECT id_usuario, nome_usuario, email_usuario FROM usuario';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/usuarios', (req, res) => {
    const { nome_usuario, senha_usuario, email_usuario } = req.body;
    
    // Verifica se todos os campos foram fornecidos
    if (!nome_usuario || !senha_usuario || !email_usuario) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const query = 'INSERT INTO usuario (nome_usuario, senha_usuario, email_usuario) VALUES (?, ?, ?)';
    db.query(query, 
        [nome_usuario, senha_usuario, email_usuario],
        (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email já cadastrado' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                id: results.insertId, 
                nome_usuario, 
                email_usuario 
            });
        });
});

// CRUD Fornecedores
app.get('/fornecedores', (req, res) => {
    const query = 'SELECT id_fornecedor, nome_fornecedor, cnpj_fornecedor FROM fornecedor';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/fornecedores', (req, res) => {
    const { nome_fornecedor, cnpj_fornecedor } = req.body;
    
    if (!nome_fornecedor || !cnpj_fornecedor) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const query = 'INSERT INTO fornecedor (nome_fornecedor, cnpj_fornecedor) VALUES (?, ?)';
    db.query(query, 
        [nome_fornecedor, cnpj_fornecedor],
        (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'CNPJ já cadastrado' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                id: results.insertId, 
                nome_fornecedor, 
                cnpj_fornecedor 
            });
        });
});

// Rota de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const query = 'SELECT * FROM usuario WHERE nome_usuario = ? AND senha_usuario = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no servidor' });
        }

        if (results.length > 0) {
            // Login bem-sucedido
            res.json({ 
                success: true,
                message: 'Login realizado com sucesso',
                user: results[0]
            });
        } else {
            // Credenciais inválidas
            res.status(401).json({ 
                success: false,
                message: 'Usuário ou senha incorretos'
            });
        }
    });
});

// Rota de logout
app.post('/logout', (req, res) => {
    // Aqui você pode adicionar lógica para invalidar tokens ou sessões
    res.json({ success: true, message: 'Logout realizado com sucesso' });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
