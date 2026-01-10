import React, { useState } from 'react';
import { Upload, X, AlertTriangle } from 'lucide-react';
import { dbService } from '../../services/db/dbService';

interface TireDisposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    tire: {
        id: string;
        unit_id: string;
        position: string;
        brand: string;
        model: string;
        depth_mm: number;
        serial_number?: string;
    };
    onSuccess: () => void;
}

type DisposalReason = 'PUNCTURE' | 'WEAR' | 'DAMAGE' | 'THEFT';

export const TireDisposalModal: React.FC<TireDisposalModalProps> = ({
    isOpen,
    onClose,
    tire,
    onSuccess
}) => {
    const [reason, setReason] = useState<DisposalReason>('PUNCTURE');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!photo) {
            alert('Por favor sube una foto de la llanta dañada');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create disposal request with base64 photo
            await dbService.createTireDisposal({
                unit_id: tire.unit_id,
                tire_position: tire.position,
                tire_metadata: {
                    brand: tire.brand,
                    model: tire.model,
                    depth_mm: tire.depth_mm,
                    serial_number: tire.serial_number || null
                },
                reason,
                photo_url: photoPreview, // Use base64 directly
                comments: comments || '',
                disposed_by: 'current_user' // TODO: Get from auth context
            });

            alert('Solicitud de baja enviada al supervisor');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating disposal:', error);
            alert(`Error al crear solicitud de baja: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const reasonLabels: Record<DisposalReason, string> = {
        PUNCTURE: 'Ponchadura',
        WEAR: 'Desgaste excesivo',
        DAMAGE: 'Daño estructural',
        THEFT: 'Robo'
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1C1E] rounded-2xl max-w-md w-full border border-white/10 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-500" size={24} />
                        <h2 className="text-xl font-bold text-white">Dar de Baja Llanta</h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Tire Info */}
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <p className="text-sm text-zinc-400">Llanta: <span className="text-white font-semibold">{tire.position}</span></p>
                        <p className="text-sm text-zinc-400">Marca/Modelo: <span className="text-white">{tire.brand} {tire.model}</span></p>
                        <p className="text-sm text-zinc-400">Unidad: <span className="text-white">{tire.unit_id}</span></p>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-semibold text-white mb-3">
                            Razón de Baja <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            {(Object.keys(reasonLabels) as DisposalReason[]).map((r) => (
                                <label key={r} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r}
                                        checked={reason === r}
                                        onChange={(e) => setReason(e.target.value as DisposalReason)}
                                        className="w-4 h-4 text-red-500"
                                    />
                                    <span className="text-sm text-zinc-300">{reasonLabels[r]}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-white mb-3">
                            Foto de Evidencia <span className="text-red-500">*</span>
                        </label>
                        {photoPreview ? (
                            <div className="relative">
                                <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                                <button
                                    onClick={() => { setPhoto(null); setPhotoPreview(''); }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-red-500/50 transition-colors">
                                <Upload className="text-zinc-400 mb-2" size={32} />
                                <span className="text-sm text-zinc-400">Click para subir foto</span>
                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                            </label>
                        )}
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="block text-sm font-semibold text-white mb-3">
                            Comentarios Adicionales
                        </label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Detalles adicionales sobre el daño..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm resize-none focus:outline-none focus:border-red-500/50"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Footer - Fixed at bottom */}
                <div className="flex gap-3 p-6 border-t border-white/10 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-zinc-800 text-white rounded-xl font-semibold hover:bg-zinc-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !photo}
                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar a Supervisor'}
                    </button>
                </div>
            </div>
        </div>
    );
};
