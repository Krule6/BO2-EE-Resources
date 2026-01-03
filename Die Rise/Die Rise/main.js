const PYLON_ATTEMPTS = 4; //pylon allows 3 attempts per round
const DIRS = ['north', 'west', 'east', 'south'];
const DIR_LABEL = { north: 'N', west: 'W', east: 'E', south: 'S' };
const COLORS = ['red', 'blue', 'green', 'black'];
const STORAGE_KEY = 'pylon-state-v1';

// permutations (24)
function permutations(arr) {
    const permutations = [];
    const used = Array(arr.length).fill(false);
    const current = [];
    (function backtrack() {
        if (current.length === arr.length) {
            permutations.push(current.slice());
            return;
        }
        for (let i = 0; i < arr.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            current.push(arr[i]);
            backtrack();
            current.pop();
            used[i] = false;
        }
    })();
    return permutations;
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function readState() {
    const directionColors = {};
    DIRS.forEach(d => {
        const el = document.getElementById(d);
        directionColors[d] = el ? el.value || '' : '';
    });

    const colorNumbers = {};
    COLORS.forEach(c => {
        const el = document.getElementById(c);
        const v = el ? parseInt(el.value) : NaN;
        colorNumbers[c] = Number.isInteger(v) ? v : NaN;
    });

    const colorToDirection = {};
    for (const d of DIRS) {
        const c = directionColors[d];
        if (c) colorToDirection[c] = d;
    }

    return { directionColors, colorNumbers, colorToDirection };
}

/* ========= LOCAL STORAGE ========= */

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readState()));
}

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    let state;
    try {
        state = JSON.parse(raw);
    } catch {
        return;
    }

    // Restore direction → color
    for (const dir of DIRS) {
        const color = state.directionColors?.[dir] || '';
        const input = document.getElementById(dir);
        const container = document.getElementById(`${dir}-pick`);
        const img = document.getElementById(`${dir}-symbol`);
        if (!input || !container) continue;

        input.value = color;
        container.querySelectorAll('.color-btn').forEach(btn => {
            const selected = btn.dataset.color === color;
            btn.classList.toggle('selected', selected);
            if (selected && img) {
                img.style.backgroundColor = getComputedStyle(btn).backgroundColor;
            }
        });
        if (!color && img) img.style.backgroundColor = 'transparent';
    }

    // Restore color → number
    for (const col of COLORS) {
        const num = state.colorNumbers?.[col];
        const input = document.getElementById(col);
        const container = document.getElementById(`${col}-pick`);
        if (!input || !container) continue;

        input.value = Number.isInteger(num) ? String(num) : '';
        container.querySelectorAll('.number-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.value === String(num));
        });
    }
}

/* ========= VALIDATION ========= */

function permutationIsValid(perm, state) {
    const { directionColors, colorNumbers, colorToDirection } = state;

    for (const color of COLORS) {
        const pos = colorNumbers[color];
        if (!Number.isInteger(pos)) continue;

        const dirAtPos = perm[pos - 1];
        if (colorToDirection[color]) {
            if (colorToDirection[color] !== dirAtPos) return false;
        } else {
            const dirColor = directionColors[dirAtPos];
            if (dirColor && dirColor !== color) return false;
        }
    }

    for (const dir of DIRS) {
        const dirColor = directionColors[dir];
        if (!dirColor) continue;

        const num = colorNumbers[dirColor];
        if (Number.isInteger(num) && perm[num - 1] !== dir) return false;
    }

    const seen = {};
    for (const dir of DIRS) {
        const c = directionColors[dir];
        if (!c) continue;
        if (seen[c] && seen[c] !== dir) return false;
        seen[c] = dir;
    }

    return true;
}

function formatPerm(perm) {
    return perm.map(d => DIR_LABEL[d]).join(' -> ');
}

/* ========= UI UPDATES ========= */

function updateResultOrder() {
    const state = readState();
    const order = [];

    for (let i = 1; i <= 4; i++) {
        let found = '?';
        for (const d of DIRS) {
            const c = state.directionColors[d];
            if (c && state.colorNumbers[c] === i) {
                found = capitalize(d);
                break;
            }
        }
        order.push(found);
    }

    const resEl = document.getElementById('result');
    if (resEl) resEl.textContent = order.join(' -> ');
}

function updatePossibleCombinations() {
    const state = readState();
    const allPerms = permutations(DIRS);
    const validPerms = allPerms.filter(p => permutationIsValid(p, state));

    const grid = document.getElementById('comboGrid');
    const probDisplay = document.getElementById('probDisplay');
    grid.innerHTML = '';

    const n = validPerms.length;
    if (!probDisplay) return;

    if (n === 0) {
        probDisplay.textContent = '–';
        const div = document.createElement('div');
        div.className = 'combo-pill';
        div.style.color = '#ff4444';
        div.textContent = 'No valid combinations based on inputs.';
        grid.appendChild(div);
        return;
    }

    probDisplay.textContent = `1/${n} (${(100 / n).toFixed(2)}%)`;

    validPerms.forEach(perm => {
        const block = document.createElement('div');
        block.className = 'combo-pill';
        block.textContent = formatPerm(perm);
        grid.appendChild(block);
    });
}

/* ========= BUTTON LOGIC ========= */

function updateColorButtons() {
    const assigned = {};
    DIRS.forEach(dir => {
        const v = document.getElementById(dir)?.value;
        if (v) assigned[v] = dir;
    });

    DIRS.forEach(dir => {
        const container = document.getElementById(`${dir}-pick`);
        if (!container) return;
        container.querySelectorAll('.color-btn').forEach(btn => {
            const usedElsewhere = assigned[btn.dataset.color] && assigned[btn.dataset.color] !== dir;
            btn.disabled = usedElsewhere;
            btn.style.opacity = usedElsewhere ? '0.3' : '1';
            btn.style.cursor = usedElsewhere ? 'not-allowed' : 'pointer';
        });
    });
}

function updateNumberButtons() {
    const assigned = {};
    COLORS.forEach(col => {
        const v = document.getElementById(col)?.value;
        if (v) assigned[v] = col;
    });

    COLORS.forEach(col => {
        const container = document.getElementById(`${col}-pick`);
        if (!container) return;
        container.querySelectorAll('.number-btn').forEach(btn => {
            const usedElsewhere = assigned[btn.dataset.value] && assigned[btn.dataset.value] !== col;
            btn.disabled = usedElsewhere;
            btn.style.opacity = usedElsewhere ? '0.3' : '1';
            btn.style.cursor = usedElsewhere ? 'not-allowed' : 'pointer';
        });
    });
}

function calculateTileOrder() {
    updateResultOrder();
    updatePossibleCombinations();
    saveState();
}

/* ========= SETUP ========= */

function setupControls() {
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            const container = btn.closest('.color-pick');
            const dir = container.id.replace('-pick', '');
            const input = document.getElementById(dir);
            const img = document.getElementById(`${dir}-symbol`);
            const color = btn.dataset.color;

            if (input.value === color) {
                input.value = '';
                container.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
                if (img) img.style.backgroundColor = 'transparent';
            } else {
                input.value = color;
                container.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                if (img) img.style.backgroundColor = getComputedStyle(btn).backgroundColor;
            }

            updateColorButtons();
            calculateTileOrder();
        });
    });

    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            const input = document.getElementById(btn.dataset.color);

            if (input.value === btn.dataset.value) {
                input.value = '';
                btn.classList.remove('selected');
            } else {
                input.value = btn.dataset.value;
                btn.parentElement.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            }

            updateNumberButtons();
            calculateTileOrder();
        });
    });
}

/* ========= INIT ========= */

window.addEventListener('DOMContentLoaded', () => {
    setupControls();
    loadState();
    updateColorButtons();
    updateNumberButtons();
    calculateTileOrder();
});
