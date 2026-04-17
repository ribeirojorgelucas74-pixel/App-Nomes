/**
 * NomesApp - Lógica Completa
 * CRUD, Visualização de Base e Exportação
 */

// --- 1. ESTADO ---
let state = {
    bases: JSON.parse(localStorage.getItem('na_bases')) || [],
    records: JSON.parse(localStorage.getItem('na_records')) || [],
    settings: JSON.parse(localStorage.getItem('na_settings')) || { darkMode: true },
    currentSort: 'recent',
    statusFilter: 'todos',
    searchQuery: ''
};

// --- 2. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    toggleDark(state.settings.darkMode);
    setTimeout(() => {
        document.getElementById('splash').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        renderRecords();
    }, 1500);
});

function saveData() {
    localStorage.setItem('na_bases', JSON.stringify(state.bases));
    localStorage.setItem('na_records', JSON.stringify(state.records));
    localStorage.setItem('na_settings', JSON.stringify(state.settings));
}

// --- 3. NAVEGAÇÃO ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${pageId}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === pageId);
    });

    if (pageId === 'home') renderRecords();
    if (pageId === 'bases') renderBases();
}

// --- 4. VER E EDITAR BASE (A solução para o seu problema) ---
function openBaseDetail(baseId) {
    const base = state.bases.find(b => b.id === baseId);
    if (!base) return;

    const records = state.records.filter(r => r.baseId === baseId);
    
    // Mostra o modal de detalhes (certifique-se que o ID existe no HTML)
    const modal = document.getElementById('modal-base-detail'); 
    // Se não tiver modal de detalhe específico, vamos usar um alert/prompt para teste rápido ou renderizar na página
    
    let info = `Base: ${base.name}\nRegistos: ${records.length}\nCampos: ${base.fields.join(', ')}`;
    alert(info);
}

function openBaseDetail(baseId) {
    const base = state.bases.find(b => b.id === baseId);
    if (!base) return;

    const records = state.records.filter(r => r.baseId === baseId);

    const container = document.getElementById('basedetail-content');

    container.innerHTML = `
        <div class="page-header">
            <h2>${base.name}</h2>
            <p>${base.category}</p>
        </div>

        <div class="form-card">
            <p><strong>Total de registros:</strong> ${records.length}</p>
            <p><strong>Campos:</strong> ${base.fields.join(', ')}</p>
        </div>

        <div class="section-header">
            <h3>Registros</h3>
        </div>

        <div class="records-list">
            ${records.map(r => `
                <div class="record-item">
                    <div class="rec-info">
                        <div class="rec-name">${r.nome || 'Sem nome'}</div>
                        <div class="rec-meta">${r.category || ''}</div>
                    </div>
                    <span class="badge badge-${(r.status || '').toLowerCase()}">${r.status || ''}</span>
                </div>
            `).join('')}
        </div>
    `;

    showPage('basedetail');
}
// --- 5. EXPORTAÇÃO DE ARQUIVOS (CSV) ---
function exportToCSV() {
    if (state.records.length === 0) return alert("Não há dados para exportar.");

    // Pegar todos os cabeçalhos únicos de todos os registros
    const headersSet = new Set();

state.records.forEach(r => {
    Object.keys(r).forEach(k => headersSet.add(k));
});

const headers = Array.from(headersSet);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    state.records.forEach(rec => {
        let row = headers.map(h => `"${rec[h] || ''}"`);
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `exportacao_nomesapp_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("Arquivo exportado com sucesso!");
}

// --- 6. RENDERIZAÇÃO ---
function renderRecords() {
    const list = document.getElementById('records-list');
    let filtered = state.records.filter(r => {
        const matchesSearch = (r.nome || "").toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesStatus = state.statusFilter === 'todos' || r.status === state.statusFilter;
        return matchesSearch && matchesStatus;
    });

    list.innerHTML = '';
    filtered.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'record-item';
        item.innerHTML = `
            <div class="rec-info">
                <div class="rec-name">${rec.nome || 'Sem nome'}</div>
                <div class="rec-meta">${rec.category}</div>
            </div>
            <span class="badge badge-${rec.status.toLowerCase()}">${rec.status}</span>
            <button onclick="editRecord('${rec.id}')" style="background:none; border:none; color:var(--accent)">Editar</button>
        `;
        list.appendChild(item);
    });
}

function editRecord(id) {
    const rec = state.records.find(r => r.id === id);
    const novoNome = prompt("Editar nome:", rec.nome);
    if (novoNome) {
        rec.nome = novoNome;
        saveData();
        renderRecords();
    }
}

function renderBases() {
    const container = document.getElementById('bases-list');
    container.innerHTML = '';

    state.bases.forEach(base => {
        const card = document.createElement('div');
        card.className = 'base-card';
        card.innerHTML = `
            <h4>${base.name}</h4>
            <p>${base.category}</p>
            <div style="display:flex; gap:8px;">
                <button onclick="openBaseDetail('${base.id}')">Abrir</button>
                <button onclick="deleteBase('${base.id}')">Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Utilitários
function toggleDark(isDark) {
    document.body.classList.toggle('light-mode', !isDark);
    state.settings.darkMode = isDark;
    saveData();
}
