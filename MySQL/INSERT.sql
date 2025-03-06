USE sa4;

-- Inserir Usuários
INSERT INTO usuario (nome_usuario, senha_usuario, email_usuario) VALUES
('admin', 'admin123', 'admin@sistema.com'),
('joao', 'joao123', 'joao@email.com'),
('maria', 'maria123', 'maria@email.com'),
('pedro', 'pedro123', 'pedro@email.com'),
('ana', 'ana123', 'ana@email.com');

-- Inserir Fornecedores
INSERT INTO fornecedor (nome_fornecedor, cnpj_fornecedor) VALUES
('Distribuidora ABC', '12.345.678/0001-01'),
('Comercial XYZ', '23.456.789/0001-02'),
('Atacado Brasil', '34.567.890/0001-03'),
('Fornecedora Sul', '45.678.901/0001-04'),
('Distribuidora Norte', '56.789.012/0001-05');

-- Inserir Produtos
INSERT INTO produto (nome_produto, preco_produto, id_produto_fornecedor) VALUES
('Notebook Dell', 3500.00, 1),
('Smartphone Samsung', 2000.00, 2),
('Monitor LG', 1200.00, 3),
('Teclado Mecânico', 300.00, 4),
('Mouse Gamer', 150.00, 5),
('Headset Gamer', 250.00, 1),
('Webcam HD', 180.00, 2),
('Impressora HP', 800.00, 3),
('Roteador TP-Link', 200.00, 4),
('SSD 480GB', 400.00, 5);

-- Inserir Pedidos
INSERT INTO pedido (id_usuario_pedido, id_produto_pedido, quantidade_produto, preco_produto_pedido, id_fornecedor_pedido) VALUES
(1, 1, 2, 3500.00, 1),
(2, 3, 3, 1200.00, 3),
(3, 5, 5, 150.00, 5),
(4, 7, 1, 180.00, 2),
(5, 9, 2, 200.00, 4);

-- Inserir Movimentações no Estoque
INSERT INTO estoque (id_tipo_movimento, id_produto_estoque, id_fornecedor_estoque, quantidade_movimentado, id_usuario_estoque) VALUES
('entrada', 1, 1, 10, 1),
('entrada', 2, 2, 15, 1),
('entrada', 3, 3, 20, 1),
('saida', 1, 1, 2, 2),
('saida', 3, 3, 3, 3),
('entrada', 4, 4, 8, 1),
('entrada', 5, 5, 12, 1),
('saida', 5, 5, 5, 4),
('entrada', 6, 1, 10, 1),
('entrada', 7, 2, 5, 1); 