// Funções utilitárias comuns para o sistema

// Função para redirecionar
function redirecionar(pagina) {
    window.location.href = pagina;
}

// Função para formatar preço em Reais
function formatarPreco(preco) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(preco);
}

// Função para formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
}

// Função para validar CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Elimina CNPJs inválidos conhecidos
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito verificador
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;
    
    // Validação do segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;
    
    return true;
}

// Função para aplicar máscara de CNPJ
function mascaraCNPJ(cnpj) {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

// Função para verificar autenticação
function verificarAutenticacao() {
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) {
        window.location.href = 'index.html';
        return false;
    }

    try {
        const usuario = JSON.parse(usuarioData);
        if (!usuario.logado) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        window.location.href = 'index.html';
        return false;
    }
}

// Função para fazer logout
function fazerLogout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Funções compartilhadas entre todas as páginas
function adicionarMenuLateral() {
    // Adicionar o botão do menu
    if (!document.querySelector('.menu-toggle')) {
        const menuToggle = document.createElement('div');
        menuToggle.className = 'menu-toggle';
        menuToggle.onclick = toggleMenu;
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.insertBefore(menuToggle, document.body.firstChild);
    }

    // Adicionar a sidebar se não existir
    if (!document.getElementById('sidebar')) {
        const sidebar = document.createElement('div');
        sidebar.className = 'sidebar';
        sidebar.id = 'sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <h2><i class="fas fa-home"></i> Menu Principal</h2>
                <button class="close-btn" onclick="toggleMenu()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="menu-section">
                <h3><i class="fas fa-box"></i> Produtos</h3>
                <button onclick="redirecionar('produto_novo.html')">
                    <i class="fas fa-plus"></i> Cadastrar Produto
                </button>
                <button onclick="redirecionar('produto_consultar.html')">
                    <i class="fas fa-search"></i> Consultar Produto
                </button>
            </div>

            <div class="menu-section">
                <h3><i class="fas fa-shopping-cart"></i> Pedidos</h3>
                <button onclick="redirecionar('pedido_novo.html')">
                    <i class="fas fa-plus"></i> Novo Pedido
                </button>
                <button onclick="redirecionar('pedido_consultar.html')">
                    <i class="fas fa-search"></i> Consultar Pedido
                </button>
            </div>

            <div class="menu-section">
                <h3><i class="fas fa-users"></i> Usuários</h3>
                <button onclick="redirecionar('usuario_consultar.html')">
                    <i class="fas fa-search"></i> Consultar Usuários
                </button>
            </div>

            <div class="menu-section">
                <button onclick="fazerLogout()" class="logout-button">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </button>
            </div>
        `;
        document.body.insertBefore(sidebar, document.body.firstChild);
    }
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.querySelector('.content').classList.toggle('shifted');
}

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
        const usuario = verificarAutenticacao();
        if (usuario) {
            adicionarMenuLateral();
        }
    }
}); 