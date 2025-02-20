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
    database: 'teste_sistemas'
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
    
    db.query('SELECT * FROM usuarios WHERE usuario = ? AND senha = ?', [nome_usuario, senha_usuario], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos!' });
        }

        // Login bem-sucedido
        res.json({ message: 'Login realizado com sucesso!', redirect: 'tela_inicial.html' });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
