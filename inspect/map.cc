#include <iomanip>
#include <iostream>

#include "absl/container/node_hash_map.h"
#include "gen/region.h"
#include "third_party/raylib/raylib/include/raylib.h"

namespace ht2025 {

template <typename T, typename U>
std::pair<T, U> operator-(const std::pair<T, U>& p1, const std::pair<T, U>& p2) {
    return {p1.first - p2.first, p1.second - p2.second};
}

namespace {

// Draw text using font inside rectangle limits with support for text selection
void DrawTextBoxedSelectable(Font font, const char* text, Rectangle rec, float fontSize, float spacing, bool wordWrap, Color tint,
                             int selectStart, int selectLength, Color selectTint, Color selectBackTint) {
    int length = TextLength(text);  // Total length in bytes of the text, scanned by codepoints in loop

    float textOffsetY = 0;     // Offset between lines (on line break '\n')
    float textOffsetX = 0.0f;  // Offset X to next character to draw

    float scaleFactor = fontSize / (float)font.baseSize;  // Character rectangle scaling factor

    // Word/character wrapping mechanism variables
    enum { MEASURE_STATE = 0, DRAW_STATE = 1 };
    int state = wordWrap ? MEASURE_STATE : DRAW_STATE;

    int startLine = -1;  // Index where to begin drawing (where a line begins)
    int endLine = -1;    // Index where to stop drawing (where a line ends)
    int lastk = -1;      // Holds last value of the character position

    for (int i = 0, k = 0; i < length; i++, k++) {
        // Get next codepoint from byte string and glyph index in font
        int codepointByteCount = 0;
        int codepoint = GetCodepoint(&text[i], &codepointByteCount);
        int index = GetGlyphIndex(font, codepoint);

        // NOTE: Normally we exit the decoding sequence as soon as a bad byte is found (and return 0x3f)
        // but we need to draw all of the bad bytes using the '?' symbol moving one byte
        if (codepoint == 0x3f) codepointByteCount = 1;
        i += (codepointByteCount - 1);

        float glyphWidth = 0;
        if (codepoint != '\n') {
            glyphWidth = (font.glyphs[index].advanceX == 0) ? font.recs[index].width * scaleFactor
                                                            : font.glyphs[index].advanceX * scaleFactor;

            if (i + 1 < length) glyphWidth = glyphWidth + spacing;
        }

        // NOTE: When wordWrap is ON we first measure how much of the text we can draw before going outside of the rec container
        // We store this info in startLine and endLine, then we change states, draw the text between those two variables
        // and change states again and again recursively until the end of the text (or until we get outside of the container).
        // When wordWrap is OFF we don't need the measure state so we go to the drawing state immediately
        // and begin drawing on the next line before we can get outside the container.
        if (state == MEASURE_STATE) {
            // TODO: There are multiple types of spaces in UNICODE, maybe it's a good idea to add support for more
            // Ref: http://jkorpela.fi/chars/spaces.html
            if ((codepoint == ' ') || (codepoint == '\t') || (codepoint == '\n')) endLine = i;

            if ((textOffsetX + glyphWidth) > rec.width) {
                endLine = (endLine < 1) ? i : endLine;
                if (i == endLine) endLine -= codepointByteCount;
                if ((startLine + codepointByteCount) == endLine) endLine = (i - codepointByteCount);

                state = !state;
            } else if ((i + 1) == length) {
                endLine = i;
                state = !state;
            } else if (codepoint == '\n')
                state = !state;

            if (state == DRAW_STATE) {
                textOffsetX = 0;
                i = startLine;
                glyphWidth = 0;

                // Save character position when we switch states
                int tmp = lastk;
                lastk = k - 1;
                k = tmp;
            }
        } else {
            if (codepoint == '\n') {
                if (!wordWrap) {
                    textOffsetY += (font.baseSize + font.baseSize / 2) * scaleFactor;
                    textOffsetX = 0;
                }
            } else {
                if (!wordWrap && ((textOffsetX + glyphWidth) > rec.width)) {
                    textOffsetY += (font.baseSize + font.baseSize / 2) * scaleFactor;
                    textOffsetX = 0;
                }

                // When text overflows rectangle height limit, just stop drawing
                if ((textOffsetY + font.baseSize * scaleFactor) > rec.height) break;

                // Draw selection background
                bool isGlyphSelected = false;
                if ((selectStart >= 0) && (k >= selectStart) && (k < (selectStart + selectLength))) {
                    DrawRectangleRec(
                        (Rectangle){rec.x + textOffsetX - 1, rec.y + textOffsetY, glyphWidth, (float)font.baseSize * scaleFactor},
                        selectBackTint);
                    isGlyphSelected = true;
                }

                // Draw current character glyph
                if ((codepoint != ' ') && (codepoint != '\t')) {
                    DrawTextCodepoint(font, codepoint, (Vector2){rec.x + textOffsetX, rec.y + textOffsetY}, fontSize,
                                      isGlyphSelected ? selectTint : tint);
                }
            }

            if (wordWrap && (i == endLine)) {
                textOffsetY += (font.baseSize + font.baseSize / 2) * scaleFactor;
                textOffsetX = 0;
                startLine = endLine;
                endLine = -1;
                glyphWidth = 0;
                selectStart += lastk - k;
                k = lastk;

                state = !state;
            }
        }

        if ((textOffsetX != 0) || (codepoint != ' ')) textOffsetX += glyphWidth;  // avoid leading spaces
    }
}

// Draw text using font inside rectangle limits
void DrawTextBoxed(Font font, const char* text, Rectangle rec, float fontSize, float spacing, bool wordWrap, Color tint) {
    DrawTextBoxedSelectable(font, text, rec, fontSize, spacing, wordWrap, tint, 0, 0, WHITE, WHITE);
}

}  // namespace

void Demo() {
    Seed world_seed = 12345;

    absl::node_hash_map<Location, std::string> map_chars;
    map_chars[{-1, -1}] = "`";
    map_chars[{-1, 0}] = "<-";
    map_chars[{-1, 1}] = "[_";
    map_chars[{0, -1}] = "^";
    map_chars[{0, 0}] = "o";
    map_chars[{0, 1}] = "v";
    map_chars[{1, -1}] = "7";
    map_chars[{1, 0}] = "->";
    map_chars[{1, 1}] = "_]";

    int left = 0, top = 0;
    constexpr int WIDTH = 16, HEIGHT = 10;
    Font font = GetFontDefault();  // Get default system font

    while (!WindowShouldClose()) {
        BeginDrawing();

        ClearBackground(RAYWHITE);

        for (int row = 0; row < HEIGHT; ++row) {
            const int y = top + row;
            for (int col = 0; col < WIDTH; ++col) {
                const int x = left + col;

                Location loc{x, y};

                const Region& region = GetRegion(loc, 2, world_seed);
                std::string box_text = region.name.value() + "\n";
                if (region.superior) {
                    auto& sup_loc = *region.superior;
                    auto delta = sup_loc - loc;
                    box_text += map_chars[delta];
                } else {
                    box_text += map_chars[{0, 0}];
                }

                Rectangle box{.x = 100.0f * col + 2, .y = 100.0f * row + 2, .width = 95, .height = 95};
                DrawTextBoxed(font, box_text.c_str(), box, 10.0f, 2.0f, true, BLACK);

                const Region& south = GetRegion({x, y + 1}, 2, world_seed);
                const Region& east = GetRegion({x + 1, y}, 2, world_seed);
                if (*region.supreme != *south.supreme) {
                    DrawRectangle(box.x - 3, box.y + box.height, 100, 2, BLACK);
                }
                if (*region.supreme != *east.supreme) {
                    DrawRectangle(box.x + box.width, box.y - 3, 2, 100, BLACK);
                }
            }
        }

        if (IsKeyPressed(KEY_DOWN)) {
            top += 1;
        } else if (IsKeyPressed(KEY_UP)) {
            top -= 1;
        } else if (IsKeyPressed(KEY_LEFT)) {
            left -= 1;
        } else if (IsKeyPressed(KEY_RIGHT)) {
            left += 1;
        }

        EndDrawing();
    }
}

}  // namespace ht2025

int main(int argc, char** argv) {
    // Initialization
    //--------------------------------------------------------------------------------------
    const int screenWidth = 1600;
    const int screenHeight = 1000;

    InitWindow(screenWidth, screenHeight, "HT 2025 - Inspect World Map");
    SetTargetFPS(60);

    ht2025::Demo();

    CloseWindow();
}