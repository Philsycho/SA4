<<<<<<< HEAD
DROP IF EXISTS sa4;

CREATE IF NOT EXISTS sa4;

USE sa4;


CREATE DATABASE IF NOT EXISTS sa4;
USE sa4;

=======
DROP DATABASE IF EXISTS sa4;

CREATE DATABASE IF NOT EXISTS sa4;

USE sa4;
>>>>>>> Carlos

-- Tabela de Usuários
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_usuario VARCHAR(100) NOT NULL,
    senha_usuario VARCHAR(255) NOT NULL,
    email_usuario VARCHAR(100) UNIQUE NOT NULL
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
<<<<<<< HEAD
=======
INSERT INTO usuario (id_usuario, nome_usuario, senha_usuario, email_usuario) VALUES
(1, 'carlos', 'carlos123', 'carlos@gmail.com'),
(2, 'juarez', 'juarez123', 'juarez@gmail.com'),
(3, 'lucas', 'lucas123', 'lucas@gmail.com');
>>>>>>> Carlos
