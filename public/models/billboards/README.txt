Drop your billboard / Werbeschild .glb models here as:
  billboard1.glb, billboard2.glb, billboard3.glb, ... up to billboard20.glb

The game discovers these automatically — drop the file in and restart
the dev server (npm run dev). If no file is present the game falls
back to the procedural posts-and-ad-face billboard.

Each billboard is auto-scaled to ~6m tall and grounded. Billboards
spawn just past the sidewalk on alternating sides and are rotated so
the board faces the road (rotation.y = ±π/2 applied at spawn).

For best results, export the .glb with the board's FRONT face pointing
in +Z (toward the camera in Blender). The game rotates it to face the
road at runtime.

Format: GLB (binary glTF 2.0). Download from Sketchfab / Poly Pizza /
Kenney as .glb, not .gltf.
