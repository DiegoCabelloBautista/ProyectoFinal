import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi, profileApi } from '../../services/api';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
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
    const [bodyMetrics, setBodyMetrics] = useState<any[]>([]);
    const [weightInput, setWeightInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const [volumeRes, weeklyRes, prsRes, statsRes, heatmapRes, metricsRes] = await Promise.all([
                analyticsApi.getVolume(30),
                analyticsApi.getWeeklyVolume(12),
                analyticsApi.getPersonalRecords(),
                analyticsApi.getStatsSummary(),
                analyticsApi.getHeatmap(90),
                profileApi.getBodyMetrics(),
            ]);

            setVolumeData(volumeRes.data);
            setWeeklyVolume(weeklyRes.data);
            setPRs(prsRes.data.slice(0, 5)); // Top 5 PRs
            setStats(statsRes.data);
            setHeatmap(heatmapRes.data);
            setBodyMetrics(metricsRes.data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWeight = async () => {
        if (!weightInput) return;
        try {
            await profileApi.addBodyMetric({ weight: weightInput });
            const res = await profileApi.getBodyMetrics();
            setBodyMetrics(res.data);
            setWeightInput('');
        } catch (error) {
            console.error('Error saving weight', error);
        }
    };

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

    const handleExportCsv = async () => {
        try {
            const res = await analyticsApi.exportCsv();
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'historial_gymtrack.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exportando CSV', error);
        }
    };

    const handleExportPdf = async () => {
        try {
            const res = await analyticsApi.exportPdf();
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `GymTrackPro_Report_${new Date().toLocaleDateString()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exportando PDF', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 pb-24 relative overflow-hidden">
            {/* Orbs de fondo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="orb w-96 h-96" style={{ background: '#10B981', top: '-10%', right: '-10%', opacity: 0.1 }} />
                <div className="orb w-80 h-80" style={{ background: '#3B82F6', bottom: '10%', left: '-5%', opacity: 0.08 }} />
            </div>

            {/* Header */}
            <header className="px-4 sm:px-6 pt-5 sm:pt-8 pb-3 sm:pb-4 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-30 border-b border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors shrink-0 flex items-center justify-center"
                    >
                        <span className="material-icons-round text-primary text-xl">arrow_back</span>
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-sm sm:text-xl font-black text-slate-900 tracking-tight uppercase truncate">Análisis</h1>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Rendimiento</p>
                    </div>
                </div>
                <div className="flex gap-1.5 sm:gap-2 shrink-0">
                    <button
                        onClick={handleExportPdf}
                        className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center gap-1 sm:gap-2 font-black text-[10px] uppercase tracking-wider hover:bg-red-100 transition-all shadow-sm active:scale-95"
                        title="Exportar PDF"
                    >
                        <span className="material-icons-round text-sm">picture_as_pdf</span>
                        <span className="hidden md:inline">PDF</span>
                    </button>
                    <button
                        onClick={handleExportCsv}
                        className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center gap-1 sm:gap-2 font-black text-[10px] uppercase tracking-wider hover:bg-emerald-100 transition-all shadow-sm active:scale-95"
                        title="Exportar CSV"
                    >
                        <span className="material-icons-round text-sm">description</span>
                        <span className="hidden md:inline">CSV</span>
                    </button>
                </div>
            </header>


            <main className="px-4 sm:px-6 space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                {/* Stats Summary Cards */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3 sm:gap-4"
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

                {/* Weight Tracking Chart */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <span className="material-icons-round text-pink-500">monitor_weight</span>
                            Evolución de Peso
                        </h2>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-6">
                        <div className="relative flex-1">
                            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">monitor_weight</span>
                            <input 
                                type="number" 
                                step="0.1"
                                value={weightInput}
                                onChange={(e) => setWeightInput(e.target.value)}
                                placeholder="Registra tu peso..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-primary/50 shadow-inner transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <button 
                            onClick={handleSaveWeight}
                            className="bg-primary text-white border border-primary/20 rounded-xl px-6 py-2.5 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] shrink-0"
                        >
                            Confirmar
                        </button>
                    </div>

                    {bodyMetrics.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={bodyMetrics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#94a3b8" 
                                    fontSize={10} 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontWeight: 600 }}
                                    tickFormatter={(tick) => new Date(tick).toLocaleDateString()} 
                                />
                                <YAxis 
                                    stroke="#94a3b8" 
                                    fontSize={10} 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontWeight: 600 }}
                                    domain={['dataMin - 2', 'dataMax + 2']} 
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="weight" 
                                    stroke="#F472B6" 
                                    strokeWidth={3} 
                                    dot={{ fill: '#F472B6', r: 4 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-4">Registra tu peso para ver la evolución.</p>
                    )}
                </motion.section>

                {/* Weekly Volume Chart */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <span className="material-icons-round text-primary">show_chart</span>
                            Volumen Semanal
                        </h2>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">12 semanas</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={weeklyVolume}>
                            <defs>
                                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="week"
                                stroke="#94a3b8"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontWeight: 600 }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontWeight: 600 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    fontSize: '12px'
                                }}
                                labelStyle={{ color: '#10B981', fontWeight: 700 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="volume"
                                stroke="#10B981"
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
                        className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-icons-round text-primary">pie_chart</span>
                                Volumen por Grupo
                            </h2>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">30 días</span>
                        </div>
                        <ResponsiveContainer width="100%" height={windowWidth < 640 ? 240 : 300}>
                            <PieChart>
                                <Pie
                                    data={volumeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={windowWidth < 640 ? 40 : 60}
                                    outerRadius={windowWidth < 640 ? 80 : 100}
                                    paddingAngle={5}
                                    dataKey="volume"
                                    nameKey="muscle_group"
                                >
                                    {volumeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        fontSize: '11px',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Legend 
                                    layout={windowWidth < 640 ? "horizontal" : "vertical"} 
                                    align={windowWidth < 640 ? "center" : "right"}
                                    verticalAlign={windowWidth < 640 ? "bottom" : "middle"}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{value}</span>}
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
                    className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <span className="material-icons-round text-yellow-500">emoji_events</span>
                            Récords Personales
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
                                    className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-black text-white shadow-md shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-black text-slate-900 text-sm sm:text-base truncate">{pr.exercise_name}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{pr.muscle_group}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <p className="text-lg sm:text-2xl font-black text-primary">{pr.estimated_1rm}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">kg</p>
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
                        className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-icons-round text-primary">calendar_month</span>
                                Frecuencia
                            </h2>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">90 días</span>
                        </div>
                        <div className="text-center text-sm text-slate-500 py-4 font-medium">
                            <p>📅 Has entrenado <span className="text-primary font-black">{heatmap.length}</span> días</p>
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
        <div className="bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className={`inline-flex p-1.5 sm:p-2 rounded-xl bg-gradient-to-br ${colorClasses[color]} mb-1.5 sm:mb-2 shadow-md shadow-emerald-500/10`}>
                <span className="material-icons-round text-white text-lg sm:text-xl">{icon}</span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{label}</p>
            <div className="flex items-baseline gap-1">
                <p className={`text-base sm:text-xl font-black text-slate-900 ${valueClass} truncate`}>{value}</p>
                {unit && <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">{unit}</span>}
            </div>
        </div>
    );
};

export default Analytics;
