SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

DROP DATABASE IF EXISTS sa4;
CREATE DATABASE IF NOT EXISTS sa4;
USE sa4;

-- Limpar todas as tabelas existentes
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS fornecedor;
DROP TABLE IF EXISTS produto;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS nivel_acesso;
SET FOREIGN_KEY_CHECKS = 1;

-- Tabela de Níveis de Acesso
CREATE TABLE nivel_acesso (
  id_nivel int(11) NOT NULL AUTO_INCREMENT,
  nome_nivel varchar(50) NOT NULL,
  descricao_nivel text DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id_nivel),
  UNIQUE KEY nome_nivel (nome_nivel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserir níveis de acesso
INSERT INTO nivel_acesso (id_nivel, nome_nivel, descricao_nivel, created_at) VALUES
(1, 'admin', 'Acesso total ao sistema', '2025-03-18 00:25:23'),
(2, 'usuario_produto', 'Acesso às funcionalidades de produtos e fornecedores', '2025-03-18 00:25:23'),
(3, 'usuario_pedido', 'Acesso às funcionalidades de pedidos', '2025-03-18 00:25:23');

-- Tabela de Usuários
CREATE TABLE usuario (
  id_usuario int(11) NOT NULL AUTO_INCREMENT,
  nome_usuario varchar(100) NOT NULL,
  senha_usuario varchar(255) NOT NULL,
  email_usuario varchar(100) NOT NULL,
  ativo_usuario tinyint(1) NOT NULL DEFAULT 1,
  id_nivel_usuario int(11) NOT NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY email_usuario (email_usuario),
  KEY id_nivel_usuario (id_nivel_usuario),
  CONSTRAINT usuario_ibfk_1 FOREIGN KEY (id_nivel_usuario) REFERENCES nivel_acesso (id_nivel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserir usuários
INSERT INTO usuario (id_usuario, nome_usuario, senha_usuario, email_usuario, ativo_usuario, id_nivel_usuario) VALUES
(10, 'carlos', '$2b$10$voGgdDsyoO441tJYVfch3ezvrwURNDstTBOZchYC3/KYXH9yp9dzu', 'carlos@gmail.com', 1, 3),
(11, 'admin', '$2b$10$6avusTsNiUPaHgw5ql0akeupIQBWJIn.6aCZ1JYKiugPwwoDDBIJS', 'admin@gmail.com', 1, 1),
(12, 'juarez', '$2b$10$oWMSNDJQKgnH/q8qtoqluOYPqz86iHiydbhYYIlTtGCia1t5p7DCy', 'juarez@gmail.com', 1, 2);

-- Tabela de Fornecedores
CREATE TABLE fornecedor (
  id_fornecedor int(11) NOT NULL AUTO_INCREMENT,
  nome_fornecedor varchar(100) NOT NULL,
  cnpj_fornecedor varchar(18) NOT NULL,
  PRIMARY KEY (id_fornecedor),
  UNIQUE KEY cnpj_fornecedor (cnpj_fornecedor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserir fornecedores
INSERT INTO fornecedor (id_fornecedor, nome_fornecedor, cnpj_fornecedor) VALUES
(1, 'Distribuidora ABC', '12345678000101'),
(2, 'Comercial XYZ', '98765432000102'),
(3, 'Atacado Brasil', '20.300.982/0001-44'),
(4, 'Tech Solutions', '78901234000104'),
(5, 'Info Store', '32165498000105');

-- Tabela de Produtos
CREATE TABLE produto (
  id_produto int(11) NOT NULL AUTO_INCREMENT,
  nome_produto varchar(100) NOT NULL,
  preco_produto decimal(10,2) NOT NULL,
  id_produto_fornecedor int(11) DEFAULT NULL,
  PRIMARY KEY (id_produto),
  KEY id_produto_fornecedor (id_produto_fornecedor),
  CONSTRAINT produto_ibfk_1 FOREIGN KEY (id_produto_fornecedor) REFERENCES fornecedor (id_fornecedor) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserir produtos
INSERT INTO produto (id_produto, nome_produto, preco_produto, id_produto_fornecedor) VALUES
(1, 'Notebook Dell', 3599.99, 1),
(2, 'Mouse Gamer', 129.99, 1),
(3, 'Teclado Mecânico', 249.99, 1),
(4, 'Monitor 24\"', 899.99, 2),
(5, 'Headset Gamer', 199.99, 2),
(6, 'Webcam HD', 159.99, 3),
(7, 'SSD 240GB', 299.99, 3),
(8, 'Memória RAM 8GB', 249.99, 3),
(9, 'Placa de Vídeo', 1499.99, 4),
(10, 'Processador i5', 1299.99, 4),
(11, 'Fonte 500W', 399.99, 5),
(12, 'Gabinete Gamer', 299.99, 5),
(13, 'pistola 45mm', 2500.00, 1),
(14, 'Placa mae tuf gaming b510m', 899.99, 5);

-- Tabela de Pedidos
CREATE TABLE pedido (
  id_pedido int(11) NOT NULL AUTO_INCREMENT,
  id_usuario_pedido int(11) NOT NULL,
  nome_usuario varchar(100) NOT NULL,
  id_produto_pedido int(11) NOT NULL,
  quantidade_produto int(11) NOT NULL,
  preco_produto_pedido decimal(10,2) NOT NULL,
  id_fornecedor_pedido int(11) NOT NULL,
  PRIMARY KEY (id_pedido),
  KEY id_usuario_pedido (id_usuario_pedido),
  KEY id_produto_pedido (id_produto_pedido),
  KEY id_fornecedor_pedido (id_fornecedor_pedido),
  CONSTRAINT pedido_ibfk_1 FOREIGN KEY (id_usuario_pedido) REFERENCES usuario (id_usuario) ON DELETE CASCADE,
  CONSTRAINT pedido_ibfk_2 FOREIGN KEY (id_produto_pedido) REFERENCES produto (id_produto) ON DELETE CASCADE,
  CONSTRAINT pedido_ibfk_3 FOREIGN KEY (id_fornecedor_pedido) REFERENCES fornecedor (id_fornecedor) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserir pedidos
INSERT INTO pedido (id_pedido, id_usuario_pedido, nome_usuario, id_produto_pedido, quantidade_produto, preco_produto_pedido, id_fornecedor_pedido) VALUES
(20, 10, 'carlos', 11, 1, 399.99, 5),
(21, 10, 'carlos', 4, 2, 899.99, 2);

COMMIT;

