load("@rules_cc//cc:cc_library.bzl", "cc_library")

package(default_visibility = ["//visibility:public"])

cc_library(
    name = "aspects",
    hdrs = ["aspects.h"],
    deps = [],
)

cc_library(
    name = "grammar",
    srcs = ["grammar.cc"],
    hdrs = ["grammar.h"],
    deps = [
        ":random",
        ":tag",
        "//types",
        "@abseil-cpp//absl/container:flat_hash_map",
        "@abseil-cpp//absl/strings",
        "@nlohmann_json//:singleheader-json",
    ],
)

cc_library(
    name = "name",
    srcs = [
        "name.cc",
    ],
    hdrs = [
        "name.h",
    ],
    data = [
        "//db:person_name_lists.json",
        "//db:region_name_grammar.json",
        "//db:tags.jsonc",
    ],
    deps = [
        ":aspects",
        ":grammar",
        ":random",
        ":tag",
        "//types",
        "@abseil-cpp//absl/base:no_destructor",
        "@abseil-cpp//absl/log",
        "@abseil-cpp//absl/types:span",
        "@nlohmann_json//:singleheader-json",
    ],
)

cc_library(
    name = "person",
    srcs = ["person.cc"],
    hdrs = ["person.h"],
    data = ["//db:backgrounds.json"],
    deps = [
        "//types",
        "@abseil-cpp//absl/base:no_destructor",
        "@abseil-cpp//absl/types:span",
        "@nlohmann_json//:singleheader-json",
    ],
)

cc_library(
    name = "random",
    srcs = ["random.cc"],
    hdrs = ["random.h"],
    deps = [
        "//third_party/eiserloh:squirrel_noise_5",
        "//types",
        "@abseil-cpp//absl/types:span",
    ],
)

cc_library(
    name = "region",
    srcs = ["region.cc"],
    hdrs = ["region.h"],
    deps = [
        ":name",
        ":random",
        "//types",
        "@abseil-cpp//absl/base:no_destructor",
        "@abseil-cpp//absl/container:node_hash_map",
        "@abseil-cpp//absl/log",
        "@abseil-cpp//absl/strings",
        "@abseil-cpp//absl/types:span",
        "@nlohmann_json//:singleheader-json",
    ],
)

cc_library(
    name = "tag",
    srcs = ["tag.cc"],
    hdrs = ["tag.h"],
    deps = [
        ":random",
        "//types",
        "@abseil-cpp//absl/log",
        "@abseil-cpp//absl/strings",
        "@nlohmann_json//:singleheader-json",
    ],
)
