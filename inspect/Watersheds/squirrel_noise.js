// By Squirrel Eiserloh.
// Made available under the Creative Commons attribution 3.0 license (CC-BY-3.0 US).
//
// Returns signed int32.

let hash = null;

await WebAssembly.instantiateStreaming(fetch("./squirrel_noise.wasm"))
    .then((module) => {
        hash = module.instance.exports.squirrel5hash;
    })
    .catch((err) => {
        import("./squirrel_noise.wasm").then((module) => {
            hash = module.squirrel5hash;
        });
    });

export function squirrel5hash(seed, position) {
    return hash(seed, position);
}

export const squirrel5 = (seed = 0) => {
    return (position = 0) => squirrel5hash(seed, position);
};

const UInt32 = {
    Noise1D: (seed, x) => {
        return squirrel5hash(seed, x | 0) >>> 0;
    },
    Noise2D: (seed, x, y) => {
        return squirrel5hash(seed, (x | 0) + 198491317 * (y | 0)) >>> 0;
    },
    Noise3D: (seed, x, y, z) => {
        return (
            squirrel5hash(
                seed,
                (x | 0) + 198491317 * (y | 0) + 6542989 * (z | 0)
            ) >>> 0
        );
    },
    Noise4D: (seed, x, y, z, t) => {
        return (
            squirrel5hash(
                seed,
                (x | 0) +
                    198491317 * (y | 0) +
                    6542989 * (z | 0) +
                    357239 * (t | 0)
            ) >>> 0
        );
    },
};

const Int32 = {
    Hash: squirrel5hash,
    Noise1D: (seed, x) => {
        return squirrel5hash(seed, x | 0);
    },
    Noise2D: (seed, x, y) => {
        return squirrel5hash(seed, (x | 0) + 198491317 * (y | 0));
    },
    Noise3D: (seed, x, y, z) => {
        return squirrel5hash(
            seed,
            (x | 0) + 198491317 * (y | 0) + 6542989 * (z | 0)
        );
    },
    Noise4D: (seed, x, y, z, t) => {
        return squirrel5hash(
            seed,
            (x | 0) + 198491317 * (y | 0) + 6542989 * (z | 0) + 357239 * (t | 0)
        );
    },
};

const Float = {
    Noise1D: (seed, x) => {
        return (1 / 0x7fffffff) * Int32.Noise1D(seed, x);
    },
    Noise2D: (seed, x, y) => {
        return (1 / 0x7fffffff) * Int32.Noise2D(seed, x, y);
    },
    Noise3D: (seed, x, y, z) => {
        return (1 / 0x7fffffff) * Int32.Noise3D(seed, x, y, z);
    },
    Noise4D: (seed, x, y, z, w) => {
        return (1 / 0x7fffffff) * Int32.Noise4D(seed, x, y, z, w);
    },
};

const ZeroToOne = {
    Noise1D: (seed, x) => {
        return (1 / 0xffffffff) * UInt32.Noise1D(seed, x);
    },
    Noise2D: (seed, x, y) => {
        return (1 / 0xffffffff) * UInt32.Noise2D(seed, x, y);
    },
    Noise3D: (seed, x, y, z) => {
        return (1 / 0xffffffff) * UInt32.Noise3D(seed, x, y, z);
    },
    Noise4D: (seed, x, y, z, w) => {
        return (1 / 0xffffffff) * UInt32.Noise4D(seed, x, y, z, w);
    },
};

export const Squirrel5 = {
    Int32: Int32,
    UInt32: UInt32,
    Float: Float,
    ZeroToOne: ZeroToOne,
};
