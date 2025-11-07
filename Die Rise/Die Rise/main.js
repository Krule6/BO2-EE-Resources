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
}

window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".color-btn").forEach(btn => {
        btn.addEventListener("click", () => {
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

            calculateTileOrder();
        });
    });

    document.querySelectorAll(".number-btn").forEach(btn => {
        btn.addEventListener("click", () => {
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

            calculateTileOrder();
        })
    })

});

