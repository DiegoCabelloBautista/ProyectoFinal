import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, routinesApi, workoutsApi, adminApi, BASE_URL } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressChart from './ProgressChart';
import StatCard from './StatCard';
import StreakCard from './StreakCard';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [prs, setPRs] = useState<any[]>([]);
    const [routines, setRoutines] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [sessionFilterDays, setSessionFilterDays] = useState<number>(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsRes, prsRes, routinesRes, sessionsRes] = await Promise.all([
                analyticsApi.getStatsSummary(),
                analyticsApi.getPersonalRecords(),
                routinesApi.getAll(),
                workoutsApi.getSessions(sessionFilterDays),
            ]);
            setStats(statsRes.data);
            setPRs(prsRes.data.slice(0, 3));
            setRoutines(routinesRes.data);
            setSessions(sessionsRes.data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await workoutsApi.getSessions(sessionFilterDays);
                setSessions(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        if (!loading) fetchSessions();
    }, [sessionFilterDays]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-primary animate-spin" />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Cargando progreso...</p>
                </div>
            </div>
        );
    }

    const totalVolume = stats?.total_volume_kg || 0;
    const volumeDisplay = totalVolume > 1000
        ? { value: (totalVolume / 1000).toFixed(1), unit: 't' }
        : { value: String(Math.round(totalVolume)), unit: 'kg' };

    return (
        <div className="min-h-screen pb-28 text-slate-900 relative bg-white">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="orb w-80 h-80" style={{ background: '#10B981', top: '-8%', right: '-5%', opacity: 0.08 }} />
                <div className="orb w-64 h-64" style={{ background: '#3B82F6', bottom: '20%', left: '-8%', opacity: 0.05 }} />
            </div>

            <header className="relative z-10 px-4 sm:px-5 pt-8 sm:pt-12 pb-4 sm:pb-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            className="shrink-0"
                        >
                            <div
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm"
                                style={{
                                    background: user?.avatar_url ? 'none' : `${user?.username_color || '#10B981'}15`,
                                    border: `1px solid ${user?.username_color || '#10B981'}30`,
                                }}
                            >
                                {user?.avatar_url ? (
                                    <img 
                                        src={`${BASE_URL}${user.avatar_url}?t=${new Date().getTime()}`} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="material-icons-round text-lg sm:text-xl" style={{ color: user?.username_color || '#10B981' }}>
                                        {user?.avatar_icon || 'person'}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Hola de nuevo 👋</p>
                            <h1 className="text-lg sm:text-xl font-black tracking-tight truncate leading-none" style={{ color: user?.username_color || '#10B981' }}>
                                {user?.username || 'Atleta'}
                                {user?.is_verified && (
                                    <span className="material-icons-round text-blue-500 text-sm ml-1">verified</span>
                                )}
                            </h1>
                            <div className="flex gap-1.5 mt-2">
                                <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm">
                                    Nv. {user?.level || 1}
                                </span>
                                <span className="bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-100 shadow-sm">
                                    💰 {user?.coins || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-1.5 sm:gap-2 shrink-0">
                        <motion.button
                            whileTap={{ scale: 0.93 }}
                            onClick={logout}
                            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-red-50 hover:border-red-100 hover:text-red-500 text-slate-400 transition-all shadow-sm active:scale-95"
                            title="Cerrar sesión"
                        >
                            <span className="material-icons-round text-lg">logout</span>
                        </motion.button>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {user?.trainer_note && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl text-center overflow-hidden"
                        >
                            {/* Decoración de fondo */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50" />
                            
                            <div className="w-20 h-20 rounded-[2rem] bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-8 border border-orange-100 shadow-sm relative z-10">
                                <span className="material-icons-round text-4xl">notification_important</span>
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight relative z-10">Mensaje de tu Coach</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">Aviso importante</p>
                            
                            <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 relative z-10">
                                <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                                    "{user.trainer_note}"
                                </p>
                            </div>
                            
                            <button 
                                onClick={async () => {
                                    try {
                                        await adminApi.clearNudge();
                                        window.location.reload();
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                                className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 relative z-10"
                            >
                                Entendido, coach
                            </button>
                            
                            {user.trainer_note_date && (
                                <div className="flex items-center justify-center gap-2 mt-6 relative z-10">
                                    <span className="material-icons-round text-slate-300 text-xs">schedule</span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        Enviado el {new Date(user.trainer_note_date).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <main className="relative z-10 px-4 sm:px-5 space-y-4 sm:space-y-6">

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-2 sm:gap-3"
                >
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-[2rem] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                    <span className="material-icons-round text-sm">fitness_center</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50/50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    {stats?.recent_sessions || 0} Mes
                                </span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 leading-none">{stats?.total_sessions || 0}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Sesiones totales</p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-[2rem] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                    <span className="material-icons-round text-sm">scale</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50/50 px-2 py-0.5 rounded-full border border-blue-100">
                                    Histórico
                                </span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 leading-none">
                                {volumeDisplay.value}
                                <span className="text-xs font-bold text-slate-400 ml-1">{volumeDisplay.unit}</span>
                            </p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Volumen total</p>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Informes y Exportación
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={async () => {
                                try {
                                    const response = await analyticsApi.exportPdf();
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `GymTrackPro_Report_${user?.username}.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                } catch (e) {
                                    console.error('Error al exportar PDF', e);
                                }
                            }}
                            className="flex flex-col items-center justify-center gap-2 py-4 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all group active:scale-95 shadow-inner"
                        >
                            <span className="material-icons-round text-red-500 group-hover:scale-110 transition-transform">picture_as_pdf</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-600">Exportar PDF</span>
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    const response = await analyticsApi.exportCsv();
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `GymTrackPro_Data_${user?.username}.csv`);
                                    document.body.appendChild(link);
                                    link.click();
                                } catch (e) {
                                    console.error('Error al exportar CSV', e);
                                }
                            }}
                            className="flex flex-col items-center justify-center gap-2 py-4 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all group active:scale-95 shadow-inner"
                        >
                            <span className="material-icons-round text-emerald-500 group-hover:scale-110 transition-transform">description</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-600">Exportar CSV</span>
                        </button>
                    </div>
                </motion.section>

                <StreakCard
                    currentStreak={user?.current_streak ?? 0}
                    longestStreak={user?.longest_streak ?? 0}
                    lastWorkoutDate={user?.last_workout_date ?? null}
                />

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progreso General</h2>
                        <button
                            onClick={() => navigate('/analytics')}
                            className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95 shadow-sm"
                        >
                            Ver detalles →
                        </button>
                    </div>
                    <div className="glass-card p-3 sm:p-4 overflow-hidden">
                        <ProgressChart />
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="material-icons-round text-amber-500 text-lg">emoji_events</span>
                            Récords Personales
                        </h2>
                        <button
                            onClick={() => navigate('/analytics')}
                            className="text-[9px] font-black text-primary uppercase tracking-widest"
                        >
                            Ver todos →
                        </button>
                    </div>

                    {prs.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-center shadow-inner">
                            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white shadow-sm border border-slate-50">
                                <span className="material-icons-round text-2xl text-slate-300">emoji_events</span>
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sin récords todavía</p>
                            <p className="text-[10px] text-slate-400 mt-1">¡Sigue entrenando para superarte!</p>
                        </div>
                    ) : (
                        <div className="space-y-2 sm:space-y-3">
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

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="material-icons-round text-primary text-lg">history</span>
                            Historial Reciente
                        </h2>
                        <select 
                            value={sessionFilterDays} 
                            onChange={(e) => setSessionFilterDays(Number(e.target.value))}
                            className="bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest px-3 py-1.5 text-slate-500 focus:outline-none focus:border-primary/50 shadow-sm"
                        >
                            <option value={7}>Semana</option>
                            <option value={30}>Mes</option>
                            <option value={90}>3 Meses</option>
                            <option value={0}>Todo</option>
                        </select>
                    </div>

                    <div className="glass-card p-3 sm:p-4">
                        {sessions.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-slate-400 text-sm">No hay sesiones en este periodo.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {sessions.slice(0, 5).map(session => {
                                    const date = new Date(session.start_time);
                                    const routine = routines.find(r => r.id === session.routine_id);
                                    return (
                                        <div key={session.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                            <div className="min-w-0">
                                                <p className="font-black text-slate-900 text-xs truncate">{routine?.name || 'Rutina Libre'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{date.toLocaleDateString()} · {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                                                <span className="material-icons-round text-sm">check</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {sessions.length > 5 && (
                                    <button 
                                        onClick={() => navigate('/analytics')}
                                        className="w-full mt-2 text-[11px] sm:text-xs font-semibold text-primary hover:text-primary-light transition-colors"
                                    >
                                        Ver todas ({sessions.length})
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="pb-4"
                >
                    {routines.length > 0 ? (
                        <div className="relative rounded-[2.5rem] p-6 overflow-hidden bg-slate-900 shadow-xl shadow-slate-900/20">
                            <div className="absolute inset-0 opacity-10"
                                style={{ background: 'radial-gradient(circle at top right, white, transparent)' }} />
                            <div className="relative flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">
                                        Siguiente sesión
                                    </p>
                                    <h3 className="text-white font-black text-lg leading-tight truncate">
                                        {routines[0].name}
                                    </h3>
                                    <p className="text-slate-400 text-[10px] font-bold mt-1">¿Listo para entrenar hoy?</p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.93 }}
                                    onClick={() => navigate(`/workout/${routines[0].id}`)}
                                    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                    <span className="material-icons-round text-lg">play_arrow</span>
                                    Empezar
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 text-center shadow-inner">
                            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white shadow-sm border border-slate-50">
                                <span className="material-icons-round text-2xl text-slate-300">add_circle</span>
                            </div>
                            <h3 className="font-black text-slate-900 text-sm mb-1 uppercase tracking-tight">Crea tu primera rutina</h3>
                            <p className="text-[10px] text-slate-400 mb-6 font-bold uppercase tracking-widest">Diseña un plan a tu medida</p>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/routines/new')}
                                className="w-full py-4 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
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
