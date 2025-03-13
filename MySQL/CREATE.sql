DROP DATABASE IF EXISTS sa4;

CREATE DATABASE IF NOT EXISTS sa4;

USE sa4;

-- Limpar todas as tabelas existentes
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS fornecedor;
DROP TABLE IF EXISTS produto;
DROP TABLE IF EXISTS estoque;
DROP TABLE IF EXISTS pedido;
SET FOREIGN_KEY_CHECKS = 1;

-- Tabela de Usuários
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_usuario VARCHAR(100) NOT NULL,
    senha_usuario VARCHAR(255) NOT NULL,
    email_usuario VARCHAR(100) UNIQUE NOT NULL,
    ativo_usuario BOOLEAN NOT NULL DEFAULT 1 -- 1 para ativo, 0 para inativo
);

-- Tabela de Fornecedores
CREATE TABLE fornecedor (
    id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    nome_fornecedor VARCHAR(100) NOT NULL,
    cnpj_fornecedor VARCHAR(18) UNIQUE NOT NULL
);

-- Tabela de Produtos
CREATE TABLE produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome_produto VARCHAR(100) NOT NULL,
    preco_produto DECIMAL(10,2) NOT NULL,
    id_produto_fornecedor INT,
    FOREIGN KEY (id_produto_fornecedor) REFERENCES fornecedor(id_fornecedor) ON DELETE SET NULL
);

-- Tabela de Estoque (Movimentações)
CREATE TABLE estoque (
    id_movimento INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo_movimento ENUM('entrada', 'saida') NOT NULL,
    id_produto_estoque INT NOT NULL,
    id_fornecedor_estoque INT,
    quantidade_movimentado INT NOT NULL,
    id_usuario_estoque INT,
    id_pedido_estoque INT,
    data_movimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto_estoque) REFERENCES produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_fornecedor_estoque) REFERENCES fornecedor(id_fornecedor) ON DELETE SET NULL,
    FOREIGN KEY (id_usuario_estoque) REFERENCES usuario(id_usuario) ON DELETE SET NULL
);

-- Tabela de Pedidos
CREATE TABLE pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_pedido INT NOT NULL,
    id_produto_pedido INT NOT NULL,
    quantidade_produto INT NOT NULL,
    preco_produto_pedido DECIMAL(10,2) NOT NULL,
    id_fornecedor_pedido INT NOT NULL,
    FOREIGN KEY (id_usuario_pedido) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_produto_pedido) REFERENCES produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_fornecedor_pedido) REFERENCES fornecedor(id_fornecedor) ON DELETE CASCADE
);

-- Inserir usuários de exemplo (senha: 123456)
INSERT INTO usuario (nome_usuario, email_usuario, senha_usuario, ativo_usuario) VALUES
('admin', 'admin@email.com', '$2b$10$RB7qqL34O0byt8kkID8P4uQ9QE0rjQon8eeDX6Qt3Bh0O5nHhEM3C', 1),
('joao', 'joao@email.com', '$2b$10$RB7qqL34O0byt8kkID8P4uQ9QE0rjQon8eeDX6Qt3Bh0O5nHhEM3C', 1),
('maria', 'maria@email.com', '$2b$10$RB7qqL34O0byt8kkID8P4uQ9QE0rjQon8eeDX6Qt3Bh0O5nHhEM3C', 1);

-- Inserir fornecedores
INSERT INTO fornecedor (nome_fornecedor, cnpj_fornecedor) VALUES
('Distribuidora ABC', '12345678000101'),
('Comercial XYZ', '98765432000102'),
('Atacado Brasil', '45678901000103'),
('Tech Solutions', '78901234000104'),
('Info Store', '32165498000105');

-- Inserir produtos
INSERT INTO produto (nome_produto, preco_produto, id_produto_fornecedor) VALUES
('Notebook Dell', 3599.99, 1),
('Mouse Gamer', 129.99, 1),
('Teclado Mecânico', 249.99, 1),
('Monitor 24"', 899.99, 2),
('Headset Gamer', 199.99, 2),
('Webcam HD', 159.99, 3),
('SSD 240GB', 299.99, 3),
('Memória RAM 8GB', 249.99, 3),
('Placa de Vídeo', 1499.99, 4),
('Processador i5', 1299.99, 4),
('Fonte 500W', 399.99, 5),
('Gabinete Gamer', 299.99, 5);

-- Inserir movimentações de estoque (entradas iniciais)
INSERT INTO estoque (id_tipo_movimento, id_produto_estoque, id_fornecedor_estoque, quantidade_movimentado, id_usuario_estoque) VALUES
('entrada', 1, 1, 10, 1),
('entrada', 2, 1, 20, 1),
('entrada', 3, 1, 15, 1),
('entrada', 4, 2, 8, 1),
('entrada', 5, 2, 12, 1),
('entrada', 6, 3, 25, 1),
('entrada', 7, 3, 30, 1),
('entrada', 8, 3, 18, 1),
('entrada', 9, 4, 5, 1),
('entrada', 10, 4, 7, 1),
('entrada', 11, 5, 15, 1),
('entrada', 12, 5, 10, 1);

-- Inserir alguns pedidos de exemplo
INSERT INTO pedido (id_usuario_pedido, id_produto_pedido, quantidade_produto, preco_produto_pedido, id_fornecedor_pedido) VALUES
(1, 1, 1, 3599.99, 1),
(1, 2, 2, 259.98, 1),
(2, 4, 1, 899.99, 2),
(2, 5, 1, 199.99, 2),
(3, 7, 2, 599.98, 3),
(3, 8, 2, 499.98, 3);

-- Registrar saídas no estoque para os pedidos
INSERT INTO estoque (id_tipo_movimento, id_produto_estoque, id_fornecedor_estoque, quantidade_movimentado, id_usuario_estoque, id_pedido_estoque) VALUES
('saida', 1, 1, 1, 1, 1),
('saida', 2, 1, 2, 1, 2),
('saida', 4, 2, 1, 2, 3),
('saida', 5, 2, 1, 2, 4),
('saida', 7, 3, 2, 3, 5),
('saida', 8, 3, 2, 3, 6);

