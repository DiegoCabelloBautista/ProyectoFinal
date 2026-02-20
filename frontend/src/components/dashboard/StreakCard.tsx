import React from 'react';
import { motion } from 'framer-motion';

interface StreakCardProps {
    currentStreak: number;
    longestStreak: number;
    lastWorkoutDate: string | null;
}

/** Devuelve el emoji de fuego según la racha */
const flameEmoji = (streak: number): string => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 3) return '🔥';
    return '❄️';
};

/** Devuelve un mensaje motivacional según la racha */
const streakMessage = (streak: number, trainedToday: boolean): string => {
    if (!trainedToday && streak > 0)
        return '¡No rompas la racha, entrena hoy!';
    if (streak === 0) return 'Empieza tu racha hoy 💪';
    if (streak === 1) return '¡Primer día! Vuelve mañana.';
    if (streak < 7) return `¡${streak} días seguidos! Vas bien.`;
    if (streak < 14) return '¡Una semana entera! Imparable.';
    if (streak < 30) return '¡Dos semanas! Esto ya es hábito.';
    return '¡Leyenda viva del gym! 🏆';
};

const StreakCard: React.FC<StreakCardProps> = ({ currentStreak, longestStreak, lastWorkoutDate }) => {
    const today = new Date().toISOString().split('T')[0];
    const trainedToday = lastWorkoutDate === today;

    // Porcentaje de la racha actual vs la mejor racha (para la barra de progreso)
    const progress = longestStreak > 0
        ? Math.min((currentStreak / longestStreak) * 100, 100)
        : 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-4 relative overflow-hidden"
        >
            {/* Glow de fondo cuando hay racha activa */}
            {currentStreak >= 3 && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at top right, rgba(251,146,60,0.08) 0%, transparent 70%)',
                    }}
                />
            )}

            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span className="material-icons-round text-orange-400 text-base">local_fire_department</span>
                        Racha de Entrenamiento
                    </h2>
                    {/* Badge "Entrenado hoy" */}
                    <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={
                            trainedToday
                                ? { background: 'rgba(34,197,94,0.15)', color: '#4ADE80' }
                                : { background: 'rgba(100,116,139,0.15)', color: '#94A3B8' }
                        }
                    >
                        {trainedToday ? '✓ Hoy completado' : 'Pendiente hoy'}
                    </span>
                </div>

                {/* Números principales */}
                <div className="flex items-end gap-5 mb-4">
                    <div>
                        <p className="text-5xl font-black leading-none" style={{ color: currentStreak >= 3 ? '#FB923C' : '#94A3B8' }}>
                            {currentStreak}
                            <span className="text-2xl ml-1">{flameEmoji(currentStreak)}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">días consecutivos</p>
                    </div>
                    <div className="mb-1">
                        <p className="text-xl font-bold text-slate-300">{longestStreak}</p>
                        <p className="text-xs text-slate-600 font-medium">mejor racha</p>
                    </div>
                </div>

                {/* Barra de progreso hacia el récord */}
                {longestStreak > 0 && (
                    <div className="mb-3">
                        <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                            <span>Progreso hacia tu récord ({longestStreak} días)</span>
                            <span className="font-semibold" style={{ color: '#FB923C' }}>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                                className="h-full rounded-full"
                                style={{
                                    background: currentStreak >= longestStreak
                                        ? 'linear-gradient(90deg, #FB923C, #FBBF24)'
                                        : 'linear-gradient(90deg, #FB923C80, #FB923C)',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Mensaje motivacional */}
                <p className="text-xs text-slate-500 font-medium">
                    {streakMessage(currentStreak, trainedToday)}
                </p>
            </div>
        </motion.div>
    );
};

export default StreakCard;
