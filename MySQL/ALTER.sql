USE sa4;

-- Adicionar a coluna nome_usuario na tabela pedido
ALTER TABLE pedido ADD COLUMN nome_usuario VARCHAR(100) NOT NULL AFTER id_usuario_pedido;

-- Atualizar os registros existentes com os nomes dos usuários
UPDATE pedido p 
INNER JOIN usuario u ON p.id_usuario_pedido = u.id_usuario 
SET p.nome_usuario = u.nome_usuario; 