# SA4

## Dependências do Projeto

- [express](https://expressjs.com/) - Framework web para Node.js
- [mysql2](https://www.npmjs.com/package/mysql2) - Driver MySQL para Node.js
- [express-session](https://www.npmjs.com/package/express-session) - Middleware para gerenciamento de sessões
- [cors](https://www.npmjs.com/package/cors) - Middleware para habilitar CORS (Cross-Origin Resource Sharing)

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

## Novas Funcionalidades Implementadas

### Interface de Usuário
- **Navbar Fixa**: Adicionada uma navbar fixa no topo de todas as páginas (exceto login e boas-vindas)
  - Título da página à esquerda
  - Informações do usuário logado e botão de logout à direita
- **Dashboard**: Página principal com acesso rápido às funcionalidades do sistema
- **Consulta de Usuários**: Listagem de todos os usuários cadastrados com opção de edição
- **Consulta de Produtos**: Listagem de produtos com opções de visualização e edição
- **Consulta de Pedidos**: Listagem de pedidos com opções de visualização e edição
- **Consulta de Fornecedores**: Listagem de fornecedores cadastrados

### Autenticação e Segurança
- **Login/Logout**: Sistema de autenticação com verificação de sessão
- **Proteção de Rotas**: Todas as páginas (exceto login e boas-vindas) verificam se o usuário está autenticado
- **Armazenamento Local**: Informações do usuário são armazenadas no localStorage do navegador

### Melhorias de Usabilidade
- **Tela de Boas-vindas**: Exibe mensagem personalizada com o nome do usuário após o login
- **Redirecionamento Automático**: Após o login, redireciona automaticamente para o dashboard
- **Feedback Visual**: Mensagens de sucesso/erro em operações críticas
- **Layout Responsivo**: Interface adaptável a diferentes tamanhos de tela

## Como Executar o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o banco de dados:
   - Execute o script `CREATE.sql` no MySQL
   - Configure as credenciais no arquivo `api.js`

3. Inicie o servidor:
   ```bash
   node server/api.js
   ```

4. Acesse a aplicação:
   - Abra o arquivo `index.html` no navegador

## Estrutura de Arquivos

- `public/`: Contém os arquivos HTML, CSS e JavaScript do frontend
  - `index.html`: Página de login
  - `dashboard.html`: Página principal do sistema
  - `usuario_consultar.html`: Listagem de usuários
  - `produto_consultar.html`: Listagem de produtos
  - `pedido_consultar.html`: Listagem de pedidos
  - `fornecedor_consultar.html`: Listagem de fornecedores
  - `style.css`: Estilos globais da aplicação
- `server/`: Contém o código do backend
  - `api.js`: Servidor Node.js com as rotas da API
- `MySQL/`: Contém os scripts SQL
  - `CREATE.sql`: Script de criação do banco de dados

