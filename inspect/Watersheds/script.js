// Get a reference to the canvas element
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("myCanvas");

/** @type {HTMLInputElement} */
const seed_input = document.getElementById("seed");

/** @type {HTMLSelectElement} */
const waterfunc_input = document.getElementById("waterfunc");

const width = canvas.width,
    height = canvas.height;
const grid = 10,
    stroke = 4;

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

(function (global) {
    /*
     * A speed-improved perlin and simplex noise algorithms for 2D.
     *
     * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
     * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
     * Better rank ordering method by Stefan Gustavson in 2012.
     * Converted to Javascript by Joseph Gentle.
     *
     * Version 2012-03-09
     *
     * This code was placed in the public domain by its original author,
     * Stefan Gustavson. You may use it as you see fit, but
     * attribution is appreciated.
     */
    var module = (global.noise = {});

    function Grad(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    Grad.prototype.dot2 = function (x, y) {
        return this.x * x + this.y * y;
    };

    Grad.prototype.dot3 = function (x, y, z) {
        return this.x * x + this.y * y + this.z * z;
    };

    var grad3 = [
        new Grad(1, 1, 0),
        new Grad(-1, 1, 0),
        new Grad(1, -1, 0),
        new Grad(-1, -1, 0),
        new Grad(1, 0, 1),
        new Grad(-1, 0, 1),
        new Grad(1, 0, -1),
        new Grad(-1, 0, -1),
        new Grad(0, 1, 1),
        new Grad(0, -1, 1),
        new Grad(0, 1, -1),
        new Grad(0, -1, -1),
    ];

    var p = [
        151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
        140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247,
        120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57,
        177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74,
        165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
        60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
        65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
        200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3,
        64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85,
        212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170,
        213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43,
        172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185,
        112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191,
        179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
        181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150,
        254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195,
        78, 66, 215, 61, 156, 180,
    ];
    // To remove the need for index wrapping, double the permutation table length
    var perm = new Array(512);
    var gradP = new Array(512);

    // This isn't a very good seeding function, but it works ok. It supports 2^16
    // different seed values. Write something better if you need more seeds.
    module.seed = function (seed) {
        if (seed > 0 && seed < 1) {
            // Scale the seed out
            seed *= 65536;
        }

        seed = Math.floor(seed);
        if (seed < 256) {
            seed |= seed << 8;
        }

        for (var i = 0; i < 256; i++) {
            var v;
            if (i & 1) {
                v = p[i] ^ (seed & 255);
            } else {
                v = p[i] ^ ((seed >> 8) & 255);
            }

            perm[i] = perm[i + 256] = v;
            gradP[i] = gradP[i + 256] = grad3[v % 12];
        }
    };

    module.seed(0);

    /*
  for(var i=0; i<256; i++) {
    perm[i] = perm[i + 256] = p[i];
    gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
  }*/

    // Skewing and unskewing factors for 2, 3, and 4 dimensions
    var F2 = 0.5 * (Math.sqrt(3) - 1);
    var G2 = (3 - Math.sqrt(3)) / 6;

    var F3 = 1 / 3;
    var G3 = 1 / 6;

    // 2D simplex noise
    module.simplex2 = function (xin, yin) {
        var n0, n1, n2; // Noise contributions from the three corners
        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin) * F2; // Hairy factor for 2D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * G2;
        var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
        var y0 = yin - j + t;
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) {
            // lower triangle, XY order: (0,0)->(1,0)->(1,1)
            i1 = 1;
            j1 = 0;
        } else {
            // upper triangle, YX order: (0,0)->(0,1)->(1,1)
            i1 = 0;
            j1 = 1;
        }
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
        var y2 = y0 - 1 + 2 * G2;
        // Work out the hashed gradient indices of the three simplex corners
        i &= 255;
        j &= 255;
        var gi0 = gradP[i + perm[j]];
        var gi1 = gradP[i + i1 + perm[j + j1]];
        var gi2 = gradP[i + 1 + perm[j + 1]];
        // Calculate the contribution from the three corners
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot2(x0, y0); // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot2(x1, y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot2(x2, y2);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70 * (n0 + n1 + n2);
    };

    // 3D simplex noise
    module.simplex3 = function (xin, yin, zin) {
        var n0, n1, n2, n3; // Noise contributions from the four corners

        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin + zin) * F3; // Hairy factor for 2D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var k = Math.floor(zin + s);

        var t = (i + j + k) * G3;
        var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
        var y0 = yin - j + t;
        var z0 = zin - k + t;

        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
        // Determine which simplex we are in.
        var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
        var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0;
            } else if (x0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 0;
                k2 = 1;
            } else {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 1;
                j2 = 0;
                k2 = 1;
            }
        } else {
            if (y0 < z0) {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 0;
                j2 = 1;
                k2 = 1;
            } else if (x0 < z0) {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 0;
                j2 = 1;
                k2 = 1;
            } else {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0;
            }
        }
        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
        // c = 1/6.
        var x1 = x0 - i1 + G3; // Offsets for second corner
        var y1 = y0 - j1 + G3;
        var z1 = z0 - k1 + G3;

        var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
        var y2 = y0 - j2 + 2 * G3;
        var z2 = z0 - k2 + 2 * G3;

        var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
        var y3 = y0 - 1 + 3 * G3;
        var z3 = z0 - 1 + 3 * G3;

        // Work out the hashed gradient indices of the four simplex corners
        i &= 255;
        j &= 255;
        k &= 255;
        var gi0 = gradP[i + perm[j + perm[k]]];
        var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
        var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
        var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]];

        // Calculate the contribution from the four corners
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot3(x0, y0, z0); // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) {
            n3 = 0;
        } else {
            t3 *= t3;
            n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 32 * (n0 + n1 + n2 + n3);
    };

    // ##### Perlin noise stuff

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(a, b, t) {
        return (1 - t) * a + t * b;
    }

    // 2D Perlin Noise
    module.perlin2 = function (x, y) {
        // Find unit grid cell containing point
        var X = Math.floor(x),
            Y = Math.floor(y);
        // Get relative xy coordinates of point within that cell
        x = x - X;
        y = y - Y;
        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
        X = X & 255;
        Y = Y & 255;

        // Calculate noise contributions from each of the four corners
        var n00 = gradP[X + perm[Y]].dot2(x, y);
        var n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
        var n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
        var n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);

        // Compute the fade curve value for x
        var u = fade(x);

        // Interpolate the four results
        return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y));
    };

    // 3D Perlin Noise
    module.perlin3 = function (x, y, z) {
        // Find unit grid cell containing point
        var X = Math.floor(x),
            Y = Math.floor(y),
            Z = Math.floor(z);
        // Get relative xyz coordinates of point within that cell
        x = x - X;
        y = y - Y;
        z = z - Z;
        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
        X = X & 255;
        Y = Y & 255;
        Z = Z & 255;

        // Calculate noise contributions from each of the eight corners
        var n000 = gradP[X + perm[Y + perm[Z]]].dot3(x, y, z);
        var n001 = gradP[X + perm[Y + perm[Z + 1]]].dot3(x, y, z - 1);
        var n010 = gradP[X + perm[Y + 1 + perm[Z]]].dot3(x, y - 1, z);
        var n011 = gradP[X + perm[Y + 1 + perm[Z + 1]]].dot3(x, y - 1, z - 1);
        var n100 = gradP[X + 1 + perm[Y + perm[Z]]].dot3(x - 1, y, z);
        var n101 = gradP[X + 1 + perm[Y + perm[Z + 1]]].dot3(x - 1, y, z - 1);
        var n110 = gradP[X + 1 + perm[Y + 1 + perm[Z]]].dot3(x - 1, y - 1, z);
        var n111 = gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]].dot3(
            x - 1,
            y - 1,
            z - 1
        );

        // Compute the fade curve value for x, y, z
        var u = fade(x);
        var v = fade(y);
        var w = fade(z);

        // Interpolate
        return lerp(
            lerp(lerp(n000, n100, u), lerp(n001, n101, u), w),
            lerp(lerp(n010, n110, u), lerp(n011, n111, u), w),
            v
        );
    };
})(this);

function Simplex(rows, cols, seed, freq = 64, octaves = 1) {
    const water = [];
    noise.seed(seed);

    let weight = 1,
        total_weight = 0;
    for (let o = 0; o < octaves; ++o) {
        total_weight += weight;
        weight /= 2;
    }

    for (let row = 0; row < rows; ++row) {
        water[row] = [];
        const y = row / freq;
        for (let col = 0; col < cols; ++col) {
            const x = col / freq;
            let w = 0;
            weight = 1;

            let factor = 1;
            for (let o = 0; o < octaves; ++o) {
                w += weight * noise.simplex2(x * factor, y * factor);
                factor *= 2;
                weight /= 2;
            }
            w /= total_weight;

            water[row][col] = Math.floor(w * 511) + 512;
        }
    }
    return water;
}

function DiamondSquare(rows, cols, seed, chunk_size) {
    const r = squirrel5(seed);
    const xy = (x, y, z = 0) => {
        let p = 3;
        p = 5 * p + x;
        p = 7 * p + y;
        p = 9 * p + z;
        return r(p);
    };

    const water = {};
    const size = chunk_size;
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

for (const chunk_size of [4, 8, 16, 32, 64]) {
    const funcname = "DiamondSquare" + chunk_size;
    window[funcname] = (rows, cols, seed) =>
        DiamondSquare(rows, cols, seed, chunk_size);
    const option = document.createElement("option");
    option.label = "Diamond Square " + chunk_size;
    option.value = funcname;
    waterfunc_input.appendChild(option);
}

for (const freq of [4, 24, 64]) {
    for (const octaves of [1, 2, 4]) {
        const funcname = "Simplex" + freq + "_" + octaves;
        window[funcname] = (rows, cols, seed) =>
            Simplex(rows, cols, seed, freq, octaves);
        const option = document.createElement("option");
        option.label = `Simplex ${freq} ${octaves}`;
        option.value = funcname;
        waterfunc_input.appendChild(option);
    }
}

let Watertable = window.DiamondSquare16;

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
    const water = Watertable(rows, cols, seed);

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

    console.log("Drawing...");

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
                ctx.lineWidth = stroke * ((chunk.water - 255) / 768) + 1;
                ctx.stroke();
            }
        }
    }
}

seed_input.addEventListener("change", drawWorld);

waterfunc_input.addEventListener("change", () => {
    Watertable = window[waterfunc_input.value];
    drawWorld();
});

window.onload = function () {
    waterfunc_input.value = "DiamondSquare64";
    seed_input.value = -45;
    waterfunc_input.dispatchEvent(new Event("change"));
};
