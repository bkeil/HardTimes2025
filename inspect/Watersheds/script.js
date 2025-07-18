import { DiamondSquare } from "./diamond_square.js";
import { Simplex } from "./simplex.js";
import { Squirrel5 } from "./squirrel_noise.js";

window.Squirrel5 = Squirrel5;

// Get a reference to the canvas element
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("myCanvas");

/** @type {HTMLInputElement} */
const seed_input = document.getElementById("seed");

/** @type {HTMLSelectElement} */
const waterfunc_input = document.getElementById("waterfunc");
let waterfunc = TotallyRandom;

/** @type {HTMLSelectElement} */
const heightfunc_input = document.getElementById("heightfunc");
let heightfunc = TotallyRandom;

const width = canvas.width,
    height = canvas.height;
const grid = 20,
    stroke = 4,
    padding = 0;
const cols = Math.floor(width / grid),
    rows = Math.floor(height / grid);

function TotallyRandom(rows, cols, seed, z = 0) {
    const xy = (x, y) => Squirrel5.UInt32.Noise3D(seed, x, y, z);
    const field = {};
    for (let row = 0; row < rows; ++row) {
        field[row] = {};
        for (let col = 0; col < cols; ++col) {
            field[row][col] = xy(col, row, z) & 511;
            field[row][col] += xy(col, row, z + 1) & 511;
        }
    }
    return field;
}
window["TotallyRandom"] = TotallyRandom;

// Get the 2D rendering context
const ctx = canvas.getContext("2d");
const RAINFALL = 0,
    ELEVATION = 1;

for (const chunk_size of [4, 8, 16, 32, 64]) {
    const funcname = "DiamondSquare" + chunk_size;
    window[funcname] = (rows, cols, seed, aspect) =>
        DiamondSquare(rows, cols, seed, chunk_size, aspect);
    const option = document.createElement("option");
    option.label = "Diamond Square " + chunk_size;
    option.value = funcname;
    waterfunc_input.appendChild(option);
    heightfunc_input.appendChild(option.cloneNode());
}

for (const freq of [12, 36, 72]) {
    for (const octaves of [1, 2, 4]) {
        const funcname = "Simplex" + freq + "_" + octaves;
        window[funcname] = (rows, cols, seed, aspect) =>
            Simplex(rows, cols, seed + aspect, freq, octaves);
        const option = document.createElement("option");
        option.label = `Simplex ${freq} ${octaves}`;
        option.value = funcname;
        waterfunc_input.appendChild(option);
        heightfunc_input.appendChild(option.cloneNode());
    }
}

const evaporation = 0.6;

let water_cache = {};
function clearWaterCache() {
    water_cache = {};
}
function getWater(chunks, row, col) {
    if (row in water_cache) {
        if (col in water_cache[row]) {
            return water_cache[row][col];
        }
    } else {
        water_cache[row] = {};
    }
    const min_dx = col > 0 ? -1 : 0;
    const min_dy = row > 0 ? -1 : 0;
    const max_dx = col < cols - 1 ? 1 : 0;
    const max_dy = row < rows - 1 ? 1 : 0;
    const chunk = chunks[row][col];
    let water = chunk.water;
    for (let dx = min_dx; dx <= max_dx; ++dx) {
        for (let dy = min_dy; dy <= max_dy; ++dy) {
            const neighbor = chunks[row + dy][col + dx];
            if (neighbor == chunk) continue;
            if (neighbor.flows_to == chunk) {
                water += Math.floor(
                    getWater(chunks, row + dy, col + dx) * evaporation
                );
            }
        }
    }
    if (water > 1023) water = 1023;
    water_cache[row][col] = water;
    return water;
}
window.getWater = getWater;
window.getWaterCache = () => water_cache;
window.clearWaterCache = clearWaterCache;

function drawWorld() {
    ctx.clearRect(0, 0, width, height);
    clearWaterCache();
    const seed = parseInt(seed_input.value, 10);
    console.log("seed", seed);
    console.log("cols", cols, "rows", rows);
    const chunks = (window.chunks = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({}))
    ));

    // Moisture map
    const rainfall = waterfunc(rows, cols, seed, RAINFALL);
    const heightmap = heightfunc(rows, cols, seed, ELEVATION);

    // Layer 1

    for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < cols; col++) {
            const chunk = chunks[row][col];
            chunk.row = row;
            chunk.col = col;
            chunk.water = rainfall[row][col];
            chunk.height = heightmap[row][col];
        }
    }

    // Layer 2

    for (let row = 1; row < rows - 1; ++row) {
        for (let col = 1; col < cols - 1; ++col) {
            const chunk = chunks[row][col];
            let lowest_neighbor = chunk;
            for (let dr = -1; dr < 2; ++dr) {
                for (let dc = -1; dc < 2; ++dc) {
                    const neighbor = chunks[row + dr][col + dc];
                    if (neighbor.height < lowest_neighbor.height) {
                        lowest_neighbor = neighbor;
                    }
                }
            }
            if (lowest_neighbor != chunk) {
                chunk["flows_to"] = lowest_neighbor;
            }
        }
    }

    for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < cols; ++col) {
            const chunk = chunks[row][col];
            const water = chunk.water;
            let atmos = chunk.height;
            if (atmos < 256) {
                const depth = 128 - Math.floor(atmos / 2);
                const red = depth / 2;
                const green = 128 - depth;
                const blue = 255 - depth / 2;
                ctx.fillStyle = `rgb(${red} ${green} ${blue})`;
            } else {
                atmos -= 256;
                let stone = atmos / 767;
                const red = 256 - Math.floor(water / 4);
                const sat = 100 - Math.floor(100 * stone);
                ctx.fillStyle = `hsl(from rgb(${red} 255  0) h ${sat} l)`;
            }
            const x = col * grid,
                y = row * grid;
            ctx.fillRect(x, y, grid - padding, grid - padding);
        }
    }

    for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < cols; ++col) {
            let chunk = chunks[row][col];
            const water = getWater(chunks, row, col);
            const x = col * grid,
                y = row * grid;
            let dest = chunk.flows_to;
            setStrokeStyle(water);
            if (dest) {
                ctx.beginPath();
                ctx.moveTo(x + grid / 2, y + grid / 2);
                ctx.lineTo(
                    dest.col * grid + grid / 2,
                    dest.row * grid + grid / 2
                );
                ctx.lineWidth = (stroke - 0.25) * (water / 1023) + 0.25;
                ctx.stroke();
            }
        }
    }
}

function setStrokeStyle(water) {
    let red, blue, green;
    let flow = water;
    if (flow < 32) {
        red = 32;
        green = flow;
        blue = 0;
    } else if (flow < 64) {
        flow -= 32;
        red = 32;
        green = 32;
        blue = flow;
    } else if (flow < 256) {
        flow -= 64;
        red = green = 32 - Math.floor((32 * flow) / 192);
        blue = 32 + Math.floor((224 * flow) / 196);
    } else {
        red = green = 0;
        blue = 256;
    }
    ctx.strokeStyle = `rgb(${red} ${green} ${blue})`;
}

seed_input.addEventListener("change", drawWorld);

waterfunc_input.addEventListener("change", () => {
    waterfunc = window[waterfunc_input.value];
    drawWorld();
});

heightfunc_input.addEventListener("change", () => {
    heightfunc = window[heightfunc_input.value];
    drawWorld();
});

waterfunc_input.value = "DiamondSquare32";
heightfunc_input.value = "Simplex72_4";
seed_input.value = -31;
waterfunc_input.dispatchEvent(new Event("change"));
heightfunc_input.dispatchEvent(new Event("change"));
