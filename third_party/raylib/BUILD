load("@rules_foreign_cc//foreign_cc:defs.bzl", "cmake")

cmake(
    name = "raylib",
    cache_entries = {
        "BUILD_EXAMPLES": "OFF",
    },
    lib_source = "@raylib_src_5_5//:all_srcs",
    out_static_libs = select({
        "@platforms//os:windows": [
            "raylib.lib",
        ],
        "//conditions:default": [
            "libraylib.a",
        ],
    }),
    targets = [
        "raylib",
    ],
    visibility = ["//visibility:public"],
)
