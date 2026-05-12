import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutsApi, routinesApi } from '../../services/api';
import { Check, Clock, ChevronRight, Activity, Plus, Minus } from 'lucide-react';
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

    // Inputs controlados para peso y reps
    const [weightInput, setWeightInput] = useState('0');
    const [repsInput, setRepsInput] = useState('0');
    const bellRef = React.useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Usar archivo local para evitar problemas de bloqueo de URLs externas
        bellRef.current = new Audio('/sounds/bell.mp3');
        bellRef.current.volume = 1.0;
        bellRef.current.load();
    }, []);

    // Recuperar series del ejercicio actual al cambiar de índice
    useEffect(() => {
        if (sessionId && routine && routine.exercises[currentExerciseIndex]) {
            const fetchSets = async () => {
                try {
                    const res = await workoutsApi.getSessionDetail(sessionId);
                    const currentEx = routine.exercises[currentExerciseIndex];
                    const exId = currentEx.exercise_id ?? currentEx.id;
                    const exData = res.data.exercises.find((e: any) => e.exercise_id === exId);
                    if (exData) {
                        setSets(exData.sets.map((s: any) => ({ weight: s.weight, reps: s.reps })));
                    } else {
                        setSets([]);
                    }
                } catch (err) {
                    console.error("Error al recuperar series:", err);
                }
            };
            fetchSets();
        }
    }, [currentExerciseIndex, sessionId, routine]);

    useEffect(() => {
        startWorkout();
        const interval = setInterval(() => {
            setTimer(t => t + 1);
            setRestTimer(r => {
                if (r === 1) {
                    // Lógica de doble toque "ring-ring"
                    const playBell = () => {
                        if (bellRef.current) {
                            bellRef.current.currentTime = 0;
                            bellRef.current.play().catch(() => {});
                        }
                    };
                    
                    playBell();
                    setTimeout(playBell, 300); // Segundo toque a los 300ms
                }
                return (r !== null && r > 0 ? r - 1 : (r === 0 ? null : r));
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const startWorkout = async () => {
        try {
            setLoadingSession(true);
            setLoadError(null);
            const routineRes = await routinesApi.getById(Number(routineId));
            const routineData = routineRes.data;

            const normalized = {
                ...routineData,
                exercises: (routineData.exercises ?? []).map((ex: any) => ({
                    ...ex,
                    name: ex.exercise_name ?? ex.name ?? 'Ejercicio',
                })),
            };
            setRoutine(normalized);

            const res = await workoutsApi.startSession(Number(routineId));
            setSessionId(res.data.id);
        } catch (err: any) {
            setLoadError(`Error: No se pudo cargar la rutina.`);
        } finally {
            setLoadingSession(false);
        }
    };

    const [isFinishing, setIsFinishing] = useState(false);

    const logSet = async () => {
        if (!sessionId || !routine) return;

        const exercise = routine.exercises?.[currentExerciseIndex];
        if (!exercise) return;

        const weight = Number(weightInput);
        const reps = Number(repsInput);

        try {
            await workoutsApi.logSet({
                session_id: sessionId,
                exercise_id: exercise.exercise_id ?? exercise.id,
                set_number: sets.length + 1,
                weight,
                reps
            });
            setSets([...sets, { weight, reps }]);
            setRestTimer(90); // Descanso por defecto
            
            // RESET DE INPUTS a 0 tras registrar
            setWeightInput('0');
            setRepsInput('0');
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
        } catch (err) {
            setIsFinishing(false);
        }
    };

    if (summary) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center overflow-y-auto relative">
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

    return (
        <div className="min-h-screen pb-40 bg-white text-slate-900 px-4 sm:px-6 pt-10 relative overflow-hidden">
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
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-3 truncate">{currentExercise?.name || 'Ejercicio'}</h2>
                    </div>
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                        <Activity className="text-primary w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Peso (kg)</label>
                            <input 
                                type="number" 
                                step="0.5" 
                                value={weightInput}
                                onChange={(e) => setWeightInput(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-2xl font-black text-slate-900 focus:outline-none focus:border-primary shadow-sm transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reps</label>
                            <input 
                                type="number" 
                                value={repsInput}
                                onChange={(e) => setRepsInput(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-2xl font-black text-slate-900 focus:outline-none focus:border-primary shadow-sm transition-all" 
                            />
                        </div>
                    </div>
                    <button
                        onClick={logSet}
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
                            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
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
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 sm:p-4 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="p-2 bg-emerald-500 rounded-xl text-white animate-pulse shrink-0">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest truncate">Descanso</p>
                                <p className="text-base sm:text-xl font-black text-white font-mono leading-none">{formatTime(restTimer)}</p>
                            </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2 shrink-0 ml-1">
                            <button onClick={() => setRestTimer(r => Math.max(0, (r || 0) - 10))} className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-700 active:scale-95">
                                <Minus className="w-4 h-4 text-white" />
                            </button>
                            <button onClick={() => setRestTimer(r => (r || 0) + 10)} className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-700 active:scale-95">
                                <Plus className="w-4 h-4 text-white" />
                            </button>
                            <button onClick={() => setRestTimer(null)} className="px-2.5 h-9 rounded-xl bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all">
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
                            setWeightInput('0');
                            setRepsInput('0');
                        }}
                    >
                        Anterior
                    </button>
                    <button
                        className={`flex-1 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg ${isLastExercise ? 'bg-slate-900 text-white shadow-slate-900/10' : 'bg-primary text-white shadow-emerald-500/20'}`}
                        onClick={() => {
                            if (isLastExercise) finishWorkout();
                            else {
                                setCurrentExerciseIndex(idx => idx + 1);
                                setWeightInput('0');
                                setRepsInput('0');
                            }
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
