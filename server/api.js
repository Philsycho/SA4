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

// ==================== ROTAS DE USUÁRIO ====================

// Login de usuário
app.post('/login', (req, res) => {
    const { nome_usuario, senha_usuario } = req.body;

    const sql = `
        SELECT * FROM usuario 
        WHERE BINARY nome_usuario = ? 
        AND BINARY senha_usuario = ?`;
    
    db.query(sql, [nome_usuario.trim(), senha_usuario.trim()], (err, results) => {
        if (err) {
            console.error('❌ Erro no login:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao processar a solicitação' 
            });
        }

        if (results.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuário ou senha inválidos!' 
            });
        }

        if (results[0].ativo_usuario === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Acesso negado. Usuário inativo no sistema.' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Login realizado com sucesso!', 
            usuario: {
                id_usuario: results[0].id_usuario,
                nome_usuario: results[0].nome_usuario,
                email_usuario: results[0].email_usuario,
                ativo_usuario: results[0].ativo_usuario
            }
        });
    });
});

// Listar todos os usuários
app.get('/usuarios', (req, res) => {
    const sql = `
        SELECT 
            id_usuario,
            nome_usuario,
            email_usuario,
            ativo_usuario
        FROM usuario
        ORDER BY nome_usuario`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Erro ao listar usuários:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao listar usuários' 
            });
        }
        res.json({ 
            success: true, 
            usuarios: results 
        });
    });
});

// Buscar usuário por ID
app.get('/usuario/:id', (req, res) => {
    const { id } = req.params;
    
    const sql = `
        SELECT 
            id_usuario,
            nome_usuario,
            email_usuario,
            ativo_usuario
        FROM usuario 
        WHERE id_usuario = ?`;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('❌ Erro ao buscar usuário:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar usuário' 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }

        res.json({ 
            success: true, 
            usuario: results[0] 
        });
    });
});

// Cadastrar novo usuário
app.post('/usuario', (req, res) => {
    const { nome_usuario, email_usuario, senha_usuario } = req.body;

    const checkSql = "SELECT * FROM usuario WHERE nome_usuario = ? OR email_usuario = ?";
    db.query(checkSql, [nome_usuario, email_usuario], (err, results) => {
        if (err) {
            console.error('❌ Erro ao verificar usuário:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao verificar usuário' 
            });
        }

        if (results.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Usuário ou email já cadastrado!' 
            });
        }

        const insertSql = "INSERT INTO usuario (nome_usuario, email_usuario, senha_usuario) VALUES (?, ?, ?)";
        db.query(insertSql, [nome_usuario, email_usuario, senha_usuario], (err, result) => {
            if (err) {
                console.error('❌ Erro ao cadastrar usuário:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao cadastrar usuário' 
                });
            }
            res.status(201).json({ 
                success: true, 
                message: '✅ Usuário cadastrado com sucesso!', 
                id: result.insertId 
            });
        });
    });
});

// Atualizar usuário
app.put('/usuario/:id', (req, res) => {
    const { id } = req.params;
    const { nome_usuario, email_usuario, ativo_usuario } = req.body;

    const checkEmailSql = `
        SELECT id_usuario 
        FROM usuario 
        WHERE email_usuario = ? AND id_usuario != ?`;

    db.query(checkEmailSql, [email_usuario, id], (err, results) => {
        if (err) {
            console.error('❌ Erro ao verificar email:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao verificar email' 
            });
        }

        if (results.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email já está em uso por outro usuário' 
            });
        }

        const updateSql = `
            UPDATE usuario 
            SET 
                nome_usuario = ?,
                email_usuario = ?,
                ativo_usuario = ?
            WHERE id_usuario = ?`;

        db.query(updateSql, [nome_usuario, email_usuario, ativo_usuario, id], (err, result) => {
            if (err) {
                console.error('❌ Erro ao atualizar usuário:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao atualizar usuário' 
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Usuário não encontrado' 
                });
            }

            res.json({ 
                success: true, 
                message: '✅ Usuário atualizado com sucesso!' 
            });
        });
    });
});

// Atualizar status do usuário
app.put('/usuario/status/:id', (req, res) => {
    const { id } = req.params;
    const { ativo_usuario } = req.body;

    if (![0, 1].includes(Number(ativo_usuario))) {
        return res.status(400).json({ 
            success: false, 
            message: 'Status inválido. Use 0 (inativo) ou 1 (ativo)' 
        });
    }

    const sql = "UPDATE usuario SET ativo_usuario = ? WHERE id_usuario = ?";
    db.query(sql, [ativo_usuario, id], (err, result) => {
        if (err) {
            console.error('❌ Erro ao atualizar status do usuário:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao atualizar status do usuário' 
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }

        res.json({ 
            success: true, 
            message: `✅ Status do usuário atualizado para ${ativo_usuario === 1 ? 'ativo' : 'inativo'}` 
        });
    });
});

// ==================== ROTAS DE PRODUTO ====================

// Listar todos os produtos
app.get('/produto', (req, res) => {
    const sql = `
        SELECT p.*, f.nome_fornecedor 
        FROM produto p 
        LEFT JOIN fornecedor f ON p.id_produto_fornecedor = f.id_fornecedor 
        ORDER BY p.nome_produto`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Erro ao listar produtos:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao listar produtos' 
            });
        }
        res.json({ 
            success: true, 
            produtos: results 
        });
    });
});

// Buscar produto por ID
app.get('/produto/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT p.*, f.nome_fornecedor 
        FROM produto p 
        LEFT JOIN fornecedor f ON p.id_produto_fornecedor = f.id_fornecedor 
        WHERE p.id_produto = ?`;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('❌ Erro ao buscar produto:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar produto' 
            });
        }
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Produto não encontrado' 
            });
        }
        res.json({ 
            success: true, 
            produto: results[0] 
        });
    });
});

// Cadastrar novo produto
app.post('/produto', (req, res) => {
    const { nome_produto, preco_produto, id_produto_fornecedor } = req.body;

    const sql = "INSERT INTO produto (nome_produto, preco_produto, id_produto_fornecedor) VALUES (?, ?, ?)";
    db.query(sql, [nome_produto, preco_produto, id_produto_fornecedor], (err, result) => {
        if (err) {
            console.error('❌ Erro ao cadastrar produto:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao cadastrar produto' 
            });
        }
        res.status(201).json({ 
            success: true, 
            message: '✅ Produto cadastrado com sucesso!', 
            id: result.insertId 
        });
    });
});

// Atualizar produto
app.put('/produto/:id', (req, res) => {
    const { id } = req.params;
    const { nome_produto, preco_produto, id_produto_fornecedor } = req.body;

    const sql = "UPDATE produto SET nome_produto = ?, preco_produto = ?, id_produto_fornecedor = ? WHERE id_produto = ?";
    db.query(sql, [nome_produto, preco_produto, id_produto_fornecedor, id], (err, result) => {
        if (err) {
            console.error('❌ Erro ao atualizar produto:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao atualizar produto' 
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Produto não encontrado' 
            });
        }
        res.json({ 
            success: true, 
            message: '✅ Produto atualizado com sucesso!' 
        });
    });
});

// Excluir produto
app.delete('/produto/:id', (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM produto WHERE id_produto = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('❌ Erro ao excluir produto:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao excluir produto' 
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Produto não encontrado' 
            });
        }
        res.json({ 
            success: true, 
            message: '✅ Produto excluído com sucesso!' 
        });
    });
});

// ==================== ROTAS DE FORNECEDOR ====================

// Listar todos os fornecedores
app.get('/fornecedor', (req, res) => {
    const sql = "SELECT * FROM fornecedor ORDER BY nome_fornecedor";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Erro ao listar fornecedores:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao listar fornecedores' 
            });
        }
        res.json({ 
            success: true, 
            fornecedores: results 
        });
    });
});

// Buscar fornecedor por ID
app.get('/fornecedor/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM fornecedor WHERE id_fornecedor = ?";
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('❌ Erro ao buscar fornecedor:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar fornecedor' 
            });
        }
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Fornecedor não encontrado' 
            });
        }
        res.json({ 
            success: true, 
            fornecedor: results[0] 
        });
    });
});

// Cadastrar novo fornecedor
app.post('/fornecedor', (req, res) => {
    const { nome_fornecedor, cnpj_fornecedor } = req.body;

    const checkSql = "SELECT * FROM fornecedor WHERE cnpj_fornecedor = ?";
    db.query(checkSql, [cnpj_fornecedor], (err, results) => {
        if (err) {
            console.error('❌ Erro ao verificar CNPJ:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao verificar CNPJ' 
            });
        }

        if (results.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'CNPJ já cadastrado!' 
            });
        }

        const insertSql = "INSERT INTO fornecedor (nome_fornecedor, cnpj_fornecedor) VALUES (?, ?)";
        db.query(insertSql, [nome_fornecedor, cnpj_fornecedor], (err, result) => {
            if (err) {
                console.error('❌ Erro ao cadastrar fornecedor:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao cadastrar fornecedor' 
                });
            }
            res.status(201).json({ 
                success: true, 
                message: '✅ Fornecedor cadastrado com sucesso!', 
                id: result.insertId 
            });
        });
    });
});

// Atualizar fornecedor
app.put('/fornecedor/:id', (req, res) => {
    const { id } = req.params;
    const { nome_fornecedor, cnpj_fornecedor } = req.body;

    const checkSql = "SELECT * FROM fornecedor WHERE cnpj_fornecedor = ? AND id_fornecedor != ?";
    db.query(checkSql, [cnpj_fornecedor, id], (err, results) => {
        if (err) {
            console.error('❌ Erro ao verificar CNPJ:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao verificar CNPJ' 
            });
        }

        if (results.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'CNPJ já cadastrado para outro fornecedor!' 
            });
        }

        const updateSql = "UPDATE fornecedor SET nome_fornecedor = ?, cnpj_fornecedor = ? WHERE id_fornecedor = ?";
        db.query(updateSql, [nome_fornecedor, cnpj_fornecedor, id], (err, result) => {
            if (err) {
                console.error('❌ Erro ao atualizar fornecedor:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao atualizar fornecedor' 
                });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Fornecedor não encontrado' 
                });
            }
            res.json({ 
                success: true, 
                message: '✅ Fornecedor atualizado com sucesso!' 
            });
        });
    });
});

// Excluir fornecedor
app.delete('/fornecedor/:id', (req, res) => {
    const { id } = req.params;

    const checkProdutosSql = "SELECT COUNT(*) as total FROM produto WHERE id_produto_fornecedor = ?";
    db.query(checkProdutosSql, [id], (err, results) => {
        if (err) {
            console.error('❌ Erro ao verificar produtos:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao verificar produtos vinculados' 
            });
        }

        if (results[0].total > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Não é possível excluir o fornecedor pois existem produtos vinculados a ele' 
            });
        }

        const deleteSql = "DELETE FROM fornecedor WHERE id_fornecedor = ?";
        db.query(deleteSql, [id], (err, result) => {
            if (err) {
                console.error('❌ Erro ao excluir fornecedor:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao excluir fornecedor' 
                });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Fornecedor não encontrado' 
                });
            }
            res.json({ 
                success: true, 
                message: '✅ Fornecedor excluído com sucesso!' 
            });
        });
    });
});

// ==================== ROTAS DE PEDIDO ====================

// Listar todos os pedidos
app.get('/pedido', (req, res) => {
    const sql = `
        SELECT p.*, u.nome_usuario, pr.nome_produto, f.nome_fornecedor
        FROM pedido p
        LEFT JOIN usuario u ON p.id_usuario_pedido = u.id_usuario
        LEFT JOIN produto pr ON p.id_produto_pedido = pr.id_produto
        LEFT JOIN fornecedor f ON p.id_fornecedor_pedido = f.id_fornecedor
        ORDER BY p.id_pedido DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Erro ao listar pedidos:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao listar pedidos' 
            });
        }
        res.json({ 
            success: true, 
            pedidos: results 
        });
    });
});

// Buscar pedido por ID
app.get('/pedido/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT p.*, u.nome_usuario, pr.nome_produto, f.nome_fornecedor
        FROM pedido p
        LEFT JOIN usuario u ON p.id_usuario_pedido = u.id_usuario
        LEFT JOIN produto pr ON p.id_produto_pedido = pr.id_produto
        LEFT JOIN fornecedor f ON p.id_fornecedor_pedido = f.id_fornecedor
        WHERE p.id_pedido = ?`;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('❌ Erro ao buscar pedido:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar pedido' 
            });
        }
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pedido não encontrado' 
            });
        }
        res.json({ 
            success: true, 
            pedido: results[0] 
        });
    });
});

// Cadastrar novo pedido
app.post('/pedido', (req, res) => {
    const { 
        id_usuario_pedido, 
        id_produto_pedido, 
        quantidade_produto,
        preco_produto
    } = req.body;

    console.log('Dados recebidos:', req.body);

    // Verificar produto e fornecedor
    const sqlProduto = `
        SELECT p.*, f.id_fornecedor
        FROM produto p
        JOIN fornecedor f ON p.id_produto_fornecedor = f.id_fornecedor
        WHERE p.id_produto = ?`;

    db.query(sqlProduto, [id_produto_pedido], (err, resultsProduto) => {
        if (err) {
            console.error('❌ Erro ao verificar produto:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao verificar produto' 
            });
        }

        if (resultsProduto.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Produto não encontrado' 
            });
        }

        const produto = resultsProduto[0];
        const id_fornecedor = produto.id_fornecedor;

        // Inserir pedido
        const sqlPedido = `
            INSERT INTO pedido (
                id_usuario_pedido,
                id_produto_pedido,
                quantidade_produto,
                preco_produto_pedido,
                id_fornecedor_pedido
            ) VALUES (?, ?, ?, ?, ?)`;

        db.query(sqlPedido, [
            id_usuario_pedido,
            id_produto_pedido,
            quantidade_produto,
            produto.preco_produto,
            id_fornecedor
        ], (err, resultPedido) => {
            if (err) {
                console.error('❌ Erro ao cadastrar pedido:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao cadastrar pedido' 
                });
            }

            res.status(201).json({ 
                success: true, 
                message: '✅ Pedido cadastrado com sucesso!', 
                id: resultPedido.insertId 
            });
        });
    });
});

// Atualizar pedido
app.put('/pedido/:id', (req, res) => {
    const { id } = req.params;
    const { 
        id_usuario_pedido, 
        id_produto_pedido, 
        quantidade_produto, 
        preco_produto_pedido, 
        id_fornecedor_pedido 
    } = req.body;

    const sql = `
        UPDATE pedido 
        SET 
            id_usuario_pedido = ?,
            id_produto_pedido = ?,
            quantidade_produto = ?,
            preco_produto_pedido = ?,
            id_fornecedor_pedido = ?
        WHERE id_pedido = ?`;

    db.query(sql, [
        id_usuario_pedido, 
        id_produto_pedido, 
        quantidade_produto, 
        preco_produto_pedido, 
        id_fornecedor_pedido, 
        id
    ], (err, result) => {
        if (err) {
            console.error('❌ Erro ao atualizar pedido:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao atualizar pedido' 
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pedido não encontrado' 
            });
        }
        res.json({ 
            success: true, 
            message: '✅ Pedido atualizado com sucesso!' 
        });
    });
});

// Excluir pedido
app.delete('/pedido/:id', (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM pedido WHERE id_pedido = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('❌ Erro ao excluir pedido:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao excluir pedido' 
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pedido não encontrado' 
            });
        }
        res.json({ 
            success: true, 
            message: '✅ Pedido excluído com sucesso!' 
        });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
