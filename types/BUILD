load("@rules_cc//cc:cc_library.bzl", "cc_library")

package(default_visibility = ["//visibility:public"])

cc_library(
    name = "types",
    srcs = [
        "tag.cc",
    ],
    hdrs = [
        "numeric.h",
        "person.h",
        "region.h",
        "tag.h",
    ],
    deps = [
        "@abseil-cpp//absl/container:flat_hash_map",
        "@abseil-cpp//absl/log",
        "@abseil-cpp//absl/log:check",
    ],
)
