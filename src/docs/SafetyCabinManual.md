# Manual de Procedimiento: Safety Cabin IA

Este documento detalla el procedimiento estándar para la utilización del sistema **Safety Cabin IA** dentro de la plataforma TransporteSIMSA.

## 1. Objetivo
Garantizar la integridad física de los operadores y la seguridad de la carga mediante un monitoreo preventivo de biometría y estado de alerta en tiempo real.

## 2. Procedimiento Paso a Paso

### Paso 1: Selección del Operador
El sistema ya no activa la cámara de manera automática. Al ingresar a la sección "Safety Cabin IA" desde el Dashboard:
1. Se presentará una lista de los operadores activos.
2. Seleccione al operador que desea auditar haciendo clic en su perfil.
3. Verifique que la unidad asignada coincida con el monitoreo que desea realizar.

### Paso 2: Activación de la Consola
Una vez seleccionado el operador, ingresará a la consola de monitoreo:
1. Verá un botón prominente llamado **"Iniciar Auditoría IA / Activar Cámara"**.
2. Al hacer clic, el sistema solicitará permisos de hardware (si no se han dado) y activará el canal seguro de video.

### Paso 3: Captura y Análisis Biométrico
Con la cámara activa, el sistema utiliza **Redes Neuronales** para analizar:
- **Gaze Tracking**: Seguimiento de la mirada para detectar distracciones.
- **Micro-sueños**: Detección de parpadeos prolongados.
- **Estrés Cortisol-IA**: Estimación de niveles de estrés mediante micro-expresiones faciales.

Haga clic en el botón de captura central para realizar un corte de auditoría y recibir un reporte inmediato.

### Paso 4: Interpretación de Resultados
El sistema arrojará tres posibles estados:
- 🟢 **Óptimo**: El operador está alerta y en condiciones de continuar.
- 🟡 **Atención**: Niveles elevados de fatiga o estrés. Se recomienda una parada técnica.
- 🔴 **Riesgo Crítico**: Detección de sustancias, fatiga extrema o asalto. Se activan protocolos de emergencia.

## 3. Resolución de Problemas (FAQ)

**¿Qué hacer si la cámara no se apaga?**
El sistema ha sido actualizado para forzar el apagado de la cámara al cambiar de vista. Si el indicador sigue encendido, refresque la página (F5) para liberar el recurso de hardware.

**¿Por qué hay doble barra de desplazamiento?**
Se han eliminado las restricciones de altura fijas. Ahora puede desplazarse por toda la página de manera natural con el scroll principal del navegador.

---
*Powered by IA.AGUS &bull; SIMSA VISION IA 2026*
