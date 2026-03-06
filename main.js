
// URL CORRIGIDA: trocado 'rrqqgqo' por 'rrgqqgo'
const SUPABASE_URL = 'https://mikcskmzdrcunrrgqqgo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pa2Nza216ZHJjdW5ycmdxcWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTA4MDksImV4cCI6MjA4ODM2NjgwOX0.yQltmImS5UzyGvNhcw3GydBXoZ9bp523rQknSnvkTpE'; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function adj(id, val) {
    const input = document.getElementById(id);
    input.value = parseInt(input.value || 0) + val;
}

async function saveToSupabase() {
const player = document.getElementById('playerSelect').value;
if(!player) return alert("Selecione um Player!");

const status = document.getElementById('sync-status');
status.innerText = "Conectando...";

const sheetData = {};
document.querySelectorAll('.f-field').forEach(field => {
    sheetData[field.id] = field.value;
});

// O segredo está aqui: enviamos apenas o NOME e os DADOS. 
// O Supabase cuidará do resto pois o player_name é sua chave única.
const { error } = await _supabase
    .from('fichas')
    .upsert(
        { player_name: player, data: sheetData }, 
        { onConflict: 'player_name' }
    );

if (error) {
    console.error("Erro real:", error);
    // Isso vai mostrar na tela o motivo exato do erro (ex: coluna faltando)
    status.innerText = "Erro: " + error.message; 
} else {
    status.innerText = "Sincronizado na Nuvem!";
}
}

async function loadPlayerData() {
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