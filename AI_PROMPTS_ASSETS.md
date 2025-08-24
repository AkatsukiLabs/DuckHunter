# 🎨 PROMPTS OPTIMIZADOS PARA GENERACIÓN PERFECTA DE ASSETS

## ⚠️ CONFIGURACIÓN CRÍTICA PARA LA IA
**ANTES DE GENERAR**: Configura tu IA para generar imágenes en dimensiones EXACTAS sin redimensionamiento posterior.

---

## 1️⃣ BACKGROUND.PNG - Escenario de Pradera al Mediodía

### PROMPT COMPLETO:
```
I need a pixel art background for a Duck Hunt game with EXACT dimensions of 256 pixels width by 240 pixels height. DO NOT RESIZE, generate directly at 256x240 pixels.

STRICT REQUIREMENTS:
- Dimensions: EXACTLY 256x240 pixels (critical - game will break if different)
- Style: 8-bit NES pixel art, NO anti-aliasing, hard pixel edges only
- Color limit: Maximum 16 colors total for authentic retro look

LAYOUT (top to bottom):
- Pixels 0-160: Clear bright blue sky (#87CEEB) with 2-3 small white clouds
- Pixels 160-180: Distant rolling green hills for depth
- Pixels 180-208: Detailed grass field with varied grass blade heights
- Pixels 208-240: SOLID dark green (#1B4F1B) rectangle for UI overlay (NO details here)

ELEMENTS TO INCLUDE:
- Left side (x: 20-60): One large tree with brown trunk (#654321) and full green foliage (#228B22)
- Right side (x: 180-220): 2-3 small bushes at different heights
- Scattered across grass: 4-5 small wildflowers (yellow/white pixels)

LIGHTING: Bright noon sun, vibrant colors, no shadows

CRITICAL: The bottom 32 pixels (208-240) MUST be a solid color block for game UI. Output must be EXACTLY 256x240 pixels.
```

---

## 2️⃣ MENU.PNG - Pantalla de Título Pradera Soleada

### PROMPT COMPLETO:
```
Create a pixel art title screen with EXACT dimensions of 256 pixels width by 224 pixels height. DO NOT RESIZE, generate directly at 256x224 pixels.

STRICT REQUIREMENTS:
- Dimensions: EXACTLY 256x224 pixels (will not work if different size)
- Style: 8-bit NES pixel art, NO anti-aliasing, sharp pixels only
- Color palette: Bright daylight prairie colors, maximum 16 colors

COMPOSITION:
- Top 40%: Bright blue sky (#87CEEB) with one puffy white cloud
- Middle 30%: Rolling green hills with varying shades of green
- Bottom 30%: Detailed grass prairie with tall grass swaying
- Center area: Keep relatively empty/simple for title text overlay

DECORATIVE ELEMENTS:
- Top right: Bright yellow sun (#FFD700) as 8x8 pixel circle
- Sky area: 3 small bird silhouettes in V formation (4x4 pixels each)
- Grass area: 2-3 flowers scattered (red poppies or yellow dandelions)

MOOD: Cheerful sunny midday in summer prairie

CRITICAL: Output MUST be exactly 256x224 pixels. This is for overlaying text, so keep center area uncluttered.
```

---

## 3️⃣ TEXT-BOX.PNG - Caja de Diálogo Rústica

### PROMPT COMPLETO:
```
Create a pixel art dialog box frame with EXACT dimensions of 78 pixels width by 50 pixels height. Generate directly at 78x50 pixels, NO RESIZING.

STRICT REQUIREMENTS:
- Dimensions: EXACTLY 78x50 pixels (UI will break if different)
- Style: 8-bit pixel art, clean pixels, no anti-aliasing
- Color limit: 4-6 colors maximum

DESIGN:
- Outer border: 2-pixel thick wooden frame
- Wood color: Medium brown (#8B4513) with darker brown (#654321) for shading
- Frame style: Rustic wooden planks with visible wood grain (1-pixel lines)
- Inner area: Solid dark brown (#2F1F0F) or black (#000000) for text contrast
- Corners: Rounded or beveled (2x2 pixel curves)

TEXTURE DETAILS:
- Add 1-pixel wood grain lines horizontally
- Small nail dots in corners (1 pixel, darker brown)
- Slight 1-pixel highlight on top edge for depth

CRITICAL: Must be EXACTLY 78x50 pixels. Interior must be dark for white text visibility.
```

---

## 4️⃣ CURSOR.PNG - Mantener Original

**NOTA**: Mantienes el cursor original de 15x15 pixels. No necesita regeneración.

---

## 🎯 VERIFICACIÓN POST-GENERACIÓN

### CHECKLIST OBLIGATORIO:
```
[ ] Background.png = 256 x 240 pixels EXACTOS
[ ] Menu.png = 256 x 224 pixels EXACTOS  
[ ] Text-box.png = 78 x 50 pixels EXACTOS
[ ] Todos los archivos son PNG sin compresión con pérdida
[ ] Pixel art sin anti-aliasing (bordes duros)
[ ] Paleta de colores consistente entre assets
[ ] Background tiene área UI sólida en bottom 32 pixels
```

### COMANDO DE VERIFICACIÓN (Terminal):
```bash
# Verificar dimensiones exactas:
file background.png  # Debe mostrar: 256 x 240
file menu.png       # Debe mostrar: 256 x 224
file text-box.png   # Debe mostrar: 78 x 50
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

### Si la IA genera tamaño incorrecto:
```
The image MUST be EXACTLY [WIDTH] x [HEIGHT] pixels. 
Please regenerate at the exact dimensions without any resizing or scaling.
Current image is wrong size. Generate a new one at precisely [WIDTH] x [HEIGHT] pixels.
```

### Si los colores no coinciden:
```
Use this EXACT color palette:
- Sky: #87CEEB
- Grass: #228B22 and #90EE90  
- Earth: #8B4513
- Tree trunk: #654321
Match these hex colors precisely for consistency.
```

### Si el estilo no es pixel art:
```
This must be 8-bit NES style pixel art with:
- NO anti-aliasing
- NO smooth gradients
- HARD pixel edges only
- Each pixel must be clearly visible
- Maximum 16 colors total
```

---

## 💡 PROMPT MEJORADO PARA CONSISTENCIA TOTAL

### MEGA PROMPT (Para generar todos los assets con estilo unificado):
```
I need 3 pixel art images for a Duck Hunt game, all in the same bright sunny prairie style:

SHARED STYLE FOR ALL:
- 8-bit NES pixel art, no anti-aliasing
- Bright midday lighting
- Color palette: Sky #87CEEB, Grass #228B22/#90EE90, Wood #8B4513/#654321
- Sharp pixel edges, maximum 16 colors each

IMAGE 1 - Background: EXACTLY 256x240 pixels
[Insertar especificaciones del prompt 1]

IMAGE 2 - Menu: EXACTLY 256x224 pixels  
[Insertar especificaciones del prompt 2]

IMAGE 3 - Text Box: EXACTLY 78x50 pixels
[Insertar especificaciones del prompt 3]

CRITICAL: Each image MUST be the EXACT dimensions specified. Do not scale or resize.
```

---

## ✅ VALIDACIÓN FINAL EN CÓDIGO

Después de reemplazar los assets, verifica en el navegador:
1. El juego carga sin errores
2. El background se ve completo
3. El menú aparece centrado
4. La text-box aparece cuando debe
5. No hay glitches visuales

**IMPORTANTE**: Si algún asset no tiene las dimensiones exactas, el juego puede mostrar errores o comportamiento inesperado.