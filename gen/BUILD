load("@rules_cc//cc:cc_library.bzl", "cc_library")

package(default_visibility = ["//visibility:public"])

cc_library(
    name = "person",
    srcs = ["person.cc"],
    hdrs = ["person.h"],
    deps = [
        "@abseil-cpp//absl/base:no_destructor",
        "@abseil-cpp//absl/types:span",
        "@nlohmann_json//:singleheader-json",
    ],
)

cc_library(
    name = "random",
    hdrs = ["random.h"],
    deps = [
        "//third_party/eiserloh:squirrel_noise_5",
        "@abseil-cpp//absl/types:span",
    ],
)
