# Guía de Captura y Arquitectura de Cámaras - Vision IA Pro

Esta guía aclara la arquitectura final del sistema (Arco de Cámaras Fijas) y el protocolo para realizar pruebas de concepto simuladas con un dispositivo móvil (iPhone 13 mini).

## 1. Arquitectura Objetivo: Arco de Inspección (Gate)

El sistema final está diseñado para operar sin intervención humana, utilizando un arco con **4 cámaras fijas** sincronizadas que graban al paso del tráiler:

| ID Cámara | Ubicación | Objetivo Principal | Lógica de AI |
| :--- | :--- | :--- | :--- |
| **CAM-01** | **Lateral Izquierdo** | Llantas y Rines (Lado Piloto) | Detectar daños laterales, leer marca/modelo, contar ejes. |
| **CAM-02** | **Lateral Derecho** | Llantas y Rines (Lado Copiloto) | Idem al lado izquierdo. |
| **CAM-03** | **Inferior (Piso)** | Llantas Interiores / Banda | Medir profundidad de dibujo (tread depth) y detectar objetos incrustados. |
| **CAM-04** | **Frontal/Trasera** | Placas y Núm. Económico | Identificar la unidad (`OCR`) para asignar el reporte correctamente. |

---

## 2. Protocolo de Pruebas con iPhone (Simulación)

Dado que actualmente estamos probando la **capacidad de la IA** usando la app móvil (`MobileCapture`), no podemos grabar las 4 vistas simultáneamente. Simularás ser cada una de las cámaras por separado.

### ¿Cómo probar con tu iPhone 13 mini?

Para validar que la IA detecta correctamente, graba videos individuales simulando la posición de cada cámara fija:

#### Prueba A: Simulación Lateral (CAM-1 o CAM-2)
*   **Posición:** Párate fijo o camina en línea recta paralela al camión.
*   **Acción:** Graba de la primera a la última llanta de un solo lado (como si el camión pasara frente a ti).
*   **Objetivo:** Verificar que la IA cuente correctamente los ejes y detecte la marca de las llantas.

#### Prueba B: Simulación de Placas (CAM-4)
*   **Posición:** Párate frente o detrás del camión.
*   **Acción:** Graba 5 segundos enfocado en la placa y número económico.
*   **Objetivo:** Verificar que el sistema reconozca el ID del camión automáticamente.

### Nota sobre la App Actual
La herramienta actual `Escáner Móvil` acepta **1 video a la vez**.
*   Al subir un video "Lateral", la IA te dará el reporte de esas llantas.
*   El sistema final unificará los 4 videos en un solo "Evento de Inspección", pero para efectos de prueba, analizarás por partes.
