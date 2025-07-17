(module
    (func (export "squirrel5hash") (param $seed i32) (param $pos i32) (result i32)
        (local $bits i32)

        local.get $pos
        i32.const 0xd2a80a3f  ;; NOISE 1
        i32.mul

        local.get $seed
        i32.add

        local.tee $bits
        local.get $bits
        i32.const 9
        i32.shr_u
        i32.xor

        i32.const 0xa884f197  ;; NOISE 2
        i32.add

        local.tee $bits
        local.get $bits
        i32.const 11
        i32.shr_u
        i32.xor

        i32.const 0x6C736F4B  ;; NOISE 3
        i32.mul

        local.tee $bits
        local.get $bits
        i32.const 13
        i32.shr_u
        i32.xor

        i32.const 0xB79F3ABB  ;; NOISE 4
        i32.add

        local.tee $bits
        local.get $bits
        i32.const 15
        i32.shr_u
        i32.xor

        i32.const 0x1b56c4f5  ;; NOISE 5
        i32.mul

        local.tee $bits
        local.get $bits
        i32.const 17
        i32.shr_u
        i32.xor
    )
)