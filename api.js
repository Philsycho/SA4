const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const SALT_ROUNDS = 10; // Número de rounds para o salt do bcrypt

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sa4'
});

// Teste de conexão com o banco
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});

// Função auxiliar para criptografar senha
async function criptografarSenha(senha) {
    try {
        console.log('Iniciando criptografia para senha:', senha);
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        console.log('Salt gerado:', salt);
        const hash = await bcrypt.hash(senha, salt);
        console.log('Hash final gerado:', hash);
        
        // Verificar se o hash foi gerado corretamente
        const verificacao = await bcrypt.compare(senha, hash);
        console.log('Verificação do hash:', verificacao);
        
        if (!hash.startsWith('$2b$') || hash.length < 50) {
            throw new Error('Hash gerado não está no formato correto do bcrypt');
        }
        
        return hash;
    } catch (error) {
        console.error('Erro detalhado ao criptografar senha:', error);
        throw new Error(`Erro ao criptografar senha: ${error.message}`);
    }
}

// Função auxiliar para verificar senha
async function verificarSenha(senha, hash) {
    try {
        return await bcrypt.compare(senha, hash);
    } catch (error) {
        console.error('Erro ao verificar senha:', error);
        throw new Error('Erro ao verificar senha');
    }
}

// Rota de teste
app.get('/', (req, res) => {
    res.json({ message: 'API está funcionando!' });
});

// Rota de login
app.post('/login', async (req, res) => {
    console.log('Recebida requisição de login');
    const { nome_usuario, senha_usuario } = req.body;

    console.log('Dados recebidos:', { nome_usuario, senha_length: senha_usuario?.length });

    if (!nome_usuario || !senha_usuario) {
        console.log('Dados incompletos');
        return res.status(400).json({ 
            success: false, 
            message: 'Nome de usuário e senha são obrigatórios' 
        });
    }

    try {
        console.log('Buscando usuário no banco...');
        const query = 'SELECT * FROM usuario WHERE nome_usuario = ? AND ativo_usuario = 1';
        
        connection.query(query, [nome_usuario], async (error, results) => {
            if (error) {
                console.error('Erro ao buscar usuário:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro interno do servidor' 
                });
            }

            if (results.length === 0) {
                console.log('Usuário não encontrado');
                return res.status(401).json({ 
                    success: false, 
                    message: 'Usuário não encontrado ou inativo' 
                });
            }

            const usuario = results[0];
            console.log('Usuário encontrado, verificando senha...');
            
            try {
                const senhaCorreta = await bcrypt.compare(senha_usuario, usuario.senha_usuario);
                console.log('Resultado da verificação da senha:', senhaCorreta);
                
                if (!senhaCorreta) {
                    return res.status(401).json({ 
                        success: false, 
                        message: 'Senha incorreta' 
                    });
                }

                // Remove a senha do objeto antes de enviar
                delete usuario.senha_usuario;

                console.log('Login bem-sucedido');
                res.json({ 
                    success: true, 
                    message: 'Login realizado com sucesso', 
                    usuario 
                });
            } catch (error) {
                console.error('Erro ao verificar senha:', error);
                res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao verificar credenciais' 
                });
            }
        });
    } catch (error) {
        console.error('Erro no processo de login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao processar login' 
        });
    }
});

// Rota para criar novo usuário
app.post('/usuario', async (req, res) => {
    const { nome_usuario, email_usuario, senha_usuario } = req.body;

    console.log('=== Início do cadastro de novo usuário ===');
    console.log('Dados recebidos:', { 
        nome_usuario, 
        email_usuario, 
        senha_length: senha_usuario ? senha_usuario.length : 0
    });

    if (!nome_usuario || !email_usuario || !senha_usuario) {
        return res.status(400).json({ 
            success: false, 
            message: 'Todos os campos são obrigatórios' 
        });
    }

    try {
        // Gerar hash da senha
        const senhaCriptografada = await bcrypt.hash(senha_usuario, SALT_ROUNDS);
        console.log('Hash gerado:', senhaCriptografada);

        // Verificar se usuário já existe
        const checkQuery = 'SELECT * FROM usuario WHERE nome_usuario = ? OR email_usuario = ?';
        
        connection.query(checkQuery, [nome_usuario, email_usuario], (error, results) => {
            if (error) {
                console.error('Erro ao verificar usuário:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao verificar usuário existente' 
                });
            }

            if (results.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Usuário ou email já cadastrado' 
                });
            }

            // Inserir novo usuário
            const insertQuery = 'INSERT INTO usuario (nome_usuario, email_usuario, senha_usuario, ativo_usuario) VALUES (?, ?, ?, 1)';
            
            connection.query(insertQuery, [nome_usuario, email_usuario, senhaCriptografada], (error, results) => {
                if (error) {
                    console.error('Erro ao inserir usuário:', error);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Erro ao criar usuário',
                        error: error.message
                    });
                }

                // Verificar se o usuário foi inserido corretamente
                connection.query('SELECT * FROM usuario WHERE id_usuario = ?', [results.insertId], (err, rows) => {
                    if (!err && rows.length > 0) {
                        console.log('Senha armazenada:', rows[0].senha_usuario);
                        console.log('Tamanho da senha armazenada:', rows[0].senha_usuario.length);
                    }
                });

                res.status(201).json({ 
                    success: true, 
                    message: 'Usuário criado com sucesso', 
                    id: results.insertId 
                });
            });
        });
    } catch (error) {
        console.error('Erro ao processar registro:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao processar registro',
            error: error.message
        });
    }
});

// Rota para atualizar usuário
app.put('/usuario/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_usuario, email_usuario, senha_usuario, ativo_usuario } = req.body;

    try {
        let updateQuery = 'UPDATE usuario SET';
        const values = [];
        const updates = [];

        if (nome_usuario) {
            updates.push(' nome_usuario = ?');
            values.push(nome_usuario);
        }
        if (email_usuario) {
            updates.push(' email_usuario = ?');
            values.push(email_usuario);
        }
        if (senha_usuario) {
            updates.push(' senha_usuario = ?');
            const senhaCriptografada = await criptografarSenha(senha_usuario);
            values.push(senhaCriptografada);
        }
        if (ativo_usuario !== undefined) {
            updates.push(' ativo_usuario = ?');
            values.push(ativo_usuario);
        }

        if (updates.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nenhum campo para atualizar' 
            });
        }

        updateQuery += updates.join(',') + ' WHERE id_usuario = ?';
        values.push(id);

        connection.query(updateQuery, values, (error, results) => {
            if (error) {
                console.error('Erro ao atualizar usuário:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao atualizar usuário' 
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Usuário não encontrado' 
                });
            }

            res.json({ 
                success: true, 
                message: 'Usuário atualizado com sucesso' 
            });
        });
    } catch (error) {
        console.error('Erro ao processar atualização:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao processar atualização' 
        });
    }
});

// Rota para buscar usuário por ID
app.get('/usuario/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT id_usuario, nome_usuario, email_usuario, ativo_usuario FROM usuario WHERE id_usuario = ?';
    
    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error('Erro ao buscar usuário:', error);
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

// Rota para listar todos os usuários
app.get('/usuarios', (req, res) => {
    const query = 'SELECT id_usuario, nome_usuario, email_usuario, ativo_usuario FROM usuario';
    
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Erro ao listar usuários:', error);
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

// Rota para listar todos os produtos com informações do fornecedor
app.get('/produto', (req, res) => {
    console.log('\n=== Iniciando busca de produtos ===');
    
    const query = `
        SELECT 
            p.id_produto,
            p.nome_produto,
            p.preco_produto,
            p.id_produto_fornecedor,
            f.nome_fornecedor,
            f.cnpj_fornecedor
        FROM produto p 
        INNER JOIN fornecedor f ON p.id_produto_fornecedor = f.id_fornecedor
        ORDER BY p.nome_produto
    `;
    
    try {
        console.log('Executando query de produtos...');
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Erro ao listar produtos:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao listar produtos',
                    error: error.message
                });
            }

            console.log(`Encontrados ${results.length} produtos`);
            
            if (results.length > 0) {
                console.log('Primeiro produto encontrado:', {
                    id: results[0].id_produto,
                    nome: results[0].nome_produto,
                    preco: results[0].preco_produto,
                    fornecedor: results[0].nome_fornecedor
                });
            }

            const produtos = results.map(produto => ({
                id_produto: produto.id_produto,
                nome_produto: produto.nome_produto,
                preco_produto: parseFloat(produto.preco_produto),
                id_produto_fornecedor: produto.id_produto_fornecedor,
                nome_fornecedor: produto.nome_fornecedor,
                cnpj_fornecedor: produto.cnpj_fornecedor
            }));

            return res.json({
                success: true,
                produtos: produtos
            });
        });
    } catch (error) {
        console.error('Erro inesperado ao buscar produtos:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro inesperado ao buscar produtos',
            error: error.message
        });
    }
});

// Rota para buscar produto por ID com informações do fornecedor
app.get('/produto/:id', (req, res) => {
    const { id } = req.params;
    console.log('Buscando produto ID:', id);

    const query = `
        SELECT 
            p.*,
            f.nome_fornecedor,
            f.cnpj_fornecedor
        FROM produto p 
        INNER JOIN fornecedor f ON p.id_produto_fornecedor = f.id_fornecedor 
        WHERE p.id_produto = ?
    `;
    
    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error('Erro ao buscar produto:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar produto',
                error: error.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        const produto = {
            ...results[0],
            preco_produto: parseFloat(results[0].preco_produto)
        };

        res.json({
            success: true,
            produto: produto
        });
    });
});

// Rota para criar novo pedido
app.post('/pedido', async (req, res) => {
    console.log('Iniciando criação de pedido...');
    const { id_usuario_pedido, id_produto_pedido, quantidade_produto } = req.body;

    if (!id_usuario_pedido || !id_produto_pedido || !quantidade_produto) {
        return res.status(400).json({
            success: false,
            message: 'Dados incompletos para criar o pedido'
        });
    }

    try {
        // Primeiro, buscar o produto e suas informações
        const queryProduto = `
            SELECT 
                p.*,
                f.id_fornecedor
            FROM produto p
            INNER JOIN fornecedor f ON p.id_produto_fornecedor = f.id_fornecedor
            WHERE p.id_produto = ?
        `;

        connection.query(queryProduto, [id_produto_pedido], async (error, results) => {
            if (error) {
                console.error('Erro ao buscar produto:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar dados do produto'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            const produto = results[0];
            const preco_total = parseFloat(produto.preco_produto) * quantidade_produto;

            // Criar o pedido
            const insertPedido = `
                INSERT INTO pedido (
                    id_usuario_pedido,
                    id_produto_pedido,
                    quantidade_produto,
                    preco_produto_pedido,
                    id_fornecedor_pedido
                ) VALUES (?, ?, ?, ?, ?)
            `;

            connection.query(
                insertPedido,
                [
                    id_usuario_pedido,
                    id_produto_pedido,
                    quantidade_produto,
                    preco_total,
                    produto.id_fornecedor
                ],
                (error, result) => {
                    if (error) {
                        console.error('Erro ao criar pedido:', error);
                        return res.status(500).json({
                            success: false,
                            message: 'Erro ao criar pedido',
                            error: error.message
                        });
                    }

                    // Registrar movimento no estoque
                    const insertEstoque = `
                        INSERT INTO estoque (
                            id_tipo_movimento,
                            id_produto_estoque,
                            id_fornecedor_estoque,
                            quantidade_movimentado,
                            id_usuario_estoque,
                            id_pedido_estoque
                        ) VALUES ('saida', ?, ?, ?, ?, ?)
                    `;

                    connection.query(
                        insertEstoque,
                        [
                            id_produto_pedido,
                            produto.id_fornecedor,
                            quantidade_produto,
                            id_usuario_pedido,
                            result.insertId
                        ],
                        (error) => {
                            if (error) {
                                console.error('Erro ao registrar movimento no estoque:', error);
                            }
                        }
                    );

                    res.status(201).json({
                        success: true,
                        message: 'Pedido criado com sucesso',
                        id_pedido: result.insertId
                    });
                }
            );
        });
    } catch (error) {
        console.error('Erro ao processar pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar pedido',
            error: error.message
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 