import { Squirrel5 } from "./squirrel_noise.js";

export function DiamondSquare(
    rows,
    cols,
    seed,
    chunk_size,
    aspect,
    max_relief,
    allow_negative
) {
    const xy = allow_negative
        ? (x, y) => Squirrel5.Int32.Noise3D(seed, x, y, aspect)
        : (x, y) => Squirrel5.UInt32.Noise3D(seed, x, y, aspect);

    const values = {};
    const size = chunk_size;
    const vchunks = Math.ceil(rows / size) + 2;
    const hchunks = Math.ceil(cols / size) + 2;

    for (let y = -1; y < vchunks; ++y) {
        values[y * size] = {};
        for (let x = -1; x < hchunks; ++x) {
            values[y * size][x * size] = xy(x, y) % max_relief;
        }
    }

    let side = size,
        half = side / 2,
        displacement = max_relief / 4;
    while (side > 1) {
        // ==================================================================
        // ============================ Diamond =============================
        // ==================================================================
        let rightmost = (hchunks - 2) * size + half;
        let bottom = (vchunks - 2) * size + half;
        for (let y = -half; y <= bottom; y += side) {
            for (let x = -half; x <= rightmost; x += side) {
                let north_y = y - half,
                    south_y = y + half;
                let west_x = x - half,
                    east_x = x + half;
                let north_row = (values[north_y] = values[north_y] || {});
                let south_row = (values[south_y] = values[south_y] || {});
                let this_row = (values[y] = values[y] || {});
                let nw = north_row[west_x];
                let ne = north_row[east_x];
                let sw = south_row[west_x];
                let se = south_row[east_x];
                this_row[x] = Math.floor((nw + ne + sw + se) / 4);
            }
        }

        // ==================================================================
        // ============================= Square =============================
        // ==================================================================
        let offset = true;
        for (let y = -half; y <= bottom; y += half) {
            for (let x = offset ? 0 : -half; x <= rightmost; x += side) {
                let ny = y - half,
                    sy = y + half;
                let wx = x - half,
                    ex = x + half;
                if (!values[ny]) {
                    console.log("Missing row", ny);
                    break;
                }
                if (!values[sy]) {
                    console.log("Missing row", sy);
                    break;
                }
                let n = values[ny][x],
                    s = values[sy][x];
                let w = values[y][wx],
                    e = values[y][ex];
                let d = xy(x, y) % displacement;
                let mid = Math.floor((n + e + w + s) / 4);
                let v = mid + d;
                if (v < -max_relief) v = -max_relief;
                if (v > max_relief) v = max_relief;
                values[y][x] = v;
            }
            offset = !offset;
        }

        side /= 2;
        half /= 2;
        displacement /= 2;
    }

    return values;
}
