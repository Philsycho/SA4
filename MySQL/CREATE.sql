DROP DATABASE IF EXISTS sa4;

CREATE DATABASE IF NOT EXISTS sa4;

USE sa4;

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
('admin', 'admin@email.com', '123456', 1);


