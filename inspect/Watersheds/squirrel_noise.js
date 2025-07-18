// By Squirrel Eiserloh.
// Made available under the Creative Commons attribution 3.0 license (CC-BY-3.0 US).

const sq5_instance = (() => {
    // See squirrel_noise.wat for the source.
    const sq5_base64 = `AGFzbQEAAAABBwFgAn9/AX8DAgEABxEBDXNxdWlycmVsNWhhc2gAAApWAVQBAX8gAUG/lKCVfWwg
AGoiAiACQQl2c0GX45PEemoiAiACQQt2c0HL3s3jBmwiAiACQQ12c0G79fy8e2oiAiACQQ92c0H1
idvaAWwiAiACQRF2cws=`;

    const sq5_chars = atob(sq5_base64);
    const sq5_bytes = new Uint8Array(sq5_chars.length);
    for (let i = 0; i < sq5_chars.length; i++) {
        sq5_bytes[i] = sq5_chars.charCodeAt(i);
    }
    const sq5_module = new WebAssembly.Module(sq5_bytes);
    return new WebAssembly.Instance(sq5_module);
})();

// Returns signed int32.
export const squirrel5hash = sq5_instance.exports.squirrel5hash;
const hash = squirrel5hash;

export const squirrel5 = (seed = 0) => {
    return (position = 0) => squirrel5hash(seed, position);
};

const UInt32 = {
    Noise1D: (seed, x) => {
        return hash(seed >>> 0, x | 0) >>> 0;
    },
    Noise2D: (seed, x, y) => {
        return hash(seed >>> 0, (x | 0) + 198491317 * (y | 0)) >>> 0;
    },
    Noise3D: (seed, x, y, z) => {
        return (
            hash(
                seed >>> 0,
                (x | 0) + 198491317 * (y | 0) + 6542989 * (z | 0)
            ) >>> 0
        );
    },
    Noise4D: (seed, x, y, z, t) => {
        return (
            hash(
                seed >>> 0,
                (x | 0) +
                    198491317 * (y | 0) +
                    6542989 * (z | 0) +
                    357239 * (t | 0)
            ) >>> 0
        );
    },
};

const Int32 = {
    Noise1D: (seed, x) => {
        return hash(seed >>> 0, x | 0);
    },
    Noise2D: (seed, x, y) => {
        return hash(seed >>> 0, (x | 0) + 198491317 * (y | 0));
    },
    Noise3D: (seed, x, y, z) => {
        return hash(
            seed >>> 0,
            (x | 0) + 198491317 * (y | 0) + 6542989 * (z | 0)
        );
    },
    Noise4D: (seed, x, y, z, t) => {
        return hash(
            seed >>> 0,
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
