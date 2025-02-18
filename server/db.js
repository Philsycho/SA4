const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Configuração do banco de dados MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Substitua pela sua senha do MySQL
  database: 'sa4' // O nome do seu banco de dados
});

// Middleware para tratar JSON
app.use(express.json());

// Rota para listar os produtos
app.get('/api/produtos', (req, res) => {
  connection.query('SELECT * FROM produto', (err, results) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err);
      res.status(500).send('Erro ao buscar produtos.');
      return;
    }
    res.json(results);  // Retorna os produtos em formato JSON
  });
});

// Rota para listar os fornecedores
app.get('/api/fornecedores', (req, res) => {
  connection.query('SELECT * FROM fornecedor', (err, results) => {
    if (err) {
      console.error('Erro ao buscar fornecedores:', err);
      res.status(500).send('Erro ao buscar fornecedores.');
      return;
    }
    res.json(results);  // Retorna os fornecedores em formato JSON
  });
});

// Rota para registrar o movimento de estoque
app.post('/api/estoque', (req, res) => {
  const { id_tipo_movimento, id_produto_estoque, id_fornecedor_estoque, quantidade_movimentado, id_usuario_estoque, id_pedido_estoque } = req.body;

  const query = `
    INSERT INTO estoque (id_tipo_movimento, id_produto_estoque, id_fornecedor_estoque, quantidade_movimentado, id_usuario_estoque, id_pedido_estoque)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  connection.query(query, [id_tipo_movimento, id_produto_estoque, id_fornecedor_estoque, quantidade_movimentado, id_usuario_estoque, id_pedido_estoque], (err, results) => {
    if (err) {
      console.error('Erro ao registrar movimento de estoque:', err);
      res.status(500).send('Erro ao registrar movimento de estoque.');
      return;
    }
    res.status(201).send('Movimento de estoque registrado com sucesso!');
  });
});

// Inicia o servidor na porta 3000
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
