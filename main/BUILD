load("@rules_cc//cc:cc_binary.bzl", "cc_binary")

cc_binary(
    name = "main",
    srcs = ["main.cc"],
    deps = [
        "//gen:person",
        "//third_party/eiserloh:squirrel_noise_5",
    ],
)
