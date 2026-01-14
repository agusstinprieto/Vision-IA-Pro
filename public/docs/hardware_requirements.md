
# Análisis de Viabilidad de Hardware: iPhone 13 Mini vs. Implementación Industrial

## 1. El Estándar Actual (Lo que has estado probando)
Has estado utilizando un **iPhone 13 Mini**. Es crucial entender que, aunque parece un "teléfono normal", en términos de visión computacional es una herramienta extremadamente potente.

*   **Chip A15 Bionic:** Tiene un procesador de imagen (ISP) dedicado que realiza millones de operaciones por foto para corregir luz, reducir ruido y enfocar instantáneamente.
*   **Sensor Sony de Alta Gama:** Píxeles grandes que captan mucha luz, vital para ver detalles negros (llantas) en zonas oscuras (guardabarros).
*   **HDR Inteligente:** Compensa automáticamente el contraste brutal entre el cielo brillante y la llanta oscura.

## 2. El Desafío de la "Vida Real" (Inventario de Llantas)

Para que la App de Inventario funcione igual de bien en producción, debemos mitigar tres riesgos principales:

### A. Si usas Celulares para Operarios (App Móvil)
Si das a los operarios celulares Android de gama baja (ej. equipos de $150 USD), la app **NO funcionará igual**.
*   **El Problema:** Tendrán "Motion Blur" (fotos borrosas si mueven la mano), mal enfoque en la sombra y ruido visual que la IA confundirá con grietas.
*   **La Solución / Requisito Mínimo:**
    *   No usar gama baja. Mínimo **Samsung Galaxy A54** o superior, Pixel 6a, o iPhones reacondicionados (iPhone 11 o SE 2020 en adelante).
    *   **Flash Obligatorio:** Programaremos la app para que siempre encienda la linterna al escanear (Torch Mode). Esto iguala el terreno.

### B. Si usas Cámaras Fijas (Arco de Entrada)
Aquí la diferencia es dramática. Una cámara de seguridad estándar (Hikvision/Dahua de $50 USD) **NO servirá** para leer las letras de las llantas en movimiento.
*   **El Problema:**
    *   **Rolling Shutter:** Las cámaras baratas escanean la imagen línea por línea. Si el camión se mueve, la llanta se verá ovalada o deforme.
    *   **Velocidad de Obturación:** Necesitas congelar el movimiento. Una cámara normal se configura a 1/30s (borroso). Necesitamos 1/1000s o más rápido.
    *   **Rango Dinámico:** Una cámara barata verá la llanta como un círculo negro sin detalles si hay sol fuerte detrás.

## 3. Sugerencias Críticas para el Éxito

### Para la App Móvil (Tu caso inmediato):
1.  **Validar Dispositivos:** Antes de comprar flota, prueba la app en el teléfono Android más barato que tengas. Si el "Smart Scan" falla ahí, sube de gama.
2.  **Iluminación Activa:** En la versión final de la app, forzaremos el uso del Flash LED. El caucho negro absorbe luz; necesitamos "inyectarle" luz para ver la marca y el relieve.

### Para el Arco (Futuro):
1.  **Tecnología Global Shutter:** La cámara *debe* tener Global Shutter (escanea todo el cuadro a la vez). Son más caras (ej. Basler, FLIR, o HIKRobot) pero vitales para vehículos en movimiento >10km/h.
2.  **Iluminadores IR o Estrobos:** No confíes en la luz del sol. Necesitas focos LED potentes a la altura de la llanta para matar las sombras del guardabarros.

## Conclusión
La app **SÍ funcionará**, pero el iPhone 13 Mini te está dando una "falsa sensación de facilidad" porque su software corrige errores humanos (manos temblorosas, contraluz) automáticamente.

**Veredicto:**
*   Para **Inventario Manual**: Es 100% viable siempre que no se usen celulares "basura".
*   Para **Arco Automático**: Requiere inversión en cámaras especializadas, no webcams ni CCTV estándar.
