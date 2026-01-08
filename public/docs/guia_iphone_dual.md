# Guía de Simulación con iPhone 13 (Dual Camera)

Las aplicaciones web (como esta) tienen una limitación en iOS: **Safari no permite usar la cámara frontal y trasera al mismo tiempo en vivo.**

Sin embargo, para tu presentación, puedes lograr el efecto exacto ("Chofer + Carretera") usando una app profesional de grabación y nuestro **Modo Simulación**.

## Procedimiento "DoubleTake" (Alta Calidad)

Este método te permite grabar un video real usando las dos cámaras de tu iPhone 13 simultáneamente y luego cargarlo en el sistema para que la IA lo "analice".

### Paso 1: Preparar el iPhone
1.  Ve a la App Store y descarga **"DoubleTake by FiLMiC Pro"** (Es gratuita y especializada para esto).
2.  Abre la app y concede permisos de cámara.
3.  En el selector de lentes (ícono abajo izquierda), selecciona:
    *   **Lente A:** Selfie (Cámara Frontal).
    *   **Lente B:** Wide/Ultrawide (Cámara Trasera).
4.  Selecciona el modo de visualización **"Split"** (Pantalla Dividida) o **"Discrete"** (Dos archivos separados).
    *   *Recomendación:* Usa **"Discrete"** para tener el control total. Esto guardará dos videos separados: uno de tu cara y uno de la calle.

### Paso 2: Grabar la "Ruta"
1.  Sube a tu auto (o simula en tu escritorio).
2.  Coloca el iPhone en el tablero (Mount) viendo hacia la calle y hacia ti.
3.  Graba unos 30-60 segundos manejando o simulando conducir.
4.  ¡Actúa! Mira a la cámara, simula cansancio (cierra los ojos 2 segundos) para probar la IA, mira el celular, etc.

### Paso 3: Transferir a la App
1.  Exporta los videos de DoubleTake a tu carrete.
2.  Pásalos a tu computadora (AirDrop es lo más rápido).
3.  Renómbraslos:
    *   Video de la calle -> `road.mp4`
    *   Video de tu cara -> `cabin.mp4`
4.  Copia estos archivos en la carpeta de tu proyecto:
    *   `TransporteSIMSA-IA-Pro/public/demo/road.mp4`
    *   `TransporteSIMSA-IA-Pro/public/demo/cabin.mp4`

### Paso 4: ¡Presentar!
1.  Abre la App SIMSA en tu navegador (`npm run dev`).
2.  Ve al menú -> **Modo Simulación**.
3.  Automáticamente cargará tus videos reales en alta definición.
4.  La interfaz mostrará que los videos vienen "En Vivo" del iPhone.

---

## Opción B: "Camo" (Webcam en Vivo - 1 Cámara)
Si forzosamente necesitas video **en vivo** (no grabado), solo podrás usar **una** cámara a la vez.

1.  Descarga **Reincubate Camo** en tu iPhone y PC/Mac.
2.  Conecta por cable Lightning/USB.
3.  En la App SIMSA -> "Salud del Operador".
4.  El navegador detectará tu iPhone como una webcam de alta calidad.
5.  Podrás hacer el análisis de fatiga en vivo, pero sin la vista de la carretera simultánea.
