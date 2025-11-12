const PYLON_ATTEMPTS = 3; //pylon allows 3 attempts per round
const DIRS = ['north', 'west', 'east', 'south'];
const DIR_LABEL = { north: 'N', west: 'W', east: 'E', south: 'S' };
const COLORS = ['red', 'blue', 'green', 'black'];

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

function permutationIsValid(perm, state) {
    const { directionColors, colorNumbers, colorToDirection } = state;

    for (const color of COLORS) {
        const pos = colorNumbers[color];
        if (!Number.isInteger(pos))
            continue;
        const dirAtPos = perm[pos - 1];
        if (colorToDirection[color]) {
            if (colorToDirection[color] !== dirAtPos)
                return false;
        } else {
            const dirColor = directionColors[dirAtPos];
            if (dirColor && dirColor !== color)
                return false;
        }
    }

    for (const dir of DIRS) {
        const dirColor = directionColors[dir];
        if (!dirColor)
            continue;
        const num = colorNumbers[dirColor];
        if (Number.isInteger(num) && perm[num - 1] !== dir)
            return false;
    }

    const seen = {};
    for (const dir of DIRS) {
        const c = directionColors[dir];
        if (!c)
            continue;
        if (seen[c] && seen[c] !== dir)
            return false;
        seen[c] = dir;
    }

    return true;
}

function formatPerm(perm) {
    return perm.map(d => DIR_LABEL[d] || d.charAt(0).toUpperCase()).join(' -> ');
}

function updateResultOrder() {
    const state = readState();
    const order = [];
    for (let i = 1; i <= 4; i++) {
        let found = '?';
        for (const d of DIRS) {
            const c = state.directionColors[d];
            if (c && Number.isInteger(state.colorNumbers[c]) && state.colorNumbers[c] === i) {
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

    // fixed positions implied by direction->color->number inputs
    const fixedPos = {};
    for (const dir of DIRS) {
        const col = state.directionColors[dir];
        if (col && Number.isInteger(state.colorNumbers[col])) {
            fixedPos[state.colorNumbers[col]] = dir;
        }
    }

    const serial = arr => arr.join('|');
    const validSet = new Set(validPerms.map(p => serial(p)));
    const rotateLeft = (arr, k) => arr.slice(k).concat(arr.slice(0, k));
    const permKey = perm => perm.map(d => DIR_LABEL[d]).join('');

    // map single-letter key -> perm array
    const letterToDir = { N: 'north', W: 'west', E: 'east', S: 'south' };
    function keyToPerm(key) {
        return key.split('').map(ch => letterToDir[ch]);
    }

    // are considered the same group. This ensures patterns like WSEN and ENWS end up
    // in the same grouping regardless of which rotation appears first.
    function permToKeyLetters(perm) {
        return perm.map(d => DIR_LABEL[d]).join('');
    }

    function rotateKeyLetters(key, k) {
        return key.slice(k) + key.slice(0, k);
    }

    function canonicalRotation(key) {
        let best = key;
        for (let i = 1; i < 4; i++) {
            const r = rotateKeyLetters(key, i);
            if (r < best) best = r;
        }
        return best;
    }

    // With 24 total permutations and groups of 3, 8 groups to show all combinations.
    // Each group represents 3 consecutive rotations you can try in one round.
    const groups = [];
    const processedAsGroup = new Set();

    for (const perm of validPerms) {
        // Generate the 3-rotation group starting from this perm
        const groupPerms = [];
        let groupRespectsFix = false;

        for (let shift = 0; shift < 3; shift++) {
            const rotatedPerm = rotateLeft(perm, shift);
            const rotatedSerial = serial(rotatedPerm);

            if (validSet.has(rotatedSerial)) {
                groupPerms.push(rotatedPerm);

                let rotOk = true;
                for (const posStr in fixedPos) {
                    const pos = parseInt(posStr, 10);
                    if (rotatedPerm[pos - 1] !== fixedPos[pos]) { rotOk = false; break; }
                }
                if (rotOk) groupRespectsFix = true;
            }
        }

        const groupKey = groupPerms.map(p => serial(p)).sort().join('||');

        // Only add if we haven't seen this exact group before and it respects fixedPos
        if (groupPerms.length > 0 &&
            !processedAsGroup.has(groupKey) &&
            (Object.keys(fixedPos).length === 0 || groupRespectsFix)) {
            groups.push(groupPerms);
            processedAsGroup.add(groupKey);
        }
    }

    // If nothing produced (due to fixedPos) fallback to any validPerms that respect fixedPos, grouped as singles
    if (groups.length === 0) {
        const fallback = validPerms.filter(p => {
            for (const posStr in fixedPos) {
                const pos = parseInt(posStr, 10);
                if (p[pos - 1] !== fixedPos[pos]) return false;
            }
            return true;
        });
        fallback.forEach(p => groups.push([p]));
    }

    const hasDirectionColor = Object.values(state.directionColors).some(v => !!v);
    const hasColorNumber = Object.values(state.colorNumbers).some(v => Number.isInteger(v));
    const dedupeAcrossGroups = hasDirectionColor || hasColorNumber;

    const emitted = new Set();

    const maxGroupSize = groups.reduce((max, g) => Math.max(max, g.length), 0);
    const availableDistinct = Math.min(PYLON_ATTEMPTS, maxGroupSize);

    const perTryPct = (100 / n);
    const combinedPct = Math.min(100, (availableDistinct / n) * 100);
    if (availableDistinct === PYLON_ATTEMPTS) {
        probDisplay.textContent = `1/${n} (${perTryPct.toFixed(2)}%) — ${availableDistinct} codes per round: ${combinedPct.toFixed(2)}%`;
    } else {
        probDisplay.textContent = `1/${n} (${perTryPct.toFixed(2)}%) — ${availableDistinct} codes per round: ${combinedPct.toFixed(2)}%`;
    }

    groups.sort((a, b) => b.length - a.length);

    const groupsToRender = [];
    groups.forEach((group) => {
        const itemsToShow = [];

        group.forEach(perm => {
            const s = serial(perm);
            if (dedupeAcrossGroups && emitted.has(s))
                return; // skip duplicate when fixed info exists

            itemsToShow.push(perm);
            if (dedupeAcrossGroups) emitted.add(s);
        });

        if (itemsToShow.length > 0) {
            groupsToRender.push(itemsToShow);
        }
    });

    // Sort the collected groups by their actual size (after deduplication)
    groupsToRender.sort((a, b) => b.length - a.length);

    // render groups in order
    // Show groups with 2+ members in a groupContainer, single items without grouping
    groupsToRender.forEach((itemsToShow) => {
        const groupContainer = document.createElement('div');
        groupContainer.className = 'combo-group';

        // If group has 2+ items, show them in a groupContainer
        // If group has only 1 item, show it directly without grouping box
        if (itemsToShow.length >= 2) {
            itemsToShow.forEach(perm => {
                const block = document.createElement('div');
                block.className = 'combo-pill';
                const seqSpan = document.createElement('div');
                seqSpan.className = 'combo-seq';
                seqSpan.textContent = formatPerm(perm);
                block.appendChild(seqSpan);
                groupContainer.appendChild(block);
            });
            grid.appendChild(groupContainer);
        } else if (itemsToShow.length === 1) {
            // Show single item directly without group box
            const block = document.createElement('div');
            block.className = 'combo-pill';
            const seqSpan = document.createElement('div');
            seqSpan.className = 'combo-seq';
            seqSpan.textContent = formatPerm(itemsToShow[0]);
            block.appendChild(seqSpan);
            grid.appendChild(block);
        }
    });


}

function updateColorButtons() {
    const assigned = {};
    DIRS.forEach(dir => {
        const el = document.getElementById(dir);
        const c = el ? el.value : '';
        if (c) assigned[c] = dir;
    });

    DIRS.forEach(dir => {
        const container = document.getElementById(`${dir}-pick`);
        if (!container) return;
        container.querySelectorAll('.color-btn').forEach(btn => {
            const btnColor = btn.dataset.color;
            const isAssignedToOther = assigned[btnColor] && assigned[btnColor] !== dir;
            btn.disabled = !!isAssignedToOther;
            btn.style.opacity = isAssignedToOther ? '0.3' : '1';
            btn.style.currentsor = isAssignedToOther ? 'not-allowed' : 'pointer';
        });
    });
}

function updateNumberButtons() {
    const assignedNums = {};
    COLORS.forEach(col => {
        const el = document.getElementById(col);
        const v = el ? el.value : '';
        if (v) assignedNums[v] = col;
    });
    COLORS.forEach(col => {
        const container = document.getElementById(`${col}-pick`);
        if (!container) return;
        container.querySelectorAll('.number-btn').forEach(btn => {
            const val = btn.dataset.value;
            const isAssignedToOther = assignedNums[val] && assignedNums[val] !== col;
            btn.disabled = !!isAssignedToOther;
            btn.style.opacity = isAssignedToOther ? '0.3' : '1';
            btn.style.currentsor = isAssignedToOther ? 'not-allowed' : 'pointer';
        });
    });
}

function calculateTileOrder() {
    updateResultOrder();
    updatePossibleCombinations();
}

function setupControls() {
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled)
                return;
            const container = btn.closest('.color-pick');
            if (!container)
                return;
            const dir = container.id.replace('-pick', '');
            const color = btn.dataset.color;
            const input = document.getElementById(dir);
            const img = document.getElementById(`${dir}-symbol`);
            if (!input)
                return;
            if (input.value === color) {
                input.value = '';
                container.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
                if (img) img.style.backgroundColor = 'transparent';
            } else {
                input.value = color;
                container.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                if (img)
                    img.style.backgroundColor = getComputedStyle(btn).backgroundColor;
            }
            updateColorButtons();
            calculateTileOrder();
        });
    });

    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled)
                return;
            const color = btn.dataset.color;
            const value = btn.dataset.value;
            const input = document.getElementById(color);
            if (!input)
                return;
            if (input.value === value) {
                input.value = '';
                btn.classList.remove('selected');
            } else {
                input.value = value;
                btn.parentElement.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            }
            updateNumberButtons();
            calculateTileOrder();
        });
    });

    document.querySelectorAll('.color-pick, .number-pick').forEach(container => {
        container.addEventListener('dblclick', () => {
            const hid = container.querySelector('input[type="hidden"]');
            if (!hid)
                return;
            hid.value = '';
            container.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
            updateColorButtons();
            updateNumberButtons();
            calculateTileOrder();
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    setupControls();
    updateColorButtons();
    updateNumberButtons();
    calculateTileOrder();
});
