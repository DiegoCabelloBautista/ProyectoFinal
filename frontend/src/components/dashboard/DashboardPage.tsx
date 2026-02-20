import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, routinesApi } from '../../services/api';
import { motion } from 'framer-motion';
import ProgressChart from './ProgressChart';
import StatCard from './StatCard';
import StreakCard from './StreakCard';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [prs, setPRs] = useState<any[]>([]);
    const [routines, setRoutines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsRes, prsRes, routinesRes] = await Promise.all([
                analyticsApi.getStatsSummary(),
                analyticsApi.getPersonalRecords(),
                routinesApi.getAll(),
            ]);
            setStats(statsRes.data);
            setPRs(prsRes.data.slice(0, 3));
            setRoutines(routinesRes.data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0D14' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8B5CF6' }} />
                    <p className="text-slate-600 text-sm font-medium">Cargando tu progreso...</p>
                </div>
            </div>
        );
    }

    const totalVolume = stats?.total_volume_kg || 0;
    const volumeDisplay = totalVolume > 1000
        ? { value: (totalVolume / 1000).toFixed(1), unit: 't' }
        : { value: String(Math.round(totalVolume)), unit: 'kg' };

    return (
        <div className="min-h-screen pb-28 text-slate-100 relative" style={{ background: '#0A0D14' }}>
            {/* Background gradient */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="orb w-80 h-80" style={{ background: '#8B5CF6', top: '-8%', right: '-5%', opacity: 0.08 }} />
                <div className="orb w-64 h-64" style={{ background: '#F472B6', bottom: '20%', left: '-8%', opacity: 0.06 }} />
            </div>

            {/* Header */}
            <header className="relative z-10 px-5 pt-12 pb-5">
                <div className="flex items-center justify-between">
                    {/* User info */}
                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        >
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center"
                                style={{
                                    background: `linear-gradient(135deg, ${user?.username_color || '#8B5CF6'}, #F472B6)`,
                                    boxShadow: `0 4px 16px ${user?.username_color || '#8B5CF6'}40`,
                                }}
                            >
                                <span className="material-icons-round text-white text-xl">
                                    {user?.avatar_icon || 'person'}
                                </span>
                            </div>
                        </motion.div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Hola de nuevo 👋</p>
                            <h1 className="text-lg font-bold tracking-tight" style={{ color: user?.username_color || '#A78BFA' }}>
                                {user?.username || 'Atleta'}
                                {user?.is_verified && (
                                    <span className="material-icons-round text-blue-400 text-sm ml-1">verified</span>
                                )}
                            </h1>
                            <div className="flex gap-1.5 mt-1">
                                <span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
                                    Nv. {user?.level || 1}
                                </span>
                                <span className="badge" style={{ background: 'rgba(234,179,8,0.12)', color: '#EAB308' }}>
                                    💰 {user?.coins || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <motion.button
                            whileTap={{ scale: 0.93 }}
                            onClick={logout}
                            className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                            title="Cerrar sesión"
                        >
                            <span className="material-icons-round text-red-500 text-lg">logout</span>
                        </motion.button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 px-5 space-y-6">

                {/* ── Stat cards ── */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3"
                >
                    {/* Sessions */}
                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(139,92,246,0.15)' }}>
                                <span className="material-icons-round text-sm" style={{ color: '#A78BFA' }}>fitness_center</span>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA' }}>
                                {stats?.recent_sessions || 0} este mes
                            </span>
                        </div>
                        <p className="text-3xl font-black text-white">{stats?.total_sessions || 0}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Sesiones totales</p>
                    </div>

                    {/* Volume */}
                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(244,114,182,0.15)' }}>
                                <span className="material-icons-round text-sm" style={{ color: '#F472B6' }}>scale</span>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(244,114,182,0.1)', color: '#F472B6' }}>
                                Histórico
                            </span>
                        </div>
                        <p className="text-3xl font-black text-white">
                            {volumeDisplay.value}
                            <span className="text-sm font-semibold text-slate-400 ml-1">{volumeDisplay.unit}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Volumen total</p>
                    </div>
                </motion.section>

                {/* ── Streak card ── */}
                <StreakCard
                    currentStreak={user?.current_streak ?? 0}
                    longestStreak={user?.longest_streak ?? 0}
                    lastWorkoutDate={user?.last_workout_date ?? null}
                />

                {/* ── Progress chart ── */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-white">Progreso General</h2>
                        <button
                            onClick={() => navigate('/analytics')}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                            style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA' }}
                        >
                            Ver detalles →
                        </button>
                    </div>
                    <div className="glass-card p-4 overflow-hidden">
                        <ProgressChart />
                    </div>
                </motion.section>

                {/* ── Personal Records ── */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                            <span className="material-icons-round text-yellow-400 text-lg">emoji_events</span>
                            Récords Personales
                        </h2>
                        <button
                            onClick={() => navigate('/analytics')}
                            className="text-xs font-semibold"
                            style={{ color: '#A78BFA' }}
                        >
                            Ver todos →
                        </button>
                    </div>

                    {prs.length === 0 ? (
                        <div className="glass-card p-8 text-center">
                            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                                style={{ background: 'rgba(139,92,246,0.1)' }}>
                                <span className="material-icons-round text-2xl" style={{ color: '#A78BFA' }}>emoji_events</span>
                            </div>
                            <p className="text-slate-400 font-medium text-sm">Sin récords todavía</p>
                            <p className="text-xs text-slate-600 mt-1">Empieza a entrenar para ver tus PRs</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {prs.map((pr, index) => (
                                <motion.div
                                    key={pr.exercise_id}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.06 }}
                                >
                                    <StatCard
                                        title={pr.exercise_name}
                                        value={pr.estimated_1rm}
                                        unit="kg"
                                        trend="1RM estimado"
                                        last={`${pr.weight}kg × ${pr.reps} reps`}
                                        icon="trending_up"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.section>

                {/* ── Quick start ── */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="pb-4"
                >
                    {routines.length > 0 ? (
                        <div className="relative rounded-2xl p-5 overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)',
                                boxShadow: '0 8px 32px rgba(139,92,246,0.35)',
                            }}>
                            {/* shiny overlay */}
                            <div className="absolute inset-0 opacity-20"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider mb-1">
                                        Siguiente sesión
                                    </p>
                                    <h3 className="text-white font-bold text-lg leading-tight">
                                        {routines[0].name}
                                    </h3>
                                    <p className="text-violet-300 text-xs mt-1">¿Listo para entrenar hoy?</p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.93 }}
                                    onClick={() => navigate(`/workout/${routines[0].id}`)}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm"
                                    style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                                >
                                    <span className="material-icons-round text-lg">play_arrow</span>
                                    Empezar
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-6 text-center">
                            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <span className="material-icons-round text-2xl" style={{ color: '#A78BFA' }}>add_circle</span>
                            </div>
                            <h3 className="font-bold text-white mb-1">Crea tu primera rutina</h3>
                            <p className="text-sm text-slate-500 mb-4">Diseña un plan de entrenamiento personalizado</p>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/routines/new')}
                                className="btn-primary px-6 py-2.5 text-sm"
                            >
                                Crear Rutina
                            </motion.button>
                        </div>
                    )}
                </motion.section>
            </main>
        </div>
    );
};

export default Dashboard;
