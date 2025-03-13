# Sistema de Gestão de Pedidos e Estoque

## Descrição
Este é um sistema web para gestão de pedidos, produtos, fornecedores e estoque, desenvolvido com HTML, CSS, JavaScript e Node.js, utilizando MySQL como banco de dados.

## Funcionalidades Principais
- Sistema de login e autenticação de usuários
- Gestão de usuários (cadastro, edição, ativação/desativação)
- Gestão de produtos (cadastro, consulta, edição)
- Gestão de fornecedores (cadastro, consulta, edição)
- Gestão de pedidos (criação, consulta, edição)
- Controle de estoque (movimentações de entrada e saída)

## Estrutura do Banco de Dados
O sistema utiliza as seguintes tabelas:
- **usuario**: Gerenciamento de usuários do sistema
- **produto**: Cadastro de produtos
- **fornecedor**: Cadastro de fornecedores
- **estoque**: Registro de movimentações de estoque
- **pedido**: Registro de pedidos

## Requisitos
- Node.js
- MySQL
- Navegador web moderno

## Como Instalar e Executar

### 1. Configuração do Banco de Dados
1. Acesse o MySQL
2. Execute o script `MySQL/CREATE.sql` para criar o banco de dados e as tabelas

### 2. Configuração do Servidor
1. Navegue até a pasta do projeto
2. Instale as dependências:
```bash
npm install express mysql2 cors
```
3. Configure as credenciais do banco de dados no arquivo `server/api.js`
4. Inicie o servidor:
```bash
node server/api.js
```

### 3. Acessando o Sistema
1. Abra o navegador
2. Acesse `http://localhost:3000`
3. Use as credenciais iniciais para login:
   - Usuário: carlos
   - Senha: carlos123

## Páginas Principais
- **index.html**: Página de login
- **tela_inicial.html**: Dashboard principal
- **produto_consultar.html**: Consulta de produtos
- **fornecedor_consultar.html**: Consulta de fornecedores
- **pedido_consultar.html**: Consulta de pedidos
- **estoque_consultar.html**: Consulta de movimentações de estoque

## Recursos Técnicos
- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js com Express
- Banco de Dados: MySQL
- API RESTful para comunicação cliente-servidor
- Interface responsiva com design moderno

## Segurança
- Sistema de autenticação por sessão
- Validação de dados no frontend e backend
- Proteção contra SQL Injection
- Controle de acesso baseado em status do usuário

## Suporte
Para questões e suporte, por favor abra uma issue no repositório do projeto.

# SA4
 
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

