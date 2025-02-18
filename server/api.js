const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

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
    db.query('SELECT * FROM usuario', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/usuarios', (req, res) => {
    const { nome_usuario, senha_usuario, email_usuario } = req.body;
    db.query('INSERT INTO usuario (nome_usuario, senha_usuario, email_usuario) VALUES (?, ?, ?)',
        [nome_usuario, senha_usuario, email_usuario],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: results.insertId, nome_usuario, email_usuario });
        });
});

// CRUD Fornecedores
app.get('/fornecedores', (req, res) => {
    db.query('SELECT * FROM fornecedor', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/fornecedores', (req, res) => {
    const { nome_fornecedor, cnpj_fornecedor } = req.body;
    db.query('INSERT INTO fornecedor (nome_fornecedor, cnpj_fornecedor) VALUES (?, ?)',
        [nome_fornecedor, cnpj_fornecedor],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: results.insertId, nome_fornecedor, cnpj_fornecedor });
        });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
