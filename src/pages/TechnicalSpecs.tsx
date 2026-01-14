import React from 'react';
import { Cpu, Camera, Server, AlertTriangle, CheckCircle, Smartphone, Zap } from 'lucide-react';

const TechnicalSpecs = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Header */}
                <header className="border-b border-slate-700 pb-8">
                    <h1 className="text-4xl font-bold text-yellow-500 mb-2">Vision IA Pro: Especificaciones Técnicas</h1>
                    <p className="text-slate-400 text-lg">Documentación unificada de Hardware, Lógica Algorítmica y Conectividad.</p>
                </header>

                {/* 1. Lógica del Proyecto (Core Core) */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Cpu className="w-8 h-8 text-blue-400" />
                        <h2 className="text-2xl font-semibold">1. Lógica de Inspección (Smart Scan V3)</h2>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <p className="mb-4 text-slate-300">
                            El núcleo del sistema utiliza un algoritmo de selección inteligente para garantizar la captura de neumáticos válida sin intervención humana crítica.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/50 p-4 rounded-lg">
                                <h3 className="font-semibold text-white mb-2">📸 Estrategia de Captura</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
                                    <li><span className="text-yellow-400">Velocidad de Scan:</span> 8 FPS (Doble densidad).</li>
                                    <li><span className="text-yellow-400">Capacidad:</span> Buffer circular de 36 cuadros.</li>
                                    <li><span className="text-yellow-400">Deep Clean Filter:</span> Descarta ruido (asfalto, chasis) con score &lt; 18.</li>
                                </ul>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-lg">
                                <h3 className="font-semibold text-white mb-2">🧠 Capacidades IA</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
                                    <li><span className="text-green-400">Detección de Marca:</span> Alta probabilidad mediante OCR+Vision.</li>
                                    <li><span className="text-green-400">Estado/Salud:</span> Clasificación fiable (Crítico / Media Vida / Nueva).</li>
                                    <li><span className="text-red-400">Milimetraje Exacto:</span> No posible sin láser (solo estimación visual).</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Hardware: Móvil vs Industrial */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Smartphone className="w-8 h-8 text-purple-400" />
                        <h2 className="text-2xl font-semibold">2. Requisitos de Hardware</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Escenario Movil */}
                        <div className="border border-slate-700 rounded-xl p-6 bg-slate-800/50">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Smartphone className="w-5 h-5" /> App Móvil (Operarios)
                            </h3>
                            <div className="space-y-4">
                                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-sm text-red-200">
                                    <AlertTriangle className="inline w-4 h-4 mr-2" />
                                    <strong>Riesgo Crítico:</strong> Celulares de gama baja (&lt;$150 USD) producirán fotos borrosas (Motion Blur) inservibles.
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-300">Estándar Mínimo:</h4>
                                    <ul className="list-disc pl-5 text-sm text-slate-400">
                                        <li>Samsung A54 / iPhone SE 2020 o superior.</li>
                                        <li><strong>Flash LED Activo:</strong> Obligatorio para iluminar el caucho negro.</li>
                                        <li>Procesamiento HDR para contraluz.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Escenario Arco */}
                        <div className="border border-slate-700 rounded-xl p-6 bg-slate-800/50">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Camera className="w-5 h-5" /> Arco Automatizado
                            </h3>
                            <div className="space-y-4">
                                <div className="p-3 bg-yellow-900/20 border border-yellow-900/50 rounded text-sm text-yellow-200">
                                    <Zap className="inline w-4 h-4 mr-2" />
                                    <strong>Requisito Industrial:</strong> Cámaras CCTV estándar NO sirven para vehículos en movimiento.
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-300">Especificaciones:</h4>
                                    <ul className="list-disc pl-5 text-sm text-slate-400">
                                        <li><strong>Global Shutter:</strong> Indispensable para evitar distorsión "Jello".</li>
                                        <li><strong>Velocidad Obturación:</strong> 1/1000s mínimo.</li>
                                        <li><strong>Iluminación Externa:</strong> Focos LED/Estrobos a nivel de suelo.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Conectividad y Sensores */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Server className="w-8 h-8 text-cyan-400" />
                        <h2 className="text-2xl font-semibold">3. Arquitectura de Conectividad</h2>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900 text-slate-200">
                                <tr>
                                    <th className="p-3">Componente</th>
                                    <th className="p-3">Función</th>
                                    <th className="p-3">Protocolo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                <tr>
                                    <td className="p-3 font-medium text-white">Sensores de Barrera</td>
                                    <td className="p-3">Detectar presencia y dirección del camión. Trigger de inicio.</td>
                                    <td className="p-3">Digital I/O (Dry Contact)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-white">Cámaras IP (x4/x8)</td>
                                    <td className="p-3">Captura de video sincronizado de todos los ángulos.</td>
                                    <td className="p-3">RTSP / GigE Vision (PoE)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-white">Edge Server (Local)</td>
                                    <td className="p-3">Procesamiento de video en tiempo real, buffering y subida a nube.</td>
                                    <td className="p-3">LAN / Fibra Óptica</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-white">Nube (Supabase + IA)</td>
                                    <td className="p-3">Almacenamiento permanente y análisis forense con Vision IA.</td>
                                    <td className="p-3">HTTPS / REST API</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 4. Upgrade Path: Laser Profiler */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Zap className="w-8 h-8 text-red-500" />
                        <h2 className="text-2xl font-semibold">4. Fase 2: Módulo Láser (Precisión Milimétrica)</h2>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-red-900/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap size={100} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Tecnología "Sheet of Light"</h3>
                        <p className="text-slate-300 mb-6">
                            Para obtener la profundidad exacta del surco (ej. 4.5mm), el sistema soporta la integración de un módulo de triangulación láser.
                        </p>

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-black/40 p-4 rounded border border-white/5">
                                <div className="text-red-400 font-bold mb-1">PROYECCIÓN</div>
                                <p className="text-slate-400">Láser de Línea (660nm/450nm) proyectado transversalmente sobre la banda de rodadura.</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded border border-white/5">
                                <div className="text-red-400 font-bold mb-1">CAPTURA FILTRADA</div>
                                <p className="text-slate-400">Cámara dedicada con filtro óptico (Bandpass) que bloquea el sol y solo ve la línea láser.</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded border border-white/5">
                                <div className="text-red-400 font-bold mb-1">TRIANGULACIÓN</div>
                                <p className="text-slate-400">El software mide la deformación de la línea para calcular la profundidad 3D del surco.</p>
                            </div>
                        </div>

                        {/* Software Strategy & Cost */}
                        <div className="grid md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-red-900/30">
                            {/* Strategy */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <Cpu className="w-5 h-5 text-blue-400" /> Estrategia de Software In-House
                                </h4>
                                <ul className="space-y-3 text-sm text-slate-400">
                                    <li className="flex gap-2">
                                        <span className="text-blue-400 font-bold">1.</span>
                                        <span>
                                            <strong className="text-slate-200">OpenCV Line Extraction:</strong> Segmentación de color (Rojo/Azul) para aislar el láser del fondo.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-400 font-bold">2.</span>
                                        <span>
                                            <strong className="text-slate-200">Sub-pixel Peak Detection:</strong> Algoritmo matemático para encontrar el centro exacto de la línea (precisión 0.1mm).
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-400 font-bold">3.</span>
                                        <span>
                                            <strong className="text-slate-200">Triangulación Geométrica:</strong> Conversión directa de píxeles a milímetros basada en el ángulo de la cámara.
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Cost */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" /> Presupuesto Estimado (Híbrido)
                                </h4>
                                <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-slate-400">Costo Hardware (2 Lados)</span>
                                        <span className="text-2xl font-bold text-green-400">~$1,250 USD</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4">Vs $12,000+ de soluciones comerciales (Keyence/Sick).</p>

                                    <ul className="text-xs text-slate-400 space-y-1">
                                        <li>• 2x Cámaras Global Shutter (~$700)</li>
                                        <li>• 2x Lásers de Línea 100mW (~$180)</li>
                                        <li>• 2x Lentes + Filtros Ópticos (~$250)</li>
                                        <li>• Gabinetes y Cables (~$120)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Performance & Real World benchmarks */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Activity className="w-8 h-8 text-cyan-400" />
                        <h2 className="text-2xl font-semibold">5. Rendimiento en Producción (Edge Computing)</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Demo vs Real */}
                        <div className="bg-slate-800 p-6 rounded-xl border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Simulación Web vs. Arco Real</h3>
                            <div className="space-y-4">
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <div className="text-yellow-400 text-xs font-bold uppercase mb-1">Simulación Actual</div>
                                    <div className="text-2xl font-mono text-white mb-1">~15-30 seg</div>
                                    <p className="text-xs text-slate-400">Depende de tu internet 4G/WiFi para subir fotos a la nube una por una.</p>
                                </div>
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <div className="text-green-400 text-xs font-bold uppercase mb-1">Producción (Edge Server)</div>
                                    <div className="text-2xl font-mono text-white mb-1">&lt; 1 segundo</div>
                                    <p className="text-xs text-slate-400">Procesamiento LAN Gigabit (Local). Sin espera de subida. El camión no se detiene.</p>
                                </div>
                            </div>
                        </div>

                        {/* Critical Factors */}
                        <div className="bg-slate-800 p-6 rounded-xl border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Requisitos Operativos Críticos</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="p-2 bg-red-500/20 rounded text-red-400"><BatteryCharging size={16} /></div>
                                    <div>
                                        <div className="text-slate-200 font-bold text-sm">Respaldo de Energía (UPS)</div>
                                        <p className="text-slate-500 text-xs">Vital. Picos de voltaje pueden quemar sensores láser. UPS Online 2KVA requerido.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded text-blue-400"><Wifi size={16} /></div>
                                    <div>
                                        <div className="text-slate-200 font-bold text-sm">Conectividad Dedicada</div>
                                        <p className="text-slate-500 text-xs">Starlink o Fibra dedicada para sincronizar datos a la nube sin saturar la red de la oficina.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-500/20 rounded text-amber-400"><Droplets size={16} /></div>
                                    <div>
                                        <p className="text-slate-500 text-xs">Sistema de aire comprimido o limpieza manual semanal. Lente sucio = IA ciega.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-700/50 rounded text-slate-400"><AlertTriangle size={16} /></div>
                                    <div>
                                        <div className="text-slate-200 font-bold text-sm">Limpieza de Llantas (Recomendado)</div>
                                        <p className="text-slate-500 text-xs">
                                            <span className="text-red-400 font-bold">Lodo = Ceguera.</span> Para el Láser (mm exactos), la llanta debe estar libre de plastas de lodo. Se sugiere "Air Knives" o lavado previo.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 6. Installation Budget & Infrastructure */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <h2 className="text-2xl font-semibold">6. Presupuesto de Infraestructura Complementaria</h2>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-white/10">
                        <p className="text-slate-300 mb-6">
                            Para garantizar la operatividad 24/7 y proteger la inversión en sensores, se requiere la siguiente infraestructura auxiliar.
                            <span className="block text-xs text-slate-500 mt-1">*Precios estimados de mercado para cotización de instalación.</span>
                        </p>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-slate-900 text-slate-200 uppercase text-xs">
                                    <tr>
                                        <th className="p-3 rounded-l-lg">Categoría</th>
                                        <th className="p-3">Concepto</th>
                                        <th className="p-3 text-right">Costo Est. (USD)</th>
                                        <th className="p-3 rounded-r-lg">Justificación Crítica</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {/* Energía */}
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-bold text-yellow-400">A. Energía</td>
                                        <td className="p-3">
                                            <div className="font-medium text-white">UPS Online Doble Conversión (3KVA)</div>
                                            <div className="text-xs">Inc. Supresor de picos industriales</div>
                                        </td>
                                        <td className="p-3 text-right font-mono text-white">$650</td>
                                        <td className="p-3 text-xs">Protege láseres y cámaras de variaciones de voltaje en patio.</td>
                                    </tr>

                                    {/* Obra Civil */}
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-bold text-gray-400">B. Obra Civil</td>
                                        <td className="p-3">
                                            <div className="font-medium text-white">Postería y Gabinetes NEMA 4X</div>
                                            <div className="text-xs">Arcos estructurales, bases de concreto, gabinetes IP66</div>
                                        </td>
                                        <td className="p-3 text-right font-mono text-white">$1,800</td>
                                        <td className="p-3 text-xs">Soporte rígido antivibración y protección contra lluvia/polvo.</td>
                                    </tr>

                                    {/* Limpieza */}
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-bold text-blue-400">C. Limpieza</td>
                                        <td className="p-3">
                                            <div className="font-medium text-white">Sistema Air Knives + Compresor</div>
                                            <div className="text-xs">Par de cortinas de aire de alta presión</div>
                                        </td>
                                        <td className="p-3 text-right font-mono text-white">$1,200</td>
                                        <td className="p-3 text-xs">Remueve lodo seco antes del escaneo. Indispensable para precisión &lt;1mm.</td>
                                    </tr>

                                    {/* Conectividad */}
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-bold text-purple-400">D. Red</td>
                                        <td className="p-3">
                                            <div className="font-medium text-white">Kit Starlink + Switch Industrial PoE</div>
                                            <div className="text-xs">Antena satelital V2 + Switch Gigabit reforzado</div>
                                        </td>
                                        <td className="p-3 text-right font-mono text-white">$900</td>
                                        <td className="p-3 text-xs">Conectividad autónoma para no depender de la red saturada de la oficina.</td>
                                    </tr>

                                    {/* Total */}
                                    <tr className="bg-slate-700/30 font-bold border-t-2 border-slate-600">
                                        <td className="p-4 text-white" colSpan={2}>TOTAL ESTIMADO INFRAESTRUCTURA</td>
                                        <td className="p-4 text-right text-green-400 text-lg">$4,550 USD</td>
                                        <td className="p-4 text-xs text-slate-400 font-normal">No incluye mano de obra de instalación</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section >
            </div>
        </div>
    );
};

export default TechnicalSpecs;
