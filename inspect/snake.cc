#include "raylib.h"

int main(void) {
    const int screenWidth = 800;
    const int screenHeight = 500;

    InitWindow(screenWidth, screenHeight, "raylib [core] example - basic window");

    SetTargetFPS(60);  // Set our game to run at 60 frames-per-second
    //--------------------------------------------------------------------------------------

    constexpr int kMaxSegs = 100;
    Rectangle segs[kMaxSegs] = {0};
    int num_segs = 3;
    int head_seg = num_segs - 1;
    int tail_seg = 0;

    int dx = 1, dy = 0;
    int new_dx = dx, new_dy = dy;

    for (int i = 0; i <= head_seg; ++i) {
        segs[i] = Rectangle{.x = (401.0f + 25 * i), .y = 251, .width = 24, .height = 24};
    }

    // Main game loop
    int frames = 0;
    Color col = GREEN;
    while (!WindowShouldClose())  // Detect window close button or ESC key
    {
        // Update
        if (++frames > 30) {
            frames = 0;
            const Rectangle& old_head = segs[head_seg];
            head_seg = (head_seg + 1) % kMaxSegs;

            dx = new_dx;
            dy = new_dy;

            float nx = old_head.x + 25 * dx, ny = old_head.y + 25 * dy;
            if (nx < 1) nx = 776;
            if (nx > 799) nx = 1;
            if (ny < 1) ny = 476;
            if (ny > 499) ny = 1;

            segs[head_seg] = Rectangle{.x = nx, .y = ny, .width = 24, .height = 24};

            if (IsKeyDown(KEY_SPACE) && num_segs < kMaxSegs) {
                num_segs++;
            } else {
                tail_seg = (tail_seg + 1) % kMaxSegs;
            }

            for (int i = 0; i < (num_segs - 1); ++i) {
                int seg = (tail_seg + i) % kMaxSegs;
                if (segs[seg].x == nx && segs[seg].y == ny) col = RED;
            }
        }

        if (IsKeyPressed(KEY_DOWN) && dy == 0) {
            new_dx = 0;
            new_dy = 1;
        } else if (IsKeyPressed(KEY_UP) && dy == 0) {
            new_dx = 0;
            new_dy = -1;
        } else if (IsKeyPressed(KEY_LEFT) && dx == 0) {
            new_dx = -1;
            new_dy = 0;
        } else if (IsKeyPressed(KEY_RIGHT) && dx == 0) {
            new_dx = 1;
            new_dy = 0;
        }

        // Draw
        BeginDrawing();

        ClearBackground(RAYWHITE);

        for (int i = 0; i < num_segs; ++i) {
            int seg = (tail_seg + i) % kMaxSegs;
            DrawRectangleRec(segs[seg], col);
        }

        EndDrawing();
        //----------------------------------------------------------------------------------
    }

    // De-Initialization
    //--------------------------------------------------------------------------------------
    CloseWindow();  // Close window and OpenGL context
    //--------------------------------------------------------------------------------------

    return 0;
}
