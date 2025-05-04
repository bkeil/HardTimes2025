load("@rules_cc//cc:cc_library.bzl", "cc_library")

cc_library(
    name = "person",
    srcs = ["person.cc"],
    hdrs = ["person.h"],
    visibility = ["//visibility:public"],
    deps = [
        "@abseil-cpp//absl/base:no_destructor",
        "@abseil-cpp//absl/types:span",
    ],
)
