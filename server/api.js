 
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');

app.use(express.json());
app.use(cors());

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

// Rota de Login
app.post('/login', (req, res) => {
    const { nome_usuario, senha_usuario } = req.body;
    
    db.query('SELECT * FROM usuario WHERE nome_usuario = ?', [nome_usuario], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos!' });
        }

        const user = results[0];

        // Comparar a senha fornecida com a senha criptografada no banco de dados usando bcrypt
        bcrypt.compare(senha_usuario, user.senha_usuario, (err, isMatch) => {
            if (err) return res.status(500).json({ error: 'Erro ao verificar a senha' });
            
            if (isMatch) {
                // Login bem-sucedido
                res.json({ message: 'Login realizado com sucesso!', redirect: '/produtos.html' });
            } else {
                res.status(401).json({ message: 'Usuário ou senha inválidos!' });
            }
        });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});