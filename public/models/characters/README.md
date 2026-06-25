# Character Models

Put your `.glb` character files in this folder.

## Required Filenames

The game auto-loads the first available character. Start with:

- `tralalero.glb` ← Loaded by default

## Future Characters (to add later)

- `bombardino.glb`
- `tungtung.glb`
- `brr_patapim.glb`
- `cappuccino.glb`
- `crocodilo.glb`
- `trippi.glb`
- `ballerina.glb`

## Where to Get Them

### Option 1: Sketchfab (FREE, recommended)

1. https://sketchfab.com/3d-models/italian-brainrot-pack-vol1-2c36c12a0243457aa05c402c46db4660
2. Click "Download 3D Model"
3. Choose **glTF** format → download `.zip`
4. Extract the `.glb` files and put them here

**Important:** Add the artist credit to `/public/CREDITS.txt` (CC-BY requires attribution).

### Option 2: Meshy AI ($20/month)

1. Sign up at https://www.meshy.ai
2. Text-to-3D: prompt like *"crocodile head on human body with blue shorts, cartoon style, T-pose"*
3. Go to "Animate" tab → select running, jumping, sliding animations
4. Export as GLB with merged animations
5. Put the file here

### Animation Requirements

If the GLB has animations, the game will look for these names (case-insensitive):
- `run` or `running` (loop, in-place)
- `jump`
- `slide`
- `death`

If no animations, the game falls back to the procedural placeholder model.

## File Size Tips

- Target < 2 MB per character (the game preloads them)
- Use https://gltf.report/ to check size and optimize
- Run through `gltf-transform optimize --compress draco` to reduce by 70%+
