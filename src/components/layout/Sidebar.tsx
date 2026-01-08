
import React from 'react';
import {
    BarChart3,
    Camera,
    ShieldAlert,
    Truck,
    Activity,
    Map as MapIcon,
    PhoneCall,
    History,
    Menu,
    X,
    Sparkles,
    Search,
    Search,
    LayoutDashboard,
    Image,
    Images
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
    businessName: string;
    brandColor: string;
    isOpen: boolean;
    onToggle: () => void;
    userRole: string;
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    category?: 'CORE' | 'INVENTORY' | 'LOGISTICS' | 'EMERGENCY';
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeView,
    onNavigate,
    businessName,
    brandColor,
    isOpen,
    onToggle,
    userRole
}) => {
    const { t } = useLanguage();

    const navItems: NavItem[] = [
        { id: 'dashboard', label: t('sidebar.dashboard'), icon: <LayoutDashboard size={20} />, category: 'CORE' },
        { id: 'command-center', label: 'Command Center', icon: <BarChart3 size={20} />, badge: 'LIVE', category: 'CORE' },
        { id: 'gallery', label: 'Evidencia Forense', icon: <Images size={20} />, category: 'CORE' },
        { id: 'capture-tires', label: t('sidebar.capture_tires'), icon: <Camera size={20} />, badge: 'IA+', category: 'CORE' },
        { id: 'driver-health', label: t('sidebar.driver_health'), icon: <Activity size={20} />, badge: 'ALCOHOL', category: 'CORE' },

        { id: 'unit-inventory', label: t('sidebar.unit_inventory'), icon: <Truck size={20} />, category: 'INVENTORY' },
        { id: 'tire-inventory', label: t('sidebar.tire_inventory'), icon: <History size={20} />, category: 'INVENTORY' },

        { id: 'map', label: t('sidebar.map'), icon: <MapIcon size={20} />, category: 'LOGISTICS' },
        { id: 'simulation', label: 'Modo Simulación', icon: <Sparkles size={20} />, badge: 'DEMO', category: 'LOGISTICS' },

        { id: 'emergency', label: t('sidebar.emergency'), icon: <PhoneCall size={20} />, category: 'EMERGENCY' },
    ];

    // Role-based filtering
    const visibleItems = navItems.filter(item => {
        if (userRole === 'MASTER' || userRole === 'DEVELOPER') return true;
        if (userRole === 'MANAGER') return true;
        if (userRole === 'EMPLOYEE') {
            // Employee sees Dashboard, Capture, Emergency. 
            // Also enable read-only view of Inventory and Map as requested.
            return ['dashboard', 'capture-tires', 'capture-cabin', 'driver-health', 'emergency', 'unit-inventory', 'tire-inventory', 'map', 'command-center', 'simulation'].includes(item.id);
        }
        return false;
    });

    const getContrastColor = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    };

    const textColor = getContrastColor(brandColor);

    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case 'CORE': return t('sidebar.category_core');
            case 'INVENTORY': return t('sidebar.category_inventory');
            case 'LOGISTICS': return t('sidebar.category_logistics');
            case 'EMERGENCY': return t('sidebar.category_support');
            default: return cat;
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50
          w-72 h-screen bg-[#0A0A0B] border-r border-white/5
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
            >
                {/* Header - Brand Identity */}
                <div
                    className="p-8 relative overflow-hidden group"
                    style={{ backgroundColor: brandColor }}
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] -z-0 group-hover:scale-110 transition-transform" />

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                <span className="font-black text-xl" style={{ color: textColor }}>S</span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="font-black text-lg tracking-tighter leading-none" style={{ color: textColor }}>
                                    IA VISION <span className="opacity-60">PRO</span>
                                </h1>
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-80" style={{ color: textColor }}>
                                    {businessName || 'Control Tower'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onToggle} className="lg:hidden" style={{ color: textColor }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Navigation Content */}
                <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-4 scrollbar-hide">

                    {/* Nav Categories */}
                    {['CORE', 'INVENTORY', 'LOGISTICS', 'EMERGENCY'].map(cat => (
                        <div key={cat} className="space-y-2">
                            <h3 className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">
                                {getCategoryLabel(cat)}
                            </h3>

                            <div className="space-y-1">
                                {visibleItems.filter(item => item.category === cat).map(item => {
                                    const isActive = activeView === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                onNavigate(item.id);
                                                if (window.innerWidth < 1024) onToggle();
                                            }}
                                            className={`
                        w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl
                        text-left transition-all duration-200 group
                        ${isActive
                                                    ? 'bg-zinc-900 border border-white/10 shadow-2xl'
                                                    : 'hover:bg-white/[0.03] text-zinc-500 hover:text-white'
                                                }
                      `}
                                        >
                                            <div
                                                className={`transition-colors duration-200 ${isActive ? '' : 'group-hover:text-white'}`}
                                                style={isActive ? { color: brandColor } : {}}
                                            >
                                                {item.icon}
                                            </div>
                                            <span className={`flex-1 text-sm font-bold tracking-tight ${isActive ? 'text-white' : ''}`}>
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <span
                                                    className="px-2 py-0.5 text-[8px] font-black rounded-lg uppercase tracking-widest shadow-lg"
                                                    style={{ backgroundColor: brandColor, color: textColor }}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                </nav>


                <div className="px-6 py-8 border-t border-white/10 mt-auto">
                    <a
                        href="https://www.ia-agus.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center group/brand"
                    >
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover/brand:text-zinc-400 transition-colors">
                            Designed by
                        </span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest group-hover/brand:scale-105 transition-all">
                            IA.AGUS
                        </span>
                    </a>
                </div>
            </aside>

            {/* Mobile Fab Menu Button */}
            <button
                onClick={onToggle}
                className="
          fixed bottom-6 right-6 z-40 lg:hidden
          w-16 h-16 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]
          flex items-center justify-center transition-transform active:scale-95
        "
                style={{ backgroundColor: brandColor }}
            >
                <Menu size={28} style={{ color: textColor }} />
            </button>
        </>
    );
};
