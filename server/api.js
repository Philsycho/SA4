const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

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

// Rota de login
app.post('/login', (req, res) => {
    const { nome_usuario, senha_usuario } = req.body;

    if (!nome_usuario || !senha_usuario) {
        return res.status(400).json({ message: 'Preencha usuário e senha!' });
    }

    const sql = 'SELECT * FROM usuario WHERE BINARY nome_usuario = ? AND BINARY senha_usuario = ?';
    
    db.query(sql, [nome_usuario.trim(), senha_usuario.trim()], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao processar a solicitação' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos!' });
        }

        res.json({ success: true, message: 'Login realizado com sucesso!' });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
