import { squirrel5 } from "./squirrel_noise.js";

export function DiamondSquare(rows, cols, seed, chunk_size, z = 0) {
    const r = squirrel5(seed);
    const xy = (x, y) => {
        let p = 3;
        p = 5 * p + x;
        p = 7 * p + y;
        p = 11 * p + z;
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
