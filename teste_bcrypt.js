const bcrypt = require('bcrypt');

async function testarBcrypt() {
    try {
        console.log('Iniciando teste do bcrypt...');
        
        const senhaTest = '123456';
        console.log('Senha original:', senhaTest);
        
        const salt = await bcrypt.genSalt(10);
        console.log('Salt gerado:', salt);
        
        const hash = await bcrypt.hash(senhaTest, salt);
        console.log('Hash gerado:', hash);
        
        const verificacao = await bcrypt.compare(senhaTest, hash);
        console.log('Verificação do hash:', verificacao);
        
    } catch (error) {
        console.error('Erro no teste:', error);
    }
}

testarBcrypt(); 