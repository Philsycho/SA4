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
                <button onclick="redirecionar('cadastro_produto.html')">
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

function verificarLogin() {
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
        return usuario;
    } catch (error) {
        console.error('Erro ao verificar login:', error);
        window.location.href = 'index.html';
        return false;
    }
}

function redirecionar(pagina) {
    window.location.href = pagina;
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.querySelector('.content').classList.toggle('shifted');
}

function fazerLogout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
        const usuario = verificarLogin();
        if (usuario) {
            adicionarMenuLateral();
        }
    }
}); 