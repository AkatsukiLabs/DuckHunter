# 🎮 ESPECIFICACIONES DE ASSETS - DUCK HUNTER

## 📐 DIMENSIONES Y CONFIGURACIÓN

### 1. **DOG.PNG** (Sprite Sheet)
- **Dimensiones totales:** 256 x 192 px
- **Grid:** 4 columnas x 3 filas = 12 frames
- **Tamaño por frame:** 64 x 64 px
- **Animaciones configuradas:**
  - **search** (frames 0-3): Perro caminando/buscando
  - **snif** (frames 4-5): Perro olfateando
  - **detect** (frame 6): Perro detecta pato
  - **jump** (frames 7-8): Perro saltando
  - **catch** (frame 9): Perro con pato cazado
  - **mock** (frames 10-11): Perro riéndose

### 2. **DUCK.PNG** (Sprite Sheet)
- **Dimensiones totales:** 384 x 48 px
- **Grid:** 8 columnas x 1 fila = 8 frames
- **Tamaño por frame:** 48 x 48 px
- **Animaciones configuradas:**
  - **flight-diagonal** (frames 0-2): Vuelo diagonal
  - **flight-side** (frames 3-5): Vuelo lateral
  - **shot** (frame 6): Pato disparado
  - **fall** (frame 7): Pato cayendo

### 3. **BACKGROUND.PNG**
- **Dimensiones:** 256 x 240 px
- **Contenido:** Escenario con árbol, pasto y UI inferior
- **Elementos UI en la imagen:**
  - Área de balas (bottom left)
  - Área de patos cazados (bottom center)
  - Área de puntuación (bottom right)

### 4. **MENU.PNG**
- **Dimensiones:** 256 x 224 px
- **Contenido:** Pantalla de título "DUCK HUNTER"
- **Fondo negro con texto azul estilo NES**

### 5. **CURSOR.PNG**
- **Dimensiones:** 15 x 15 px
- **Contenido:** Mira/crosshair pixelada

### 6. **TEXT-BOX.PNG**
- **Dimensiones:** 78 x 50 px
- **Contenido:** Caja negra con borde blanco para texto

## 🎨 CONSIDERACIONES PARA NUEVOS ASSETS

### Paleta de Colores (NES Style)
- Máximo 4 colores por sprite (incluido transparencia)
- Colores definidos en `constant.ts`:
  - BLUE: #9fa2cb
  - BEIGE: #ffccc5
  - RED: #cb7387
  - Negro: #000000
  - Blanco: #FFFFFF

### Estilo Visual
- **Pixel Art 8-bit**
- **Sin antialiasing**
- **Bordes definidos**
- **Animaciones frame by frame**

### Organización de Sprite Sheets
- Los frames deben estar organizados en grid uniforme
- Cada frame del mismo tamaño exacto
- Orden de izquierda a derecha, arriba a abajo
- Fondo transparente para sprites

### Tamaño del Canvas del Juego
- **Resolución base:** 256 x 224 px
- **Scale actual:** 2x (512 x 448 px en pantalla)
- Todos los assets deben diseñarse para la resolución base

## 📦 FORMATO DE ARCHIVOS
- **Formato:** PNG-8 o PNG-24
- **Transparencia:** Canal alpha para sprites
- **Compresión:** Optimizada para web

## 🔄 PARA REEMPLAZAR ASSETS

1. **Mantén las mismas dimensiones exactas**
2. **Respeta la estructura del grid en sprite sheets**
3. **Usa la misma cantidad de frames por animación**
4. **Conserva las áreas transparentes donde corresponda**
5. **Los nombres de archivo deben ser idénticos**

## 💡 TIPS PARA DISEÑO

- El perro es el personaje más complejo (12 frames)
- El pato necesita frames simétricos para vuelo
- El background debe dejar espacio para el gameplay
- La UI inferior es parte del background.png
- El cursor debe ser visible pero no intrusivo
- Mantén consistencia en el estilo pixel art

## 🎯 EJEMPLO DE WORKFLOW

```bash
# Para crear un nuevo sprite sheet de pato:
1. Crear imagen de 384 x 48 px
2. Dividir en grid de 8 columnas
3. Dibujar cada frame en su celda de 48x48
4. Frames 0-2: animación de vuelo diagonal
5. Frames 3-5: animación de vuelo lateral  
6. Frame 6: sprite de impacto
7. Frame 7: sprite cayendo
8. Exportar como duck.png con transparencia
```

---

✨ **Nota:** Todos los assets actuales siguen el estilo clásico de Duck Hunt de NES. Para mantener la coherencia, cualquier asset nuevo debe respetar esta estética retro 8-bit.