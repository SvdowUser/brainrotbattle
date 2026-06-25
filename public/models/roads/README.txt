Drop your road / street .glb models here as:
  road1.glb, road2.glb, ... up to road10.glb

Perfect for: poly.pizza "Street Straight" (the purple-background model
you had up) or any other straight-road-with-sidewalks segment.

If ANY road model is present, the game replaces the procedural asphalt +
sidewalks + curbs with a clone of the model per 20m chunk. If no file is
present, the procedural road stays.

The game auto-scales each road segment so its LENGTH along Z matches the
chunk length (20m) and its width is ~15m (road + sidewalks combined).
Make sure your model's forward axis is +Z (Blender default when you tick
"Forward: +Z Forward" in the glTF exporter).

Format: GLB (binary glTF 2.0). Download from Poly Pizza / Sketchfab /
Kenney as .glb, not .gltf.
