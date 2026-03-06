// 1. CONFIGURAÇÃO DE CONEXÃO
// URL CORRIGIDA: Adicionado o 'c' em drcc e garantido o final rrgqqgo
const SUPABASE_URL = 'https://mikcskmzdrcunrrgqqgo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pa2Nza216ZHJjdW5ycmdxcWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTA4MDksImV4cCI6MjA4ODM2NjgwOX0.yQltmImS5UzyGvNhcw3GydBXoZ9bp523rQknSnvkTpE'; 

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. FUNÇÃO DE AJUSTE (HP/MANA)
// Exportada para window para que os botões onclick="adj(...)" funcionem
window.adj = function(id, val) {
    const input = document.getElementById(id);
    if (input) {
        input.value = parseInt(input.value || 0) + val;
    }
};

// 3. FUNÇÃO PARA SALVAR NA NUVEM
window.saveToSupabase = async function() {
    const player = document.getElementById('playerSelect').value;
    if (!player) return alert("Selecione um Player!");

    const status = document.getElementById('sync-status');
    status.innerText = "Conectando...";

    // Coleta todos os campos que possuem a classe 'f-field'
    const sheetData = {};
    document.querySelectorAll('.f-field').forEach(field => {
        sheetData[field.id] = field.value;
    });

    // Envia para a tabela 'fichas' usando o player_name como chave única
    const { error } = await _supabase
        .from('fichas')
        .upsert(
            { player_name: player, data: sheetData }, 
            { onConflict: 'player_name' }
        );

    if (error) {
        console.error("Erro no Supabase:", error);
        status.innerText = "Erro: " + error.message; 
    } else {
        status.innerText = "Sincronizado na Nuvem!";
        console.log("Dados salvos com sucesso para:", player);
    }
};

// 4. FUNÇÃO PARA CARREGAR DADOS
window.loadPlayerData = async function() {
    const player = document.getElementById('playerSelect').value;
    const status = document.getElementById('sync-status');
    
    if (!player) {
        status.innerText = "Pronto";
        return;
    }

    status.innerText = "Carregando...";

    const { data, error } = await _supabase
        .from('fichas')
        .select('data')
        .eq('player_name', player)
        .maybeSingle();

    if (error) {
        console.error("Erro ao carregar:", error);
        status.innerText = "Erro ao carregar";
        return;
    }

    if (data && data.data) {
        // Preenche os campos automaticamente
        Object.keys(data.data).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = data.data[key];
            }
        });
        status.innerText = "Dados Carregados";
    } else {
        // Se não houver dados, limpa a ficha para um novo personagem
        document.querySelectorAll('.f-field').forEach(f => f.value = "");
        status.innerText = "Ficha Nova";
    }
};