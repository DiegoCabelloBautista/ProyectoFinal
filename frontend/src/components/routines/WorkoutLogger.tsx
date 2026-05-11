import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutsApi, routinesApi } from '../../services/api';
import { Check, Clock, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const WorkoutLogger: React.FC = () => {
    const { routineId } = useParams();
    const { refreshUser } = useAuth();
    const [routine, setRoutine] = useState<any>(null);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [sets, setSets] = useState<any[]>([]);
    const [timer, setTimer] = useState(0);
    const [restTimer, setRestTimer] = useState<number | null>(null);
    const [loadingSession, setLoadingSession] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        startWorkout();
        const interval = setInterval(() => {
            setTimer(t => t + 1);
            setRestTimer(r => (r !== null && r > 0 ? r - 1 : (r === 0 ? null : r)));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const startWorkout = async () => {
        try {
            setLoadingSession(true);
            setLoadError(null);

            console.log('[WorkoutLogger] routineId desde URL:', routineId);

            // getById devuelve la rutina CON sus ejercicios completos
            const routineRes = await routinesApi.getById(Number(routineId));
            const routineData = routineRes.data;

            console.log('[WorkoutLogger] Respuesta getById:', JSON.stringify(routineData));
            console.log('[WorkoutLogger] exercises recibidos:', routineData.exercises);

            // Normalizar: el endpoint devuelve 'exercise_name', el template espera 'name'
            const normalized = {
                ...routineData,
                exercises: (routineData.exercises ?? []).map((ex: any) => ({
                    ...ex,
                    name: ex.exercise_name ?? ex.name ?? 'Ejercicio',
                })),
            };

            console.log('[WorkoutLogger] exercises normalizados:', normalized.exercises);
            setRoutine(normalized);

            const res = await workoutsApi.startSession(Number(routineId));
            setSessionId(res.data.id);
            console.log('[WorkoutLogger] sessionId:', res.data.id);
        } catch (err: any) {
            console.error('[WorkoutLogger] ERROR:', err?.response?.status, err?.response?.data || err);
            setLoadError(`Error ${err?.response?.status ?? ''}: No se pudo cargar la rutina. Revisa la consola del navegador.`);
        } finally {
            setLoadingSession(false);
        }
    };

    const [isFinishing, setIsFinishing] = useState(false);

    const logSet = async (weight: number, reps: number) => {
        if (!sessionId || !routine) return;

        const exercise = routine.exercises?.[currentExerciseIndex];
        if (!exercise) return;

        try {
            await workoutsApi.logSet({
                session_id: sessionId,
                exercise_id: exercise.exercise_id ?? exercise.id,
                set_number: sets.length + 1,
                weight,
                reps
            });
            setSets([...sets, { weight, reps }]);
            setRestTimer(90); // Inicia descanso de 90 segundos por defecto
        } catch (err) {
            console.error('Error al registrar la serie:', err);
        }
    };

    const [summary, setSummary] = useState<any>(null);

    const finishWorkout = async () => {
        if (!sessionId || isFinishing) return;
        
        setIsFinishing(true);
        try {
            const res = await workoutsApi.finishSession(sessionId);
            setSummary(res.data);
            await refreshUser();
            // No navegamos inmediatamente para dejar ver el resumen
        } catch (err) {
            console.error('Error al finalizar el entrenamiento:', err);
            alert('No se pudo finalizar la sesión. Comprueba tu conexión.');
            setIsFinishing(false);
        }
    };

    if (summary) {
        return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center overflow-y-auto relative">
            {/* Orbs de fondo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                <div className="orb w-96 h-96 bg-primary -top-20 -right-20" />
                <div className="orb w-80 h-80 bg-blue-500 bottom-20 -left-20" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 max-w-sm w-full bg-white rounded-[2.5rem] p-8 text-center shadow-2xl border border-slate-100"
            >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <span className="material-icons-round text-primary text-4xl">emoji_events</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">¡Sesión Completada!</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Evoluciona tu mejor versión</p>
                
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">XP Ganada</p>
                        <p className="text-xl font-black text-primary">+{summary.xp_gained_total}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Racha</p>
                        <p className="text-xl font-black text-orange-500">{summary.current_streak} d</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Nivel</p>
                        <p className="text-xl font-black text-blue-500">{summary.level}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Monedas</p>
                        <p className="text-xl font-black text-yellow-500">{summary.coins}</p>
                    </div>
                </div>

                    {summary.new_achievements && summary.new_achievements.length > 0 && (
                        <div className="mb-8 space-y-3 text-left">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Logros Desbloqueados</p>
                            {summary.new_achievements.map((ach: any) => (
                                <div key={ach.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                                    <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-white shadow-md">
                                        <span className="material-icons-round text-lg">{ach.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{ach.name}</p>
                                        <p className="text-[10px] text-orange-500 font-bold uppercase">+{ach.coins_reward} monedas</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
                    >
                        Continuar
                    </button>
                </motion.div>
            </div>
        );
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loadError) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6 bg-white">
            <span className="material-icons-round text-red-500 text-5xl">error_outline</span>
            <p className="text-slate-600 font-black uppercase text-xs tracking-widest">{loadError}</p>
            <button onClick={() => navigate('/routines')} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm">
                Volver a Rutinas
            </button>
        </div>
    );

    if (loadingSession || !routine) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-primary animate-spin shadow-inner" />
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Preparando entrenamiento</p>
        </div>
    );

    const currentExercise = routine.exercises?.[currentExerciseIndex];
    const totalExercises = routine.exercises?.length ?? 0;
    const isLastExercise = currentExerciseIndex >= totalExercises - 1;
    const isCompleted = currentExerciseIndex >= totalExercises;

    if (routine.exercises?.length === 0 || isCompleted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6 bg-white relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="orb w-96 h-96 bg-primary -top-20 -right-20" />
                </div>
                <span className="material-icons-round text-primary text-6xl mb-2">
                    {routine.exercises?.length === 0 ? 'info' : 'verified'}
                </span>
                <p className="text-slate-900 font-black uppercase tracking-tight text-xl">
                    {routine.exercises?.length === 0
                        ? 'Rutina vacía'
                        : '¡Entrenamiento completado!'}
                </p>
                {isCompleted && (
                    <button
                        onClick={finishWorkout}
                        disabled={isFinishing}
                        className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-95 transition-all"
                    >
                        {isFinishing ? 'Guardando...' : '🏁 Finalizar Sesión'}
                    </button>
                )}
                <button onClick={() => navigate('/routines')} className="px-6 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    Cancelar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-40 bg-white text-slate-900 px-4 sm:px-6 pt-10 relative overflow-hidden">
            {/* Orbs sutiles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
                <div className="orb w-96 h-96 bg-primary -top-20 -right-20" />
                <div className="orb w-80 h-80 bg-blue-500 bottom-20 -left-20" />
            </div>

            <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase truncate">{routine.name}</h1>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{formatTime(timer)}</span>
                    </div>
                </div>
                <button
                    onClick={finishWorkout}
                    disabled={isFinishing}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-100 shadow-sm disabled:opacity-50 shrink-0"
                >
                    {isFinishing ? '...' : 'Finalizar'}
                </button>
            </div>

            <div className="relative z-10 bg-slate-50 border border-slate-100 rounded-[2rem] p-5 sm:p-7 shadow-sm mb-8">
                <div className="flex items-start justify-between mb-6">
                    <div className="min-w-0">
                        <span className="text-[9px] text-white uppercase font-black tracking-[0.2em] bg-primary px-3 py-1 rounded-full shadow-sm shadow-emerald-500/20">Actual</span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-3 truncate">{currentExercise?.name || 'Cargando...'}</h2>
                    </div>
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                        <Activity className="text-primary w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Peso (kg)</label>
                            <input type="number" step="0.5" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-2xl font-black text-slate-900 focus:outline-none focus:border-primary shadow-sm transition-all" defaultValue="0" id="weight" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reps</label>
                            <input type="number" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-2xl font-black text-slate-900 focus:outline-none focus:border-primary shadow-sm transition-all" defaultValue="0" id="reps" />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const w = Number((document.getElementById('weight') as HTMLInputElement).value);
                            const r = Number((document.getElementById('reps') as HTMLInputElement).value);
                            logSet(w, r);
                        }}
                        disabled={!sessionId}
                        className="w-full font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl transition-all disabled:opacity-40 bg-slate-900 text-white shadow-xl shadow-slate-900/10 active:scale-[0.98]"
                    >
                        {!sessionId ? 'Iniciando...' : 'Registrar Serie'}
                    </button>
                </div>
            </div>

            <div className="relative z-10 space-y-4 px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Series Registradas</h3>
                {sets.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sin series aún</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sets.map((set, i) => (
                            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-primary font-black text-xs border border-primary/20">{i + 1}</div>
                                    <span className="font-black text-slate-900">{set.weight} kg <span className="text-slate-400 mx-1">×</span> {set.reps}</span>
                                </div>
                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md shadow-emerald-500/20">
                                    <Check className="text-white w-4 h-4" strokeWidth={3} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex flex-col gap-4 z-50">
                {restTimer !== null && restTimer > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500 rounded-xl text-white animate-pulse shadow-lg shadow-emerald-500/20">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Descanso</p>
                                <p className="text-xl font-black text-white font-mono">{formatTime(restTimer)}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setRestTimer(r => (r || 0) + 30)} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center font-black text-[10px] text-white">
                                +30s
                            </button>
                            <button onClick={() => setRestTimer(null)} className="px-4 h-10 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                                Saltar
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex gap-3">
                    <button
                        className="flex-1 bg-slate-100 border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-30 active:scale-95 transition-all shadow-sm"
                        disabled={currentExerciseIndex === 0}
                        onClick={() => {
                            setCurrentExerciseIndex(idx => Math.max(0, idx - 1));
                            setSets([]);
                        }}
                    >
                        Anterior
                    </button>
                    <button
                        className={`flex-1 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg ${isLastExercise ? 'bg-slate-900 text-white shadow-slate-900/10' : 'bg-primary text-white shadow-emerald-500/20'}`}
                        onClick={() => {
                            setCurrentExerciseIndex(idx => idx + 1);
                            setSets([]);
                        }}
                    >
                        {isLastExercise ? '✓ Terminar' : <>Siguiente <ChevronRight className="w-4 h-4" /></>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkoutLogger;
