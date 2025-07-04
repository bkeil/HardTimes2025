load("@rules_cc//cc:cc_binary.bzl", "cc_binary")

cc_binary(
    name = "map",
    srcs = ["map.cc"],
    deps = [
        "//gen:region",
        "//third_party/raylib",
        "@abseil-cpp//absl/container:node_hash_map",
    ],
)

cc_binary(
    name = "snake",
    srcs = ["snake.cc"],
    deps = [
        "//third_party/raylib",
    ],
)
