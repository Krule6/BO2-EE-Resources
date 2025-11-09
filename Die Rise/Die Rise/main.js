const DIRECTIONS = ['North', 'West', 'East', 'South'];
const COLORS = ['red', 'blue', 'green', 'black'];

function calculateTileOrder() {
    const direction = { 'North': document.getElementById("north").value, 'West': document.getElementById("west").value, 'East': document.getElementById("east").value, 'South': document.getElementById("south").value };

    const colors = { 'red': parseInt(document.getElementById("red").value), 'blue': parseInt(document.getElementById("blue").value), 'green': parseInt(document.getElementById("green").value), 'black': parseInt(document.getElementById("black").value) };

    const match = Object.entries(direction).map(([dir, color]) => {
        if (!color || isNaN(colors[color])) {
            return { direction: dir, value: null };
        } else {
            return { direction: dir, value: colors[color] };
        }
    });

    let order = [];

    for (let i = 1; i <= 4; i++) {
        let colorDirectionMatched = match.find(m => m && m.value === i);
        order.push(colorDirectionMatched ? colorDirectionMatched.direction : "?");
    }

    document.getElementById("result").textContent = order.join(" ➡ ");
    
    // Update possible combinations
    updatePossibleCombinations();
}

function updateColorButtons() {
    // Get all assigned colors
    const assignedColors = {};
    DIRECTIONS.forEach(dir => {
        const color = document.getElementById(dir.toLowerCase()).value;
        if (color) {
            assignedColors[color] = dir;
        }
    });

    // Update all color buttons
    DIRECTIONS.forEach(dir => {
        const dirLower = dir.toLowerCase();
        const currentColor = document.getElementById(dirLower).value;
        const colorButtons = document.querySelectorAll(`#${dirLower}-pick .color-btn`);
        
        colorButtons.forEach(btn => {
            const btnColor = btn.dataset.color;
            const isAssignedToOther = assignedColors[btnColor] && assignedColors[btnColor] !== dir;
            
            if (isAssignedToOther) {
                btn.disabled = true;
                btn.style.opacity = '0.3';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        });
    });
}

function updateNumberButtons() {
    // Get all assigned numbers
    const assignedNumbers = {};
    COLORS.forEach(color => {
        const number = document.getElementById(color).value;
        if (number) {
            assignedNumbers[number] = color;
        }
    });

    // Update all number buttons
    COLORS.forEach(color => {
        const currentNumber = document.getElementById(color).value;
        const numberButtons = document.querySelectorAll(`#${color}-pick .number-btn`);
        
        numberButtons.forEach(btn => {
            const btnValue = btn.dataset.value;
            const isAssignedToOther = assignedNumbers[btnValue] && assignedNumbers[btnValue] !== color;
            
            if (isAssignedToOther) {
                btn.disabled = true;
                btn.style.opacity = '0.3';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        });
    });
}

function updatePossibleCombinations() {
    // Get current constraints
    const directionColors = {
        'North': document.getElementById("north").value,
        'West': document.getElementById("west").value,
        'East': document.getElementById("east").value,
        'South': document.getElementById("south").value
    };
    
    const colorNumbers = {
        'red': parseInt(document.getElementById("red").value),
        'blue': parseInt(document.getElementById("blue").value),
        'green': parseInt(document.getElementById("green").value),
        'black': parseInt(document.getElementById("black").value)
    };
    
    // Build a map of which colors are assigned to which directions
    const colorToDirection = {}; // color -> direction
    for (const [dir, color] of Object.entries(directionColors)) {
        if (color) {
            colorToDirection[color] = dir;
        }
    }
    
    // Build constraints: which position (1-4) must have which direction
    const positionConstraints = {}; // position -> direction
    
    // Build exclusion constraints: which direction cannot be at which position
    // based on color mismatches
    const exclusions = {}; // direction -> Set of positions it cannot be at
    
    for (const dir of DIRECTIONS) {
        exclusions[dir] = new Set();
    }
    
    // First pass: exact matches (direction has color AND that color has a number)
    for (const [dir, dirColor] of Object.entries(directionColors)) {
        if (dirColor && !isNaN(colorNumbers[dirColor])) {
            const position = colorNumbers[dirColor];
            positionConstraints[position] = dir;
        }
    }
    
    // Second pass: exclusions based on color-position mismatch
    // If a direction has a color, it cannot be at positions assigned to other colors
    for (const [dir, dirColor] of Object.entries(directionColors)) {
        if (dirColor) {
            // For each color that has a number assigned
            for (const [color, position] of Object.entries(colorNumbers)) {
                if (!isNaN(position) && color !== dirColor) {
                    // This direction cannot be at this position
                    // because the direction is dirColor, not color
                    exclusions[dir].add(position);
                }
            }
        }
    }
    
    // Third pass: color uniqueness constraint
    // If a color is assigned to a direction, no other direction can have that color
    // This means: if North is red, then West/East/South cannot be at the position where red goes
    for (const [color, assignedDir] of Object.entries(colorToDirection)) {
        const position = colorNumbers[color];
        if (!isNaN(position)) {
            // All other directions cannot be at this position
            for (const dir of DIRECTIONS) {
                if (dir !== assignedDir) {
                    exclusions[dir].add(position);
                }
            }
        }
    }
    
    // Generate all valid permutations
    const validPerms = permutations(DIRECTIONS).filter(perm => {
        // Check if this permutation satisfies all constraints
        for (const [pos, dir] of Object.entries(positionConstraints)) {
            if (perm[pos - 1] !== dir) {
                return false;
            }
        }
        
        // Check exclusions: make sure no direction is at an excluded position
        for (let i = 0; i < perm.length; i++) {
            const dir = perm[i];
            const position = i + 1; // positions are 1-indexed
            if (exclusions[dir].has(position)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Sort by preferred order: North first, then West, then South, then East
    const directionPriority = { 'North': 0, 'West': 1, 'South': 2, 'East': 3 };
    
    validPerms.sort((a, b) => {
        // Compare each position from left to right
        for (let i = 0; i < a.length; i++) {
            const priorityA = directionPriority[a[i]];
            const priorityB = directionPriority[b[i]];
            
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
        }
        return 0;
    });
    
    // Update probability display
    const probDisplay = document.getElementById("probDisplay");
    const n = validPerms.length;
    if (n > 0) {
        probDisplay.textContent = `1/${n} (${(100 / n).toFixed(2)}%)`;
    } else {
        probDisplay.textContent = "–";
    }
    
    // Update combo grid
    const grid = document.getElementById("comboGrid");
    grid.innerHTML = "";
    
    if (validPerms.length === 0) {
        const div = document.createElement("div");
        div.className = "combo-pill";
        div.style.color = "#ff4444";
        div.textContent = "No valid combinations!";
        grid.appendChild(div);
    } else {
        validPerms.forEach(perm => {
            const div = document.createElement("div");
            div.className = "combo-pill";
            div.innerHTML = perm.map(dir => `<span class="dir">${dir}</span>`).join(" ➡ ");
            grid.appendChild(div);
        });
    }
}

function permutations(arr) {
    const result = [];
    const used = Array(arr.length).fill(false);
    const current = [];
    
    function backtrack() {
        if (current.length === arr.length) {
            result.push(current.slice());
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
    }
    
    backtrack();
    return result;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".color-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.disabled) return;
            
            const dir = btn.closest(".color-pick").id.replace("-pick", "");
            const color = btn.dataset.color;
            const input = document.getElementById(dir);
            const current = input.value;
            const img = document.getElementById(`${dir}-symbol`);

            if (current === color) {
                input.value = "";
                btn.classList.remove("selected");
                btn.parentElement.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selected"));

                if (img) img.style.backgroundColor = "black";
            } else {
                input.value = color;
                btn.parentElement.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                if (img)
                    img.style.backgroundColor = getComputedStyle(btn).backgroundColor;
            }

            updateColorButtons();
            calculateTileOrder();
        });
    });

    document.querySelectorAll(".number-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.disabled) return;
            
            const color = btn.dataset.color;
            const current = document.getElementById(color).value;
            const value = btn.dataset.value;

            if (current === value) {
                document.getElementById(color).value = "";
                btn.classList.remove("selected");
            } else {
                document.getElementById(color).value = value;
                btn.parentElement.querySelectorAll(".number-btn").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
            }

            updateNumberButtons();
            calculateTileOrder();
        })
    })
    
    // Initialize
    updateColorButtons();
    updateNumberButtons();
    updatePossibleCombinations();
});

(function () {
    function onReady() { document.body.classList.add('ready'); }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
})();