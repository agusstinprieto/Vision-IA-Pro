# Arquitectura de Conectividad del Arco (Gate)

Este documento responde a las preguntas técnicas sobre la implementación física del arco de 4 cámaras.

## 1. ¿Cómo llegan las señales de las 4 cámaras?

**Respuesta: Cableado Estructurado (Ethernet PoE).**

No utilizamos WiFi para las cámaras críticas del arco por tres razones:
1.  **Estabilidad:** El WiFi puede tener interferencias (lluvia, estructuras metálicas del camión).
2.  **Sincronización:** Necesitamos que las 4 cámaras graben *exactamente* al mismo microsegundo.
3.  **Ancho de Banda:** 4 flujos de video HD simultáneos saturarían una red WiFi convencional.

### Esquema de Conexión
*   Cada cámara (Izq, Der, Piso, Placas) se conecta mediante un cable **Ethernet (Cat6)**.
*   Estos cables van a un **Switch PoE (Power over Ethernet)**, que les da energía y datos por el mismo cable.

---

## 2. ¿Cómo se juntan y analizan los 4 videos a la vez?

El "cerebro" local no es la nube, es un **Servidor de Borde (Edge Server)** ubicado físicamente cerca del arco (en la caseta o un gabinete intemperie).

### El Flujo de Datos ("El Pipeline"):

1.  **Disparo (Trigger):**
    *   Un sensor físico (láser o lazo magnético en el piso) detecta que un camión va a entrar.
    *   Envía una señal al Edge Server: *"¡GRABA AHORA!"*

2.  **Captura Sincronizada:**
    *   El Edge Server ordena a las 4 cámaras grabar simultáneamente.
    *   Se genera un **"Evento de Paso"** que agrupa los 4 archivos de video con una misma estampa de tiempo (Timestamp).

3.  **Procesamiento Local (Edge AI):**
    *   El servidor local procesa los videos *in situ* para extraer los fotogramas clave (mejores fotos de cada llanta).
    *   **¿Por qué local?** Porque subir 4 videos pesados a la nube tardaría mucho. Solo subimos las fotos "útiles" y los datos (textos, alertas).

4.  **Envío a la Nube (Vision IA Pro):**
    *   Una vez procesado, el Edge Server manda a los servidores de Vision IA Pro el paquete final:
        *   `Placa: ABC-123`
        *   `Llantas: [Foto1, Foto2, ...]`
        *   `Estado: Alerta Roja`

---

## 3. Resumen de Hardware Necesario

1.  **4 Cámaras IP Industriales** (Tipo Bullet para laterales, Tipo Domo/Box para placas).
2.  **1 Switch PoE** de 8 puertos.
3.  **1 Mini PC / NVR Inteligente** (Edge Server) con GPU básica (ej. NVIDIA Jetson o PC con Intel Core).
4.  **Sensores de Barrera** (opcionales, para mayor precisión de inicio/fin).

---

## 4. Detalle Técnico: Sensores de Barrera

El usuario preguntó: *"¿Cómo son los sensores de barrera?"*

Son dispositivos industriales (tipo **Fotoeléctricos**) que funcionan como un "cable invisible" para detectar la presencia física del camión con precisión milimétrica.

### Características Principales:
*   **Tecnología:** Rayo Infrarrojo (Invisble al ojo humano).
*   **Componentes:** Par Emisor (envía la luz) y Receptor (recibe la luz).
*   **Marcas Comunes:** Banner Engineering, SICK, Keyence.

### Funcionamiento ("El Gatillo"):
1.  **Estado Reposo:** El rayo viaja del Emisor al Receptor sin interrupción. El sistema sabe que el arco está vacío.
2.  **Activación (Trigger ON):** La cabina del camión "rompe" el rayo. El sensor envía un pulso eléctrico (0V a 24V) al Edge Server.
    *   *Acción:* El servidor comienza a grabar inmediatamente.
3.  **Finalización (Trigger OFF):** El camión termina de pasar y el rayo vuelve a conectarse.
    *   *Acción:* El servidor espera 3 segundos (margen de seguridad) y corta la grabación.

### Ubicación Física:
*   **Sensor A (Inicio):** 2 metros antes de las cámaras. Prepara el sistema.
*   **Sensor B (Cierre):** 2 metros después de las cámaras. Confirma que el vehículo salió completamente.
