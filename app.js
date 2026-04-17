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
function formatValue(field, value) {
    if (!value) return '';

    if (field.type === 'date') {
        return new Date(value).toLocaleDateString();
    }

    return value;
}

function renderRecords() {
    const list = document.getElementById('records-list');
    list.innerHTML = '';

    state.records.forEach(rec => {
        const base = state.bases.find(b => b.id === rec.baseId);

        const nomeField = base.fields.find(f => f.name === 'nome');
        const nome = rec.data?.nome || 'Sem nome';

        const item = document.createElement('div');
        item.className = 'record-item';

        item.innerHTML = `
            <div class="rec-info">
                <div class="rec-name">${nome}</div>
                <div class="rec-meta">${base.category}</div>
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
            <h2>Editar Registro</h2>
        </div>

        <div class="form-card">
            ${base.fields.map(field => {
                let value = rec.data[field.name] || '';

                if (field.type === 'date' && value) {
                    value = value.split('T')[0];
                }

                let input = '';

                switch (field.type) {
                    case 'date':
                        input = `<input type="date" id="edit-${field.name}" value="${value}" />`;
                        break;

                    case 'email':
                        input = `<input type="email" id="edit-${field.name}" value="${value}" />`;
                        break;

                    case 'select':
                        input = `
                            <select id="edit-${field.name}">
                                ${field.options.map(opt => `
                                    <option ${opt === value ? 'selected' : ''}>${opt}</option>
                                `).join('')}
                            </select>
                        `;
                        break;

                    default:
                        input = `<input type="text" id="edit-${field.name}" value="${value}" />`;
                }

                return `
                    <div class="form-group">
                        <label>${field.name}</label>
                        ${input}
                    </div>
                `;
            }).join('')}

            <button class="btn-primary btn-full" onclick="updateRecord('${rec.id}')">
                Salvar
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

        let inputHTML = '';

        switch (field.type) {
            case 'date':
                inputHTML = `<input type="date" id="field-${field.name}" />`;
                break;

            case 'email':
                inputHTML = `<input type="email" id="field-${field.name}" placeholder="email@exemplo.com" />`;
                break;

            case 'select':
                inputHTML = `
                    <select id="field-${field.name}">
                        ${field.options.map(opt => `<option>${opt}</option>`).join('')}
                    </select>
                `;
                break;

            default:
                inputHTML = `<input type="text" id="field-${field.name}" placeholder="Digite ${field.name}" />`;
        }

        div.innerHTML = `
            <label>${field.name}</label>
            ${inputHTML}
        `;

        container.appendChild(div);
    });

    actions.classList.remove('hidden');
}
function saveRecord() {
    const baseId = document.getElementById('new-base').value;
    const base = state.bases.find(b => b.id === baseId);

    const data = {};

    base.fields.forEach(field => {
        const el = document.getElementById(`field-${field.name}`);
        let value = el.value;

        if (field.type === "date" && value) {
            value = new Date(value).toISOString();
        }

        data[field.name] = value;
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

    showPage('home');
}
function createBase() {
    const name = document.getElementById('nb-name').value;
    const category = document.getElementById('nb-category').value;

    const fields = [];

    document.querySelectorAll('#fields-picker input:checked').forEach(input => {
        const fieldName = input.value;

        let type = "text";

        if (fieldName === "email") type = "email";
        if (fieldName === "data_nasc" || fieldName === "data_entrada") type = "date";
        if (fieldName === "status") type = "select";

        fields.push({
            name: fieldName,
            type,
            options: fieldName === "status" ? ["Ativo", "Pendente", "Inativo"] : null
        });
    });

    const base = {
        id: crypto.randomUUID(),
        name,
        category,
        fields
    };

    state.bases.push(base);
    saveData();
    closeModal();
    renderBases();
}
