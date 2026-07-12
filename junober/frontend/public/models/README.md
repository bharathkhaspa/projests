# Garment models

Drop `.glb` files here. They auto-load in the customizer.

Expected filenames (one per garment type):

- `tshirt.glb`
- `polo.glb`
- `hoodie.glb`
- `tank.glb`

If a file is missing, the customizer falls back to a procedural placeholder
shape (bulged extruded silhouette) for that garment.

## Free sources to try

- **Quaternius — Ultimate Modular Clothes** (CC0, low-poly stylized, instant)
  https://quaternius.com/packs/ultimatemodularclothes.html
- **Sketchfab** — filter Downloadable + Free, search "blank t-shirt hanger pbr"
  https://sketchfab.com/search?features=downloadable&q=blank+tshirt+hanger
- **CGTrader** — usually paid but has some free PBR shirts
  https://www.cgtrader.com/free-3d-models?keywords=tshirt+hanger

## Spec to look for / ask the seller

- glTF 2.0 binary (`.glb`)
- Clean UV unwrap on chest panel (for decal projection later)
- Separate materials for body, collar, hanger
- Front + back geometry both visible
- PBR with adjustable basecolor (we tint at runtime)
- Under ~50k triangles for mobile performance
