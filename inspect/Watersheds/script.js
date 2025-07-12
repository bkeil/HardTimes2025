// Get a reference to the canvas element
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("myCanvas");

/** @type {HTMLInputElement} */
const seed_input = document.getElementById("seed");

const width = canvas.width,
    height = canvas.height;
const grid = 20;

// Get the 2D rendering context
const ctx = canvas.getContext("2d");

const squirrel5 = (seed = 0) => {
    // By Squirrel Eiserloh.
    // Made available under the Creative Commons attribution 3.0 license (CC-BY-3.0 US).
    return (position = 0) => {
        let mangledBits = position;
        mangledBits *= 0xd2a80a3f;
        mangledBits ^= mangledBits >>> 9; // this line was swapped
        mangledBits += seed; // with this line
        mangledBits += 0xa884f197;
        mangledBits ^= mangledBits >>> 11;
        mangledBits *= 0x6c736f4b;
        mangledBits ^= mangledBits >>> 13;
        mangledBits += 0xb79f3abb;
        mangledBits ^= mangledBits >>> 15;
        mangledBits *= 0x1b56c4f5;
        mangledBits ^= mangledBits >>> 17;
        return mangledBits;
    };
};

function DiamondSquare(rows, cols, seed) {
    const r = squirrel5(seed);
    const xy = (x, y, z = 0) => {
        let p = 3;
        p = 5 * p + x;
        p = 7 * p + y;
        p = 9 * p + z;
        return r(p);
    };

    const water = {};
    const size = 16;
    const vchunks = Math.ceil(rows / size) + 2;
    const hchunks = Math.ceil(cols / size) + 2;
    console.log("hchunks", hchunks, "vchunks", vchunks);
    for (let y = -1; y < vchunks; ++y) {
        water[y * size] = {};
        for (let x = -1; x < hchunks; ++x) {
            water[y * size][x * size] = xy(x, y) & 1023;
        }
    }

    // console.log("Before algorithm", JSON.parse(JSON.stringify(water)));

    let side = size,
        half = side / 2,
        displacement = 256;
    while (side > 1) {
        // Diamond
        let rightmost = (hchunks - 2) * size + half;
        let bottom = (vchunks - 2) * size + half;
        console.log(
            "side",
            side,
            "half",
            half,
            "rightmost",
            rightmost,
            "bottom",
            bottom
        );
        for (let y = -half; y <= bottom; y += side) {
            for (let x = -half; x <= rightmost; x += side) {
                let ny = y - half,
                    sy = y + half;
                let wx = x - half,
                    ex = x + half;
                let n = (water[ny] = water[ny] || {});
                let s = (water[sy] = water[sy] || {});
                let h = (water[y] = water[y] || {});
                let nw = n[wx];
                let ne = n[ex];
                let sw = s[wx];
                let se = s[ex];
                h[x] = Math.floor((nw + ne + sw + se) / 4);
                // console.log('diamond set', x, y, water[y][x]);
            }
        }
        // console.log("After diamond", JSON.parse(JSON.stringify(water)));

        // Square
        let offset = true;
        for (let y = -half; y <= bottom; y += half) {
            for (let x = offset ? 0 : -half; x <= rightmost; x += side) {
                let ny = y - half,
                    sy = y + half;
                let wx = x - half,
                    ex = x + half;
                if (!water[ny]) {
                    console.log("Missing row", ny);
                    break;
                }
                if (!water[sy]) {
                    console.log("Missing row", sy);
                    creak;
                }
                let n = water[ny][x],
                    s = water[sy][x];
                let w = water[y][wx],
                    e = water[y][ex];
                let d = xy(x, y) % (displacement + 1);
                d -= displacement / 2;
                let mid = Math.floor((n + e + w + s) / 4);
                let v = mid + d;
                if (v < 0) v = 0;
                if (v > 1023) v = 1023;
                // console.log('square set', x, y, 'mid', mid , '+', 'd', d, '=', 'v', v);
                water[y][x] = v;
            }
            offset = !offset;
        }
        // console.log("After square", JSON.parse(JSON.stringify(water)));

        side /= 2;
        half /= 2;
        displacement /= 2;
    }

    return water;
}

function drawWorld() {
    ctx.clearRect(0, 0, width, height);
    const seed = parseInt(seed_input.value, 10);
    console.log("seed", seed);
    const cols = Math.floor(width / grid),
        rows = Math.floor(height / grid);
    console.log("cols", cols, "rows", rows);
    const chunks = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({}))
    );

    // Moisture map
    const water = DiamondSquare(rows, cols, seed);

    // Layer 1

    for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < cols; col++) {
            const chunk = chunks[row][col];
            chunk.row = row;
            chunk.col = col;
            chunk.water = water[row][col];
        }
    }

    // Layer 2

    for (let row = 1; row < rows - 1; ++row) {
        for (let col = 1; col < cols - 1; ++col) {
            const chunk = chunks[row][col];
            let wettest_neighbor = chunk;
            for (dr = -1; dr < 2; ++dr) {
                for (dc = -1; dc < 2; ++dc) {
                    const neighbor = chunks[row + dr][col + dc];
                    if (neighbor.water > wettest_neighbor.water) {
                        wettest_neighbor = neighbor;
                    }
                }
            }
            if (wettest_neighbor != chunk) {
                chunk["flows_to"] = wettest_neighbor;
            }
        }
    }

    for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < cols; ++col) {
            let chunk = chunks[row][col];
            const x = col * grid,
                y = row * grid;
            const red = 256 - Math.floor(chunk.water / 4);
            ctx.fillStyle = `rgb(${red}, 255, 0)`;
            ctx.fillRect(x, y, grid - 1, grid - 1);
        }
    }

    ctx.strokeStyle = "blue";
    for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < cols; ++col) {
            let chunk = chunks[row][col];
            const x = col * grid,
                y = row * grid;
            if (chunk.water < 256) continue;
            let dest = chunk.flows_to;
            if (dest) {
                ctx.beginPath();
                ctx.moveTo(x + grid / 2, y + grid / 2);
                ctx.lineTo(
                    dest.col * grid + grid / 2,
                    dest.row * grid + grid / 2
                );
                ctx.lineWidth = 8 * ((chunk.water - 255) / 768) + 1;
                ctx.stroke();
            }
        }
    }
}

seed_input.addEventListener("change", drawWorld);
drawWorld();
