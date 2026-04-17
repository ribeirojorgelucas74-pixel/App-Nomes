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
function exportAllCSV() {
    if (!state.records.length) return alert("Sem dados");

    const headersSet = new Set();

    state.records.forEach(r => {
        Object.keys(r.data || {}).forEach(k => headersSet.add(k));
    });

    const headers = ["id", "baseId", ...Array.from(headersSet), "status"];

    let csv = headers.join(",") + "\n";

    state.records.forEach(r => {
        const row = headers.map(h => {
            if (h === "id") return r.id;
            if (h === "baseId") return r.baseId;
            if (h === "status") return r.status;
            return r.data?.[h] || '';
        });

        csv += row.map(v => `"${v}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "dados.csv";
    link.click();
}

// --- 6. RENDERIZAÇÃO ---
function renderRecords() {
    const list = document.getElementById('records-list');

    let filtered = state.records.filter(r => {
        const nome = (r.data?.nome || "").toLowerCase();
        return nome.includes(state.searchQuery.toLowerCase());
    });

    list.innerHTML = '';

    filtered.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'record-item';

        item.innerHTML = `
            <div class="rec-info">
                <div class="rec-name">${rec.data?.nome || 'Sem nome'}</div>
                <div class="rec-meta">${rec.category}</div>
            </div>
            <span class="badge badge-${rec.status.toLowerCase()}">${rec.status}</span>
            <button onclick="openRecordDetail('${rec.id}')">Abrir</button>
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
function deleteRecord(id) {
    if (!confirm("Excluir registro?")) return;

    state.records = state.records.filter(r => r.id !== id);
    saveData();

    showPage('home');
}
function updateRecord(id) {
    const rec = state.records.find(r => r.id === id);
    const base = state.bases.find(b => b.id === rec.baseId);

    base.fields.forEach(field => {
        const input = document.getElementById(`edit-${field}`);
        rec.data[field] = input.value;
    });

    rec.status = document.getElementById('edit-status').value;

    saveData();
    alert("Atualizado!");
    showPage('home');
}
function openRecordDetail(id) {
    const rec = state.records.find(r => r.id === id);
    const base = state.bases.find(b => b.id === rec.baseId);

    const container = document.getElementById('detail-content');

    container.innerHTML = `
        <div class="page-header">
            <h2>${rec.data?.nome || 'Registro'}</h2>
        </div>

        <div class="form-card">
            ${base.fields.map(field => `
                <div class="form-group">
                    <label>${field}</label>
                    <input id="edit-${field}" value="${rec.data[field] || ''}" />
                </div>
            `).join('')}

            <div class="form-group">
                <label>Status</label>
                <select id="edit-status">
                    <option ${rec.status === 'Ativo' ? 'selected' : ''}>Ativo</option>
                    <option ${rec.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                    <option ${rec.status === 'Inativo' ? 'selected' : ''}>Inativo</option>
                </select>
            </div>

            <button class="btn-primary btn-full" onclick="updateRecord('${rec.id}')">
                Salvar alterações
            </button>

            <button class="btn-ghost btn-full" onclick="deleteRecord('${rec.id}')">
                Excluir
            </button>
        </div>
    `;

    showPage('detail');
}
function updateFieldsForBase() {
    const baseId = document.getElementById('new-base').value;
    const container = document.getElementById('dynamic-fields');
    const actions = document.getElementById('form-actions');

    container.innerHTML = '';
    actions.classList.add('hidden');

    if (!baseId) return;

    const base = state.bases.find(b => b.id === baseId);

    base.fields.forEach(field => {
        const div = document.createElement('div');
        div.className = 'form-group';

        div.innerHTML = `
            <label>${field}</label>
            <input id="field-${field}" placeholder="Digite ${field}" />
        `;

        container.appendChild(div);
    });

    actions.classList.remove('hidden');
}
function saveRecord() {
    const baseId = document.getElementById('new-base').value;
    if (!baseId) return alert("Selecione uma base");

    const base = state.bases.find(b => b.id === baseId);

    const data = {};
    base.fields.forEach(field => {
        const input = document.getElementById(`field-${field}`);
        if (input) data[field] = input.value;
    });

    const record = {
        id: crypto.randomUUID(),
        baseId,
        data,
        status: data.status || "Ativo",
        category: base.category,
        timestamp: Date.now()
    };

    state.records.push(record);
    saveData();

    alert("Registro criado!");
    showPage('home');
}
