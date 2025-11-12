// constants & states
const COLORS = ["blue", "yellow", "red", "green"];
const LS_KEY = "buried_switch_tracker_v1";

let state = loadState();

renderAll();
updatePossibleOrders();

// event listeners
const listEl = document.getElementById("switchList");

listEl.addEventListener("click", (e) => {
  const row = e.target.closest(".switch-row");
  if (!row) return;
  const color = row.dataset.color;

  // choice exact position
  if (e.target.classList.contains("num-btn")) {
    const n = Number(e.target.dataset.n);
    if (state.excludes[color][n]) return;

    if (state.value[color] === n) {
      state.value[color] = null;
    } else {
      const occupiedBy = colorByNumber(n);
      if (occupiedBy) state.value[occupiedBy] = null;
      state.value[color] = n;
      state.excludes[color][n] = false;
    }
    saveState();
    renderAll();
    updatePossibleOrders();

    return;
  }

  if (e.target.classList.contains("x-btn")) {
    const n = Number(e.target.dataset.n);
    state.excludes[color][n] = !state.excludes[color][n];
    if (state.excludes[color][n] && state.value[color] === n) {
      state.value[color] = null;
    }
    saveState();
    renderAll();
    updatePossibleOrders();
  }
});

// reset
document.getElementById("resetBtn").addEventListener("click", () => {
  state = freshState();
  saveState();
  renderAll();
  updatePossibleOrders();
});

// render
function renderAll() {
  document.querySelectorAll(".switch-row").forEach(row => {
    const color = row.dataset.color;
    const exactColor = state.value[color];
    row.querySelectorAll(".num-col").forEach(col => {
      const n = Number(col.querySelector(".num-btn").dataset.n);
      const numBtn = col.querySelector(".num-btn");
      const xBtn = col.querySelector(".x-btn");
      const excluded = !!state.excludes[color][n];

      numBtn.classList.toggle("selected", n === exactColor);
      numBtn.classList.toggle("disabled", excluded);
      xBtn.classList.toggle("active", excluded);
    });
  });

  document.getElementById("orderStr").innerHTML = orderLineHTML();
}

function updatePossibleOrders() {
  // constraints
  const fixed = {};
  const excludes = {};
  for (const c of COLORS) {
    const v = state.value[c];
    if (v) fixed[v - 1] = c;
    excludes[c] = new Set(
      Object.entries(state.excludes[c])
        .filter(([, val]) => !!val)
        .map(([num]) => Number(num) - 1)
    );
  }

  // valid permutationer
  const perms = permutations(COLORS).filter(p => {
    for (const pos in fixed) {
      if (p[Number(pos)] !== fixed[pos])
        return false;
    }
    for (let pos = 0; pos < 4; pos++) {
      if (excludes[p[pos]].has(pos))
        return false;
    }
    return true;
  }).sort((a, b) => a.join('-').localeCompare(b.join('-')));

  // probability 1/N
  const probElements = document.getElementById("probDisplay");
  if (probElements) {
    const n = perms.length || 0;
    probElements.textContent = n > 0 ? `1/${n} (${(100 / n).toFixed(2)}%)` : "–";
  }

  // 1 column, 1 combo per row
  const grid = document.getElementById("comboGrid");
  grid.innerHTML = "";
  perms.forEach(p => {
    const div = document.createElement("div");
    div.className = "combo-pill";
    div.innerHTML = p.map(colorLabel).join(", ");
    grid.appendChild(div);
  });

  fitCombos();

}

// helpers
function colorByNumber(n) {
  return COLORS.find(c => state.value[c] === n) || null;
}
function colorLabel(c) {
  return `<span class="clr ${c}">${cap(c)}</span>`;
}

function orderLineHTML() {
  const parts = [];
  for (let i = 1; i <= 4; i++) {
    const c = colorByNumber(i);
    const label = c ? colorLabel(c) : `<span class="clr dash">—</span>`;
    parts.push(`<span class="pos"><strong> ${label}</span>`);
  }
  return parts.join(' &nbsp; • &nbsp; ');
}
function permutations(arr) {
  const res = []; const used = Array(arr.length).fill(false); const cur = [];
  (function bt() {
    if (cur.length === arr.length) { res.push(cur.slice()); return; }
    for (let i = 0; i < arr.length; i++) {
      if (used[i])
        continue;
      used[i] = true;
      cur.push(arr[i]);
      bt();
      cur.pop();
      used[i] = false;
    }
  })();
  return res;
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function freshState() {
  const st = { value: {}, excludes: {} };
  for (const c of COLORS) {
    st.value[c] = null;
    st.excludes[c] = { 1: false, 2: false, 3: false, 4: false };
  }
  return st;
}
function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return freshState();
    const obj = JSON.parse(raw);
    const st = freshState();
    for (const c of COLORS) {
      const v = obj?.value?.[c];
      st.value[c] = [1, 2, 3, 4].includes(v) ? v : null;
      const ex = obj?.excludes?.[c] || {};
      st.excludes[c] = { 1: !!ex[1], 2: !!ex[2], 3: !!ex[3], 4: !!ex[4] };
    }
    return st;
  } catch {
    return freshState();
  }
}

function fitCombos() {
  const panel = document.querySelector('.possibles-card');
  const grid = document.getElementById('comboGrid');
  if (!panel || !grid)
    return;

  // reset previous scale before measure
  grid.style.transform = '';

  const panelTop = panel.getBoundingClientRect().top;
  const pagePad = 16; // .page padding-bottom sort of
  const available = Math.max(0, window.innerHeight - panelTop - pagePad);

  const needed = grid.scrollHeight;

  // scale down if no space. never over 1.
  const scale = Math.min(1, available / needed);

  grid.style.transformOrigin = 'top left';
  grid.style.transform = `scale(${scale})`;
}