const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Configuração do banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sa4'
});

// Conectar ao banco de dados
connection.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('✅ Conectado ao banco de dados MySQL');
});

// ==================== ROTAS DE USUÁRIO ====================

// Login de usuário
app.post('/login', async (req, res) => {
    const { nome_usuario, senha_usuario } = req.body;

    try {
        connection.query(
            'SELECT * FROM usuario WHERE nome_usuario = ?',
            [nome_usuario],
            async (error, results) => {
                if (error) {
                    console.error('Erro na consulta:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao realizar login'
                    });
                }

                if (results.length === 0) {
                    return res.status(401).json({
                        success: false,
                        message: 'Usuário não encontrado'
                    });
                }

                const usuario = results[0];

                // Verificar se o usuário está ativo
                if (!usuario.ativo_usuario) {
                    return res.status(401).json({
                        success: false,
                        message: 'Usuário inativo'
                    });
                }

                // Verificar a senha
                const senhaValida = await bcrypt.compare(senha_usuario, usuario.senha_usuario);
                if (!senhaValida) {
                    return res.status(401).json({
                        success: false,
                        message: 'Senha incorreta'
                    });
                }

                // Remover a senha do objeto de resposta
                delete usuario.senha_usuario;

                res.json({
                    success: true,
                    message: 'Login realizado com sucesso',
                    usuario: {
                        ...usuario,
                        id_nivel_usuario: usuario.id_nivel_usuario
                    }
                });
            }
        );
    } catch (error) {
        console.error('Erro ao processar login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Listar todos os usuários
app.get('/usuarios', (req, res) => {
    connection.query(
        'SELECT id_usuario, nome_usuario, email_usuario, ativo_usuario FROM usuario',
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao buscar usuários:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao buscar usuários' 
                });
            }
            res.json({ success: true, usuarios: results });
        }
    );
});

// Buscar usuário por ID
app.get('/usuario/:id', (req, res) => {
    const id = req.params.id;
    connection.query(
        'SELECT id_usuario, nome_usuario, email_usuario, ativo_usuario FROM usuario WHERE id_usuario = ?',
        [id],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao buscar usuário:', error);
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
            res.json({ success: true, usuario: results[0] });
        }
    );
});

// Rota para cadastrar novo usuário
app.post('/usuario', async (req, res) => {
    const { nome_usuario, email_usuario, senha_usuario, id_nivel_usuario } = req.body;

    console.log('Dados recebidos:', { nome_usuario, email_usuario, id_nivel_usuario });

    // Validar dados recebidos
    if (!nome_usuario || !email_usuario || !senha_usuario || !id_nivel_usuario) {
        return res.status(400).json({ 
            success: false, 
            message: 'Todos os campos são obrigatórios' 
        });
    }

    try {
        // Verificar se usuário já existe
        const checkUser = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM usuario WHERE nome_usuario = ? OR email_usuario = ?',
                [nome_usuario, email_usuario],
                (error, results) => {
                    if (error) reject(error);
                    else resolve(results);
                }
            );
        });

        if (checkUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Usuário ou email já cadastrado'
            });
        }

        // Criptografar a senha
        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(senha_usuario, salt);

        // Mapear o nível do usuário para o ENUM correto
        let nivel_usuario;
        switch(parseInt(id_nivel_usuario)) {
            case 1:
                nivel_usuario = 'admin';
                break;
            case 2:
                nivel_usuario = 'usuario_produto';
                break;
            case 3:
                nivel_usuario = 'usuario_pedido';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Nível de usuário inválido'
                });
        }

        console.log('Nível mapeado:', nivel_usuario);

        // Inserir novo usuário
        connection.query(
            'INSERT INTO usuario (nome_usuario, email_usuario, senha_usuario, id_nivel_usuario, ativo_usuario) VALUES (?, ?, ?, ?, 1)',
            [nome_usuario, email_usuario, senha_hash, id_nivel_usuario],
            (error, results) => {
                if (error) {
                    console.error('Erro ao cadastrar usuário:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao cadastrar usuário: ' + error.message
                    });
                }

                res.json({
                    success: true,
                    message: 'Usuário cadastrado com sucesso',
                    id_usuario: results.insertId
                });
            }
        );
    } catch (error) {
        console.error('Erro ao processar cadastro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor: ' + error.message
        });
    }
});

// Atualizar usuário
app.put('/usuario/:id', (req, res) => {
    const id = req.params.id;
    const { nome_usuario, email_usuario, ativo_usuario } = req.body;

    connection.query(
        'UPDATE usuario SET nome_usuario = ?, email_usuario = ?, ativo_usuario = ? WHERE id_usuario = ?',
        [nome_usuario, email_usuario, ativo_usuario, id],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao atualizar usuário:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao atualizar usuário' 
                });
            }
            res.json({ success: true, message: 'Usuário atualizado com sucesso' });
        }
    );
});

// Atualizar status do usuário
app.put('/usuario/status/:id', (req, res) => {
    const id = req.params.id;
    const { ativo_usuario } = req.body;

    if (![0, 1].includes(Number(ativo_usuario))) {
        return res.status(400).json({ 
            success: false, 
            message: 'Status inválido. Use 0 (inativo) ou 1 (ativo)' 
        });
    }

    connection.query(
        'UPDATE usuario SET ativo_usuario = ? WHERE id_usuario = ?',
        [ativo_usuario, id],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao atualizar status do usuário:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao atualizar status do usuário' 
                });
            }
            res.json({ success: true, message: 'Status do usuário atualizado com sucesso' });
        }
    );
});

// ==================== ROTAS DE PRODUTO ====================

// Listar todos os produtos
app.get('/produto', (req, res) => {
    const query = `
        SELECT p.*, f.nome_fornecedor 
        FROM produto p 
        LEFT JOIN fornecedor f ON p.id_produto_fornecedor = f.id_fornecedor 
        ORDER BY p.nome_produto
    `;
    
    connection.query(query, (error, results) => {
        if (error) {
            console.error('❌ Erro ao buscar produtos:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar produtos' 
            });
        }
        res.json({ success: true, produtos: results });
    });
});

// Buscar produto por ID
app.get('/produto/:id', (req, res) => {
    const id = req.params.id;
    connection.query(
        'SELECT * FROM produto WHERE id_produto = ?',
        [id],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao buscar produto:', error);
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
            res.json(results[0]);
        }
    );
});

// Cadastrar novo produto
app.post('/produto', (req, res) => {
    const { nome_produto, preco_produto, id_produto_fornecedor } = req.body;
    connection.query(
        'INSERT INTO produto (nome_produto, preco_produto, id_produto_fornecedor) VALUES (?, ?, ?)',
        [nome_produto, preco_produto, id_produto_fornecedor],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao criar produto:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao criar produto' 
                });
            }
            res.status(201).json({ 
                success: true, 
                message: 'Produto criado com sucesso',
                id: results.insertId 
            });
        }
    );
});

// Atualizar produto
app.put('/produto/:id', (req, res) => {
    const id = req.params.id;
    const { nome_produto, preco_produto, id_produto_fornecedor } = req.body;
    connection.query(
        'UPDATE produto SET nome_produto = ?, preco_produto = ?, id_produto_fornecedor = ? WHERE id_produto = ?',
        [nome_produto, preco_produto, id_produto_fornecedor, id],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao atualizar produto:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao atualizar produto' 
                });
            }
            res.json({ success: true, message: 'Produto atualizado com sucesso' });
        }
    );
});

// Excluir produto
app.delete('/produto/:id', (req, res) => {
    const id = req.params.id;
    connection.query(
        'DELETE FROM produto WHERE id_produto = ?',
        [id],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao excluir produto:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao excluir produto' 
                });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Produto não encontrado' 
                });
            }
            res.json({ success: true, message: 'Produto excluído com sucesso' });
        }
    );
});

// ==================== ROTAS DE FORNECEDOR ====================

// Listar todos os fornecedores
app.get('/fornecedor', (req, res) => {
    connection.query('SELECT * FROM fornecedor', (error, results) => {
        if (error) {
            console.error('❌ Erro ao buscar fornecedores:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar fornecedores' 
            });
        }
        res.json({ success: true, fornecedores: results });
    });
});

// Buscar fornecedor por ID
app.get('/fornecedor/:id', (req, res) => {
    const id = req.params.id;
    connection.query(
        'SELECT * FROM fornecedor WHERE id_fornecedor = ?',
        [id],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao buscar fornecedor:', error);
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
            res.json({ success: true, fornecedor: results[0] });
        }
    );
});

// Cadastrar novo fornecedor
app.post('/fornecedor', (req, res) => {
    const { nome_fornecedor, cnpj_fornecedor } = req.body;
    connection.query(
        'INSERT INTO fornecedor (nome_fornecedor, cnpj_fornecedor) VALUES (?, ?)',
        [nome_fornecedor, cnpj_fornecedor],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao criar fornecedor:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao criar fornecedor' 
                });
            }
            res.status(201).json({ 
                success: true, 
                message: 'Fornecedor criado com sucesso',
                id: results.insertId 
            });
        }
    );
});

// Atualizar fornecedor
app.put('/fornecedor/:id', (req, res) => {
    const id = req.params.id;
    const { nome_fornecedor, cnpj_fornecedor } = req.body;
    connection.query(
        'UPDATE fornecedor SET nome_fornecedor = ?, cnpj_fornecedor = ? WHERE id_fornecedor = ?',
        [nome_fornecedor, cnpj_fornecedor, id],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao atualizar fornecedor:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao atualizar fornecedor' 
                });
            }
            res.json({ success: true, message: 'Fornecedor atualizado com sucesso' });
        }
    );
});

// Excluir fornecedor
app.delete('/fornecedor/:id', (req, res) => {
    const id = req.params.id;
    connection.query(
        'DELETE FROM fornecedor WHERE id_fornecedor = ?',
        [id],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao excluir fornecedor:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao excluir fornecedor' 
                });
            }
            res.json({ success: true, message: 'Fornecedor excluído com sucesso' });
        }
    );
});

// ==================== ROTAS DE PEDIDO ====================

// Listar todos os pedidos
app.get('/pedido', (req, res) => {
    const query = `
        SELECT p.*, pr.nome_produto, f.nome_fornecedor
        FROM pedido p
        LEFT JOIN produto pr ON p.id_produto_pedido = pr.id_produto
        LEFT JOIN fornecedor f ON p.id_fornecedor_pedido = f.id_fornecedor
        ORDER BY p.id_pedido DESC
    `;
    
    connection.query(query, (error, results) => {
        if (error) {
            console.error('❌ Erro ao buscar pedidos:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar pedidos' 
            });
        }
        res.json({ success: true, pedidos: results });
    });
});

// Buscar pedido por ID
app.get('/pedido/:id', (req, res) => {
    const id = req.params.id;
    connection.query(
        'SELECT * FROM pedido WHERE id_pedido = ?',
        [id],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao buscar pedido:', error);
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
            res.json(results[0]);
        }
    );
});

// Cadastrar novo pedido
app.post('/pedido', (req, res) => {
    const { 
        id_usuario_pedido,
        nome_usuario,
        id_produto_pedido,
        quantidade_produto,
        preco_produto
    } = req.body;

    // Primeiro, buscar o fornecedor do produto
    connection.query(
        'SELECT id_produto_fornecedor FROM produto WHERE id_produto = ?',
        [id_produto_pedido],
        (error, results) => {
            if (error) {
                console.error('❌ Erro ao buscar fornecedor do produto:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao criar pedido' 
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Produto não encontrado' 
                });
            }

            const id_fornecedor = results[0].id_produto_fornecedor;

            // Criar o pedido
            connection.query(
                `INSERT INTO pedido (
                    id_usuario_pedido, 
                    nome_usuario,
                    id_produto_pedido, 
                    quantidade_produto, 
                    preco_produto_pedido,
                    id_fornecedor_pedido
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    id_usuario_pedido,
                    nome_usuario,
                    id_produto_pedido,
                    quantidade_produto,
                    preco_produto,
                    id_fornecedor
                ],
                (error, results) => {
                    if (error) {
                        console.error('❌ Erro ao criar pedido:', error);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Erro ao criar pedido' 
                        });
                    }
                    res.status(201).json({ 
                        success: true, 
                        message: 'Pedido criado com sucesso',
                        id_pedido: results.insertId 
                    });
                }
            );
        }
    );
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

    connection.query(sql, [
        id_usuario_pedido, 
        id_produto_pedido, 
        quantidade_produto, 
        preco_produto_pedido, 
        id_fornecedor_pedido, 
        id
    ], (error, results) => {
        if (error) {
            console.error('❌ Erro ao atualizar pedido:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao atualizar pedido' 
            });
        }
        if (results.affectedRows === 0) {
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
    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.error('❌ Erro ao excluir pedido:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao excluir pedido' 
            });
        }
        if (results.affectedRows === 0) {
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

// Rota para buscar níveis de acesso
app.get('/niveis', (req, res) => {
    // Retornar os níveis de acesso fixos
    const niveis = [
        { id: 1, nome: 'Administrador', nivel: 'admin' },
        { id: 2, nome: 'Usuário de Produtos', nivel: 'usuario_produto' },
        { id: 3, nome: 'Usuário de Pedidos', nivel: 'usuario_pedido' }
    ];
    res.json({ success: true, niveis: niveis });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
