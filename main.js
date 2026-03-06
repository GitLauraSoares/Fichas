
// URL CORRIGIDA: trocado 'rrqqgqo' por 'rrgqqgo'
const SUPABASE_URL = 'https://mikcskmzdrcunrrgqqgo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pa2Nza216ZHJjdW5ycmdxcWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTA4MDksImV4cCI6MjA4ODM2NjgwOX0.yQltmImS5UzyGvNhcw3GydBXoZ9bp523rQknSnvkTpE'; 

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. TORNAR FUNÇÕES GLOBAIS (Obrigatório para funcionar com arquivos separados no Head)
window.adj = function(id, val) {
    const input = document.getElementById(id);
    if(input) input.value = parseInt(input.value || 0) + val;
}

window.saveToSupabase = async function() {
    const player = document.getElementById('playerSelect').value;
    if(!player) return alert("Selecione um Player!");

    const status = document.getElementById('sync-status');
    status.innerText = "Conectando...";

    const sheetData = {};
    document.querySelectorAll('.f-field').forEach(field => {
        sheetData[field.id] = field.value;
    });

    const { error } = await _supabase
        .from('fichas')
        .upsert(
            { player_name: player, data: sheetData }, 
            { onConflict: 'player_name' }
        );

    if (error) {
        console.error("Erro real:", error);
        status.innerText = "Erro: " + error.message; 
    } else {
        status.innerText = "Sincronizado na Nuvem!";
    }
}

window.loadPlayerData = async function() {
    const player = document.getElementById('playerSelect').value;
    if(!player) return;

    const status = document.getElementById('sync-status');
    status.innerText = "Carregando...";

    const { data, error } = await _supabase
        .from('fichas')
        .select('data')
        .eq('player_name', player)
        .maybeSingle();

    if (data && data.data) {
        Object.keys(data.data).forEach(key => {
            const field = document.getElementById(key);
            if(field) field.value = data.data[key];
        });
        status.innerText = "Dados Carregados";
    } else {
        document.querySelectorAll('.f-field').forEach(f => f.value = "");
        status.innerText = "Ficha Nova";
    }
}