import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../services/api';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const Analytics: React.FC = () => {
    const navigate = useNavigate();
    const [volumeData, setVolumeData] = useState<any[]>([]);
    const [weeklyVolume, setWeeklyVolume] = useState<any[]>([]);
    const [prs, setPRs] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [heatmap, setHeatmap] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const [volumeRes, weeklyRes, prsRes, statsRes, heatmapRes] = await Promise.all([
                analyticsApi.getVolume(30),
                analyticsApi.getWeeklyVolume(12),
                analyticsApi.getPersonalRecords(),
                analyticsApi.getStatsSummary(),
                analyticsApi.getHeatmap(90),
            ]);

            setVolumeData(volumeRes.data);
            setWeeklyVolume(weeklyRes.data);
            setPRs(prsRes.data.slice(0, 5)); // Top 5 PRs
            setStats(statsRes.data);
            setHeatmap(heatmapRes.data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#00C9FF', '#92FE9D', '#F093FB', '#FFD140', '#FF6B9D'];

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark text-slate-100 pb-24">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-background-dark/80 backdrop-blur-xl z-10 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <span className="material-icons-round text-primary">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Análisis de Datos</h1>
                        <p className="text-xs text-slate-400">Visualiza tu progreso</p>
                    </div>
                </div>
                <span className="material-icons-round text-primary text-3xl">insights</span>
            </header>

            <main className="px-6 space-y-6 mt-6">
                {/* Stats Summary Cards */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-4"
                >
                    <StatCard
                        icon="fitness_center"
                        label="Sesiones Totales"
                        value={stats?.total_sessions || 0}
                        color="primary"
                    />
                    <StatCard
                        icon="trending_up"
                        label="Últimos 30 días"
                        value={stats?.recent_sessions || 0}
                        color="green"
                    />
                    <StatCard
                        icon="scale"
                        label="Volumen Total"
                        value={`${(stats?.total_volume_kg || 0).toLocaleString()}`}
                        unit="kg"
                        color="blue"
                    />
                    <StatCard
                        icon="favorite"
                        label="Ejercicio Favorito"
                        value={stats?.favorite_exercise || 'N/A'}
                        valueClass="text-xs"
                        color="pink"
                    />
                </motion.section>

                {/* Weekly Volume Chart */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-icons-round text-primary">show_chart</span>
                            Volumen Semanal
                        </h2>
                        <span className="text-xs text-slate-400">Últimas 12 semanas</span>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={weeklyVolume}>
                            <defs>
                                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00C9FF" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#00C9FF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis
                                dataKey="week"
                                stroke="#94a3b8"
                                fontSize={12}
                                tick={{ fill: '#94a3b8' }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tick={{ fill: '#94a3b8' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    padding: '12px'
                                }}
                                labelStyle={{ color: '#00C9FF' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="volume"
                                stroke="#00C9FF"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorVolume)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.section>

                {/* Volume by Muscle Group */}
                {volumeData.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <span className="material-icons-round text-primary">pie_chart</span>
                                Volumen por Grupo Muscular
                            </h2>
                            <span className="text-xs text-slate-400">Últimos 30 días</span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={volumeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => entry.muscle_group}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="volume"
                                >
                                    {volumeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.section>
                )}

                {/* Personal Records */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-icons-round text-yellow-400">emoji_events</span>
                            Récords Personales (1RM)
                        </h2>
                    </div>

                    {prs.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">
                            No tienes registros aún. ¡Empieza a entrenar!
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {prs.map((pr, index) => (
                                <motion.div
                                    key={pr.exercise_id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-background-dark">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{pr.exercise_name}</h3>
                                            <p className="text-xs text-slate-400">{pr.muscle_group}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">{pr.estimated_1rm}</p>
                                        <p className="text-xs text-slate-400">kg</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.section>

                {/* Training Heatmap */}
                {heatmap.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <span className="material-icons-round text-primary">calendar_month</span>
                                Frecuencia de Entrenamiento
                            </h2>
                            <span className="text-xs text-slate-400">Últimos 90 días</span>
                        </div>
                        <div className="text-center text-sm text-slate-400 py-4">
                            <p>📅 Has entrenado <span className="text-primary font-bold">{heatmap.length}</span> días</p>
                        </div>
                    </motion.section>
                )}
            </main>
        </div>
    );
};

const StatCard = ({ icon, label, value, unit, color = 'primary', valueClass = '' }: any) => {
    const colorClasses: any = {
        primary: 'from-cyan-500 to-blue-500',
        green: 'from-green-400 to-emerald-500',
        blue: 'from-blue-400 to-indigo-500',
        pink: 'from-pink-400 to-rose-500',
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
            <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${colorClasses[color]} mb-2`}>
                <span className="material-icons-round text-white text-xl">{icon}</span>
            </div>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
                <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
                {unit && <span className="text-xs text-slate-400">{unit}</span>}
            </div>
        </div>
    );
};

export default Analytics;
