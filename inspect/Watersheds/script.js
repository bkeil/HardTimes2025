import { DiamondSquare } from "./diamond_square.js";
import { Simplex } from "./simplex.js";
import { Squirrel5 } from "./squirrel_noise.js";

window.Squirrel5 = Squirrel5;

// ==========================================================================
// =========================== Interface Elements ===========================
// ==========================================================================

// Get a reference to the canvas element
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("myCanvas");

/** @type {HTMLInputElement} */
const seed_input = document.getElementById("seed");

/** @type {HTMLSelectElement} */
const waterfunc_input = document.getElementById("waterfunc");

/** @type {HTMLSelectElement} */
const heightfunc_input = document.getElementById("heightfunc");

/** @type {HTMLInputElement} */
const showcreeks_input = document.getElementById("showcreeks");

/** @type {HTMLInputElement} */
const showwatersheds_input = document.getElementById("showwatersheds");

// ==========================================================================
// =============================== World Size ===============================
// ==========================================================================

const width = canvas.width,
    height = canvas.height;

const grid = 25,
    stroke = 2,
    padding = 0;

const max_relief = 1048576; // Centimeters above or below sea level.
const max_rainfall = 1024; // Centimeters annually.

const cols = Math.floor(width / grid),
    rows = Math.floor(height / grid);

const allow_diagnals = true;

// ==========================================================================
// ============================ Noise Functions =============================
// ==========================================================================

/**
 * @typedef {Function} NoiseFunction
 * @param {int} rows - the number of rows to return
 * @param {int} cols - the number of columns to return
 * @param {int} seed - the random seed to use
 * @param {int} aspect - the aspect (third dimention of noise)
 * @param {int} max_relief - limits the absolute value of the noise function
 * @param {bool} allow_negative - if true the noise is in the interval [-max_relief, max_relief], if false [0, max_relief]
 */

// Z-axis in 3D noise.
const RAINFALL = 0,
    ELEVATION = 1;

/** @type {NoiseFunction} */
const TotallyRandom = (
    rows,
    cols,
    seed,
    aspect,
    max_relief,
    allow_negative
) => {
    const xy = allow_negative
        ? (x, y) => Squirrel5.Int32.Noise3D(seed, x, y, aspect)
        : (x, y) => Squirrel5.UInt32.Noise3D(seed, x, y, aspect);
    const field = {};
    for (let row = 0; row < rows; ++row) {
        field[row] = {};
        for (let col = 0; col < cols; ++col) {
            field[row][col] = xy(col, row, aspect) % max_relief;
        }
    }
    return field;
};
window["TotallyRandom"] = TotallyRandom;

for (const chunk_size of [4, 8, 16, 32, 64]) {
    const funcname = "DiamondSquare" + chunk_size;
    window[funcname] = (rows, cols, seed, aspect, max_relief, allow_negative) =>
        DiamondSquare(
            rows,
            cols,
            seed,
            chunk_size,
            aspect,
            max_relief,
            allow_negative
        );
    const option = document.createElement("option");
    option.label = "Diamond Square " + chunk_size;
    option.value = funcname;
    waterfunc_input.appendChild(option);
    heightfunc_input.appendChild(option.cloneNode());
}

for (const freq of [12, 36, 72]) {
    for (const octaves of [1, 2, 4]) {
        const funcname = "Simplex" + freq + "_" + octaves;
        window[funcname] = (
            rows,
            cols,
            seed,
            aspect,
            max_relief,
            allow_negative
        ) =>
            Simplex(
                rows,
                cols,
                seed + aspect,
                freq,
                octaves,
                max_relief,
                allow_negative
            );
        const option = document.createElement("option");
        option.label = `Simplex ${freq} ${octaves}`;
        option.value = funcname;
        waterfunc_input.appendChild(option);
        heightfunc_input.appendChild(option.cloneNode());
    }
}

// ==========================================================================
// ============================ Elevation Layer =============================
// ==========================================================================

function GetElevationLayer() {
    /** @type {NoiseFunction} */
    const heightfunc = window[heightfunc_input.value];
    return heightfunc(
        rows,
        cols,
        seed_input.value,
        ELEVATION,
        max_relief,
        /*allow_negative=*/ true
    );
}

function GetRainfallLayer() {
    /** @type {NoiseFunction} */
    const waterfunc = window[waterfunc_input.value];
    return waterfunc(
        rows,
        cols,
        seed_input.value,
        RAINFALL,
        max_rainfall,
        /*allow_negative=*/ false
    );
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
                try {
                    water += Math.floor(
                        getWater(chunks, row + dy, col + dx) * evaporation
                    );
                } catch (e) {
                    water;
                    console.log("Error", chunk, neighbor);
                }
            }
        }
    }
    if (water > max_rainfall) water = max_rainfall;
    water_cache[row][col] = water;
    return water;
}
window.getWater = getWater;
window.getWaterCache = () => water_cache;
window.clearWaterCache = clearWaterCache;

function unflow(chunk) {
    chunk.strahler = 1;
    if (chunk.flows_to) {
        const flow_index = chunk.flows_to.flows_from.indexOf(chunk);
        if (flow_index >= 0) {
            chunk.flows_to.flows_from.splice(flow_index, 1);
        }
        chunk.flows_to = null;
    }
}

function reflow(chunks, row, col) {
    const chunk = chunks[row][col];
    unflow(chunk);

    let lowest_neighbor = chunk;
    for (let dr = -1; dr < 2; ++dr) {
        for (let dc = -1; dc < 2; ++dc) {
            if (!allow_diagnals && (dr === 0) === (dc === 0)) continue;
            let rr = row + dr,
                cc = col + dc;
            if (!(rr in chunks) || !(cc in chunks[rr])) continue;
            const neighbor = chunks[rr][cc];
            if (typeof neighbor === "undefined") {
                console.log("Missing neighbor", rr, cc);
                continue;
            }
            if (neighbor.height < lowest_neighbor.height) {
                lowest_neighbor = neighbor;
            }
        }
    }
    if (lowest_neighbor != chunk) {
        chunk["flows_to"] = lowest_neighbor;
        lowest_neighbor.flows_from.push(chunk);
    }
}

function genWorld() {
    clearWaterCache();
    const seed = parseInt(seed_input.value, 10);
    console.log("seed", seed);
    console.log("cols", cols, "rows", rows);
    const chunks = (window.chunks = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({}))
    ));
    window.timeStep = 0;

    // Moisture map
    const rainfall = GetRainfallLayer();
    const heightmap = GetElevationLayer();

    // Terrain and rainfall layer

    for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < cols; col++) {
            const chunk = chunks[row][col];
            chunk.row = row;
            chunk.col = col;
            chunk.water = rainfall[row][col];
            chunk.height = heightmap[row][col];
            chunk.flows_from = [];
            chunk.flows_to = null;
            chunk.watershed = null;
            chunk.strahler = 1;
        }
    }

    // ========== Watershed layer ==========

    // Initialize chunk flow.
    for (let row = 1; row < rows - 1; ++row) {
        for (let col = 1; col < cols - 1; ++col) {
            reflow(chunks, row, col);
        }
    }

    // Divide into watersheds.
    for (let row = 1; row < rows - 1; ++row) {
        for (let col = 1; col < cols - 1; ++col) {
            let chunk = chunks[row][col];
            let watershed = chunk.watershed;
            let stack = [];
            while (!watershed) {
                if (chunk.flows_to) {
                    stack.push(chunk);
                    chunk = chunk.flows_to;
                    watershed = chunk.watershed;
                } else {
                    watershed = chunk.watershed = chunk;
                }
            }
            while (stack.length > 0) {
                chunk = stack.pop();
                chunk.watershed = watershed;
            }
        }
    }

    let processedWatersheds = new Set();
    for (let row = 1; row < rows - 1; ++row) {
        for (let col = 1; col < cols - 1; ++col) {
            let chunk = chunks[row][col];
            if (processedWatersheds.has(chunk.watershed)) continue;
            processWatershed(chunks, chunk.watershed);
            processedWatersheds.add(chunk.watershed);
        }
    }
}

function assignStrahlerNumber(chunk) {
    let strahler = 0;
    for (let upstream of chunk.flows_from) {
        let upstream_strahler = assignStrahlerNumber(upstream);
        if (upstream_strahler == strahler) {
            ++strahler;
        } else if (upstream_strahler > strahler) {
            strahler = upstream_strahler;
        }
    }
    if (strahler === 0) strahler = 1;
    chunk.strahler = strahler;
    return strahler;
}

function processWatershed(chunks, chunk) {
    // Find all up-hill neighbors in the same watershed.
    let stack = [chunk];
    while (stack.length > 0) {
        let c = stack.pop();
        unflow(c);
        if ("hydros" in c) continue;
        c.hydros = [];
        for (let dr = -1; dr < 2; ++dr) {
            for (let dc = -1; dc < 2; ++dc) {
                if (!allow_diagnals && (dr === 0) === (dc === 0)) continue;
                let rr = c.row + dr,
                    cc = c.col + dc;
                if (!(rr in chunks) || !(cc in chunks[rr])) continue;
                let neighbor = chunks[rr][cc];
                if (neighbor === c || neighbor.watershed != c.watershed)
                    continue;
                c.hydros.push(neighbor);
                if (!("hydros" in neighbor)) {
                    stack.push(neighbor);
                }
            }
        }
    }

    let added = new Set();
    added.add(chunk);

    let active = new Set();
    for (let hydro of chunk.hydros) {
        active.add(hydro);
    }

    while (active.size > 0) {
        let biggestDrop = -Infinity;
        let biggestDropper = null;
        for (let dropper of active) {
            for (let target of dropper.hydros) {
                if (!added.has(target)) continue;
                let drop = dropper.height - target.height;
                if (drop > biggestDrop) {
                    biggestDrop = drop;
                    biggestDropper = [target, dropper];
                }
            }
        }
        if (biggestDropper == null) {
            console.log("No biggest drop", chunk);
            return;
        }

        let [target, dropper] = biggestDropper;
        dropper.flows_to = target;
        target.flows_from.push(dropper);
        added.add(dropper);
        active.delete(dropper);
        for (let h of dropper.hydros) {
            if (!added.has(h)) {
                active.add(h);
            }
        }
    }

    assignStrahlerNumber(chunk);
}

const massTranfer = 0.08;
const friction = 0.8;

function erode() {
    const chunks = window.chunks;
    const seed = parseInt(seed_input.value, 10);
    const timeStep = window.timeStep++;

    // Erosion layer
    let row = (Squirrel5.UInt32.Noise1D(seed, timeStep * 2) % (rows - 2)) + 1;
    let col =
        (Squirrel5.UInt32.Noise1D(seed, timeStep * 2 + 1) % (cols - 2)) + 1;
    let chunk = chunks[row][col];
    let water = chunk.water;
    let sediment = 0;
    // let affected = new Set();
    let speed = 0;
    while (chunk.flows_to) {
        speed =
            speed * friction + Math.sqrt(chunk.height - chunk.flows_to.height);
        water = water * evaporation;
        const concentration = sediment / water;
        const equilibrium = Math.sqrt(water * speed);
        const rate = massTranfer * (equilibrium - concentration);
        const change = Math.floor(water * rate);

        // console.log(
        //     "Transfer ",
        //     change,
        //     " at ",
        //     row,
        //     col,
        //     " using ",
        //     water,
        //     " flowing at ",
        //     speed
        // );
        sediment += change;
        chunk.height -= change;

        // for (let dx = -1; dx < 2; ++dx) {
        //     for (let dy = -1; dy < 2; ++dy) {
        //         affected.add(chunks[row + dy][col + dx]);
        //     }
        // }

        chunk = chunk.flows_to;
    }
    chunk.height += sediment;
    for (let row = 1; row < rows - 1; ++row) {
        for (let col = 1; col < cols - 1; ++col) {
            reflow(chunks, row, col);
        }
    }
}

// Get the 2D rendering context
const ctx = canvas.getContext("2d");

function drawWorld() {
    ctx.clearRect(0, 0, width, height);
    const chunks = window.chunks;

    const min_strahler = showcreeks_input.checked ? 1 : 2;
    const show_watershed = showwatersheds_input.checked;

    for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < cols; ++col) {
            const chunk = chunks[row][col];
            // setFillStyleByHeight(chunk.height);
            setFillStyleByWaterAndHeight(chunk.water, chunk.height);
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
            if (dest && chunk.strahler >= min_strahler) {
                setStrokeStyle(water);
                ctx.beginPath();
                ctx.moveTo(x + grid / 2, y + grid / 2);
                ctx.lineTo(
                    dest.col * grid + grid / 2,
                    dest.row * grid + grid / 2
                );
                ctx.lineWidth = (1 << chunk.strahler) / 4;
                ctx.stroke();
            }

            if (!show_watershed || !chunk.watershed) continue;
            for (let dx = -1; dx < 2; ++dx) {
                for (let dy = -1; dy < 2; ++dy) {
                    let ny = row + dy,
                        nx = col + dx;
                    if (!(ny in chunks) || !(nx in chunks[ny])) continue;
                    let neighbor = chunks[ny][nx];
                    if (neighbor.watershed == chunk.watershed) continue;
                    drawBorder(chunk, dx, dy);
                }
            }
        }
    }
}

function drawBorder(chunk, dx, dy) {
    if (dx * dy != 0) return;
    ctx.strokeStyle = `rgb(64 64 16)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (dx == -1) {
        ctx.moveTo(chunk.col * grid, chunk.row * grid);
        ctx.lineTo(chunk.col * grid, chunk.row * grid + grid);
    } else if (dy == -1) {
        ctx.moveTo(chunk.col * grid, chunk.row * grid);
        ctx.lineTo(chunk.col * grid + grid, chunk.row * grid);
    } else if (dx == 1) {
        ctx.moveTo(chunk.col * grid + grid, chunk.row * grid);
        ctx.lineTo(chunk.col * grid + grid, chunk.row * grid + grid);
    } else {
        ctx.moveTo(chunk.col * grid, chunk.row * grid + grid);
        ctx.lineTo(chunk.col * grid + grid, chunk.row * grid + grid);
    }
    ctx.stroke();
}

function setFillStyleByHeight(height) {
    let v = height >> 12;
    if (height > 0) {
        ctx.fillStyle = `rgb(${v} ${v + (255 - v) / 4} ${v})`;
    } else {
        const depth = -v >> 1;
        const red = depth / 2;
        const green = 128 - depth;
        const blue = 255 - depth / 2;
        ctx.fillStyle = `rgb(${red} ${green} ${blue})`;
    }
}

function setFillStyleByWaterAndHeight(water, height) {
    if (height < 0) {
        setFillStyleByHeight(height);
        return;
    }

    const red = Math.floor(256 * (1 - water / max_rainfall));
    const sat = 100 * (1 - height / max_relief);
    ctx.fillStyle = `hsl(from rgb(${red} 255  0) h ${sat} l)`;
}

function setStrokeStyle(water) {
    let red, blue, green;
    let flow = Math.floor((256 * water) / max_rainfall);
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

seed_input.addEventListener("change", newWorld);
waterfunc_input.addEventListener("change", newWorld);
heightfunc_input.addEventListener("change", newWorld);

showcreeks_input.addEventListener("change", drawWorld);
showwatersheds_input.addEventListener("change", drawWorld);

function newWorld() {
    genWorld();
    drawWorld();
}

waterfunc_input.value = "TotallyRandom";
heightfunc_input.value = "DiamondSquare32";
seed_input.value = -31;
newWorld();

const erosionLoop = () => {
    for (var i = 0; i < 10; ++i) erode();
    drawWorld();
    requestAnimationFrame(erosionLoop);
};

// erosionLoop();
