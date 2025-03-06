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

// 🟢 LOGIN
app.post('/login', (req, res) => {
    const { nome_usuario, senha_usuario } = req.body;

    const sql = 'SELECT * FROM usuario WHERE BINARY nome_usuario = ? AND BINARY senha_usuario = ?';
    db.query(sql, [nome_usuario.trim(), senha_usuario.trim()], (err, results) => {
        if (err) {
            console.error('❌ Erro no login:', err);
            return res.status(500).json({ error: 'Erro ao processar a solicitação' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos!' });
        }
        res.json({ success: true, message: 'Login realizado com sucesso!', usuario: results[0] });
    });
});

// 🟢 REGISTRO DE USUÁRIO
app.post('/usuario', (req, res) => {
    const { nome_usuario, email_usuario, senha_usuario } = req.body;

    // Verificar se o usuário já existe
    const checkSql = "SELECT * FROM usuario WHERE nome_usuario = ? OR email_usuario = ?";
    db.query(checkSql, [nome_usuario, email_usuario], (err, results) => {
        if (err) {
            console.error('❌ Erro ao verificar usuário:', err);
            return res.status(500).json({ error: 'Erro ao verificar usuário' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Usuário ou email já cadastrado!' });
        }

        // Inserir novo usuário
        const insertSql = "INSERT INTO usuario (nome_usuario, email_usuario, senha_usuario) VALUES (?, ?, ?)";
        db.query(insertSql, [nome_usuario, email_usuario, senha_usuario], (err, result) => {
            if (err) {
                console.error('❌ Erro ao cadastrar usuário:', err);
                return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
            }
            res.json({ success: true, message: '✅ Usuário cadastrado com sucesso!', id: result.insertId });
        });
    });
});

// 🟢 CADASTRO DE PRODUTO
app.post('/produto', (req, res) => {
    const { nome_produto, preco_produto, id_produto_fornecedor } = req.body;

    const sql = "INSERT INTO produto (nome_produto, preco_produto, id_produto_fornecedor) VALUES (?, ?, ?)";
    db.query(sql, [nome_produto, preco_produto, id_produto_fornecedor], (err, result) => {
        if (err) {
            console.error('❌ Erro ao cadastrar produto:', err);
            return res.status(500).json({ error: 'Erro ao cadastrar produto' });
        }
        res.json({ message: "✅ Produto cadastrado com sucesso!", id: result.insertId });
    });
});

// 🟢 LISTAR TODOS OS PRODUTOS
app.get('/produto', (req, res) => {
    const sql = "SELECT * FROM produto";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Erro ao buscar produtos:', err);
            return res.status(500).json({ error: 'Erro ao buscar produtos' });
        }
        res.json(results);
    });
});

// 🟢 BUSCAR PRODUTO POR ID
app.get('/produto/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM produto WHERE id_produto = ?";
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('❌ Erro ao buscar produto:', err);
            return res.status(500).json({ error: 'Erro ao buscar produto' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        res.json(results[0]);
    });
});

// 🟢 ATUALIZAR PRODUTO
app.put('/produto/:id', (req, res) => {
    const { id } = req.params;
    const { nome_produto, preco_produto, id_produto_fornecedor } = req.body;

    const sql = "UPDATE produto SET nome_produto = ?, preco_produto = ?, id_produto_fornecedor = ? WHERE id_produto = ?";
    db.query(sql, [nome_produto, preco_produto, id_produto_fornecedor, id], (err, result) => {
        if (err) {
            console.error('❌ Erro ao atualizar produto:', err);
            return res.status(500).json({ error: 'Erro ao atualizar produto' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        res.json({ message: "✅ Produto atualizado com sucesso!" });
    });
});

// 🟢 DELETAR PRODUTO
app.delete('/produto/:id', (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM produto WHERE id_produto = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('❌ Erro ao excluir produto:', err);
            return res.status(500).json({ error: 'Erro ao excluir produto' });
        }
        res.json({ message: "✅ Produto excluído com sucesso!" });
    });
});

// 🟢 CADASTRO DE PEDIDO
app.post('/pedido', (req, res) => {
    const { id_usuario_pedido, id_produto_pedido, quantidade_produto, preco_produto_pedido, id_fornecedor_pedido } = req.body;
    
    const sql = `
        INSERT INTO pedido (
            id_usuario_pedido, 
            id_produto_pedido, 
            quantidade_produto, 
            preco_produto_pedido, 
            id_fornecedor_pedido
        ) VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(sql, [id_usuario_pedido, id_produto_pedido, quantidade_produto, preco_produto_pedido, id_fornecedor_pedido], (err, result) => {
        if (err) {
            console.error('Erro ao criar pedido:', err);
            res.status(500).json({ error: 'Erro ao criar pedido' });
            return;
        }
        res.json({ message: 'Pedido criado com sucesso', id: result.insertId });
    });
});

// 🟢 LISTAR PEDIDOS
app.get('/pedido', (req, res) => {
    const sql = 'SELECT * FROM pedido';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Erro ao buscar pedidos:', err);
            res.status(500).json({ error: 'Erro ao buscar pedidos' });
            return;
        }
        res.json(result);
    });
});

// 🟢 EDITAR PEDIDO
app.put('/pedido/:id', (req, res) => {
    const { id } = req.params;
    const { id_usuario_pedido, id_produto_pedido, quantidade_produto, preco_produto_pedido, id_fornecedor_pedido } = req.body;

    const sql = "UPDATE pedido SET id_usuario_pedido = ?, id_produto_pedido = ?, quantidade_produto = ?, preco_produto_pedido = ?, id_fornecedor_pedido = ? WHERE id_pedido = ?";
    db.query(sql, [id_usuario_pedido, id_produto_pedido, quantidade_produto, preco_produto_pedido, id_fornecedor_pedido, id], (err, result) => {
        if (err) {
            console.error('❌ Erro ao editar pedido:', err);
            return res.status(500).json({ error: 'Erro ao editar pedido' });
        }
        res.json({ message: "✅ Pedido atualizado com sucesso!" });
    });
});

// 🟢 EXCLUIR PEDIDO
app.delete('/pedido/:id', (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM pedido WHERE id_pedido = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('❌ Erro ao excluir pedido:', err);
            return res.status(500).json({ error: 'Erro ao excluir pedido' });
        }
        res.json({ message: "✅ Pedido excluído com sucesso!" });
    });
});

// Rota para buscar pedido por ID
app.get('/pedido/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM pedido WHERE id_pedido = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erro ao buscar pedido:', err);
            res.status(500).json({ error: 'Erro ao buscar pedido' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: 'Pedido não encontrado' });
            return;
        }
        res.json(result[0]);
    });
});

// Rota para atualizar pedido
app.put('/pedido/:id', (req, res) => {
    const id = req.params.id;
    const { id_usuario_pedido, id_produto_pedido, quantidade_produto, preco_produto_pedido, id_fornecedor_pedido } = req.body;
    
    const sql = `
        UPDATE pedido 
        SET id_usuario_pedido = ?, 
            id_produto_pedido = ?, 
            quantidade_produto = ?, 
            preco_produto_pedido = ?, 
            id_fornecedor_pedido = ? 
        WHERE id_pedido = ?
    `;
    
    db.query(sql, [id_usuario_pedido, id_produto_pedido, quantidade_produto, preco_produto_pedido, id_fornecedor_pedido, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar pedido:', err);
            res.status(500).json({ error: 'Erro ao atualizar pedido' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Pedido não encontrado' });
            return;
        }
        res.json({ message: 'Pedido atualizado com sucesso' });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
