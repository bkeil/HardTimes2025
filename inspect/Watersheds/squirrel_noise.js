// By Squirrel Eiserloh.
// Made available under the Creative Commons attribution 3.0 license (CC-BY-3.0 US).
export const squirrel5 = (seed = 0) => {
    return (position = 0) => {
        let mangledBits = position;
        mangledBits *= 0xd2a80a3f;

        // These lines were swapped by omnizach, given this reasoning:
        //
        // There is a subtle situation where the seed has no effect on the
        // output. Consider the case where the bottom 18 bits of the position
        // is all zeros and the seed is less than 18 bits. In that case, the
        // seed ends up xor'ing with itself with no other bits, effectively
        // nullifying its impact. A (seemingly) inconsequential fix is to move
        // the seeding line to avoid this issue. However, it does have the
        // impact that this noise function will not align with other
        // implementations, should that be desired.
        mangledBits ^= mangledBits >>> 9;
        mangledBits += seed;

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
