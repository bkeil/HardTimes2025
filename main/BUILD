load("@rules_cc//cc:cc_binary.bzl", "cc_binary")

cc_binary(
    name = "main",
    srcs = ["main.cc"],
    deps = [
        "//gen:person",
        "//gen:random",
        "//gen:region",
        "//types",
        "@abseil-cpp//absl/container:node_hash_map",
        "@abseil-cpp//absl/container:node_hash_set",
        "@abseil-cpp//absl/strings:str_format",
    ],
)
