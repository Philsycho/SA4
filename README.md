# SA4
 
## Banco de dados

-usuario\
--id_usuario\
--nome_usuario\
--senha_usuario\
--email_usuario

-produto\
--id_produto\
--nome_produto\
--preco_produto\
--id_produto_fornecedor

-fornecedor\
--id_fornecedor\
--nome_fornecedor\
--cnpj_fornecedor

-estoque\
--id_movimento\
--id_tipo_movimento\
--id_produto_estoque\
--id_fornecedor_estoque\
--quantidade_movimentado\
--id_usuario_estoque\
--id_pedido_estoque\
--data_movimento

-pedido\
--id_usuario_pedido\
--id_produto_pedido\
--quantidade_produto\
--preco_produto_pedido\
--id_fornecedor_pedido

