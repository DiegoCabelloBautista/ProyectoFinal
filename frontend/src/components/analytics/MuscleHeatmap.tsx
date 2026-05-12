import React from 'react';
import { motion } from 'framer-motion';

interface MuscleData {
    muscle_group: string;
    volume: number;
}

interface MuscleHeatmapProps {
    data: MuscleData[];
}

const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({ data }) => {
    const maxVolume = Math.max(...data.map(d => d.volume), 1);

    const RANKS = [
        { name: 'Novato', color: '#F1F5F9', min: 0, max: 0.2, text: 'text-slate-400' },
        { name: 'Intermedio', color: '#D1FAE5', min: 0.2, max: 0.5, text: 'text-emerald-300' },
        { name: 'Avanzado', color: '#6EE7B7', min: 0.5, max: 0.75, text: 'text-emerald-500' },
        { name: 'Élite', color: '#10B981', min: 0.75, max: 0.9, text: 'text-emerald-600' },
        { name: 'Maestro', color: '#059669', min: 0.9, max: 1.1, text: 'text-emerald-800' },
    ];

    const getRankInfo = (muscleName: string) => {
        const found = data.find(d => 
            d.muscle_group.toLowerCase() === muscleName.toLowerCase() ||
            (muscleName === 'Quads' && d.muscle_group === 'Piernas') ||
            (muscleName === 'Back' && d.muscle_group === 'Espalda') ||
            (muscleName === 'Chest' && d.muscle_group === 'Pecho') ||
            (muscleName === 'Abs' && d.muscle_group === 'Abdominales') ||
            (muscleName === 'Shoulders' && d.muscle_group === 'Hombros') ||
            (muscleName === 'Arms' && d.muscle_group === 'Brazos')
        );

        const intensity = found ? found.volume / maxVolume : 0;
        const rank = RANKS.find(r => intensity >= r.min && intensity <= r.max) || RANKS[0];
        
        return { color: rank.color, name: rank.name, intensity };
    };

    return (
        <div className="bg-slate-50/50 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-inner">
            <div className="flex flex-col sm:flex-row items-center justify-around gap-12 mb-10">
                {/* VISTA FRONTAL */}
                <div className="flex flex-col items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Vista Frontal</p>
                    <div className="relative group">
                        <svg width="140" height="280" viewBox="0 0 100 200" className="drop-shadow-xl transition-transform group-hover:scale-105 duration-500">
                            <circle cx="50" cy="15" r="10" fill="#E2E8F0" />
                            <path d="M25,35 Q15,35 15,45 L15,55 L30,55 Z" fill={getRankInfo('Shoulders').color} />
                            <path d="M75,35 Q85,35 85,45 L85,55 L70,55 Z" fill={getRankInfo('Shoulders').color} />
                            <path d="M30,35 L50,35 L50,60 L25,60 Q25,35 30,35" fill={getRankInfo('Chest').color} />
                            <path d="M70,35 L50,35 L50,60 L75,60 Q75,35 70,35" fill={getRankInfo('Chest').color} />
                            <rect x="35" y="65" width="30" height="40" rx="5" fill={getRankInfo('Abs').color} />
                            <path d="M10,55 L10,90 L20,90 L20,55 Z" fill={getRankInfo('Arms').color} />
                            <path d="M90,55 L90,90 L80,90 L80,55 Z" fill={getRankInfo('Arms').color} />
                            <path d="M10,95 L15,130 L22,130 L20,95 Z" fill="#E2E8F0" />
                            <path d="M90,95 L85,130 L78,130 L80,95 Z" fill="#E2E8F0" />
                            <path d="M28,110 L20,155 L45,155 L48,110 Z" fill={getRankInfo('Quads').color} />
                            <path d="M72,110 L80,155 L55,155 L52,110 Z" fill={getRankInfo('Quads').color} />
                            <path d="M22,160 L25,195 L40,195 L43,160 Z" fill={getRankInfo('Piernas').color} />
                            <path d="M78,160 L75,195 L60,195 L57,160 Z" fill={getRankInfo('Piernas').color} />
                        </svg>
                    </div>
                </div>

                {/* VISTA TRASERA */}
                <div className="flex flex-col items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Vista Trasera</p>
                    <div className="relative group">
                        <svg width="140" height="280" viewBox="0 0 100 200" className="drop-shadow-xl transition-transform group-hover:scale-105 duration-500">
                            <circle cx="50" cy="15" r="10" fill="#E2E8F0" />
                            <path d="M25,35 L75,35 L85,65 L15,65 Z" fill={getRankInfo('Back').color} />
                            <path d="M35,65 L65,65 L70,105 L30,105 Z" fill={getRankInfo('Back').color} />
                            <path d="M10,55 L10,90 L20,90 L20,55 Z" fill={getRankInfo('Arms').color} />
                            <path d="M90,55 L90,90 L80,90 L80,55 Z" fill={getRankInfo('Arms').color} />
                            <path d="M25,108 Q50,130 75,108 L80,125 Q50,145 20,125 Z" fill={getRankInfo('Piernas').color} />
                            <path d="M28,135 L20,175 L45,175 L48,135 Z" fill={getRankInfo('Piernas').color} />
                            <path d="M72,135 L80,175 L55,175 L52,135 Z" fill={getRankInfo('Piernas').color} />
                            <path d="M22,180 L25,200 L40,200 L43,180 Z" fill={getRankInfo('Piernas').color} />
                            <path d="M78,180 L75,200 L60,200 L57,180 Z" fill={getRankInfo('Piernas').color} />
                        </svg>
                    </div>
                </div>
            </div>

            {/* LEYENDA DE RANGOS */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-slate-200/60">
                {RANKS.map((rank) => (
                    <div key={rank.name} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: rank.color }} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">{rank.name}</span>
                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
                            {Math.round(rank.min * 100)}% - {Math.round(rank.max * 100)}%
                        </span>
                    </div>
                ))}
            </div>
            
            <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-6 italic">
                * El rango se basa en el volumen total comparado con tu grupo muscular más fuerte.
            </p>
        </div>
    );
};

export default MuscleHeatmap;
