# SA4 - Sistema de Gerenciamento

Este sistema oferece uma solução completa para gerenciamento de produtos, fornecedores, usuários e pedidos através de uma API REST com interface web.

## Índice

- [Requisitos do Sistema](#requisitos-do-sistema)
- [Instalação](#instalação)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Funcionalidades](#funcionalidades)
- [API Endpoints](#api-endpoints)
- [Guia de Contribuição](#guia-de-contribuição)
- [Licença](#licença)

## Requisitos do Sistema

- Node.js (v14.0.0 ou superior)
- MySQL (v5.7 ou superior)
- npm (v6.0.0 ou superior)
- Servidor web (Apache/Nginx) para produção

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/SA4.git
   cd SA4
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

## Configuração do Banco de Dados

1. Crie um banco de dados MySQL chamado `sa4`
2. Importe o esquema do banco de dados:
   ```bash
   mysql -u root -p sa4 < MySQL/esquema.sql
   ```
3. (Opcional) Importe dados de exemplo:
   ```bash
   mysql -u root -p sa4 < MySQL/dados_exemplo.sql
   ```

4. Configure as credenciais do banco de dados em `api.js`:
   ```javascript
   const db = mysql.createConnection({
     host: 'localhost',
     user: 'root',
     password: '', // Ajuste conforme sua configuração
     database: 'sa4'
   });
   ```

## Executando o Projeto

1. Inicie o servidor API:
   ```bash
   node api.js
   ```

2. Acesse a aplicação web em seu navegador:
   ```
   http://localhost:3000
   ```

## Estrutura do Projeto

## Banco de dados

-usuario\
--id_usuario\
--nome_usuario\
--senha_usuario\
--email_usuario\
--ativo_usuario\

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

