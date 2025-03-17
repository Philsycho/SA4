# Sistema de Gestão de Pedidos e Estoque

## Descrição
Este é um sistema web para gestão de pedidos, produtos, fornecedores e estoque, desenvolvido com HTML, CSS, JavaScript e Node.js, utilizando MySQL como banco de dados.

## Diagrama de Relacionamento
![Diagrama de Relacionamento](diagrama.png)

O diagrama acima mostra as seguintes relações:
- Usuário (1:N) → Pedido
- Produto (M:N) → Pedido
- Fornecedor (1:N) → Produto
- Produto (1:N) → Estoque
- Fornecedor (1:N) → Estoque

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
- MySQL (opcional, o sistema pode configurar um banco de dados automaticamente)
- Navegador web moderno

## Como Instalar e Executar

### Usando o Utilitário de Configuração

Para simplificar a instalação e execução do sistema, foi desenvolvido um utilitário que permite:

1. **Iniciar o utilitário**:
```bash
node setup.js
```

2. **Menu de opções**:
   - **Instalar/Atualizar o servidor**: Baixa a versão mais recente do servidor e instala dependências
   - **Executar o servidor**: Inicia o servidor API
   - **Configurar banco de dados**: Configura o banco de dados MySQL sem precisar do XAMPP
   - **Sair**: Encerra o utilitário

### Instalação Manual

Se preferir instalar manualmente:

1. **Configuração do Banco de Dados**
   ```bash
   mysql -u root -p < MySQL/CREATE.sql
   ```

2. **Instalação de Dependências**
   ```bash
   npm install express mysql2 cors
   ```

3. **Iniciar o Servidor**
   ```bash
   node server/api.js
   ```

## Acessando o Sistema
1. Abra o navegador
2. Acesse `http://localhost:3000`
3. Use as credenciais iniciais para login:
   - Usuário: admin
   - Senha: 123456

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

---
## Banco de dados
Como já citado o SGBDs utilizado é MySQL, para a execução na comunicação com o banco de dados é necessário a execução do `DB.js`, para manter a conexão .

![Teste](Apresentacao/SA4.png)



## Suporte
Para questões e suporte, por favor abra uma issue no repositório do projeto.