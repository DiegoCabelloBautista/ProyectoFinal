import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routinesApi, exercisesApi } from '../../services/api';
import { Plus, Minus, Search, Check } from 'lucide-react';

const RoutineBuilder: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
    const [allExercises, setAllExercises] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        setError(null);
        try {
            await (routinesApi.generate as any)(aiPrompt);
            navigate('/routines');
        } catch (err: any) {
            console.error(err);
            const serverMsg = err.response?.data?.msg || "Error de conexión con el servidor";
            setError(`Fallo de IA: ${serverMsg}`);
            setShowAiModal(false);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        try {
            const res = await exercisesApi.getAll();
            setAllExercises(res.data);
        } catch (err) {
            console.error('Error al cargar ejercicios:', err);
        }
    };

    const addExercise = (exercise: any) => {
        setSelectedExercises([...selectedExercises, { ...exercise, sets: 3, reps_target: '8-12' }]);
    };

    const removeExercise = (index: number) => {
        const fresh = [...selectedExercises];
        fresh.splice(index, 1);
        setSelectedExercises(fresh);
    };

    const handleCreate = async () => {
        setError(null);
        if (!name) {
            setError('Por favor, introduce un nombre para la rutina');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (selectedExercises.length === 0) {
            setError('Por favor, añade al menos un ejercicio');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        try {
            await routinesApi.create({
                name,
                description,
                exercises: selectedExercises.map(ex => ({
                    exercise_id: ex.id,
                    sets: ex.sets,
                    reps_target: ex.reps_target
                }))
            });
            navigate('/routines');
        } catch (err) {
            console.error('Error al crear la rutina:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredExercises = allExercises.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        (ex.muscle_group && ex.muscle_group.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="min-h-screen pb-32 bg-white text-slate-900 px-4 sm:px-6 pt-10 relative overflow-hidden">
            {/* Orbs de fondo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
                <div className="orb w-96 h-96 bg-primary -top-20 -right-20" />
                <div className="orb w-80 h-80 bg-blue-500 bottom-20 -left-20" />
            </div>

            {/* Modal IA */}
            {showAiModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAiModal(false)} />
                    <div className="relative bg-white border border-slate-100 p-6 sm:p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-primary shadow-inner">
                                <span className="material-icons-round text-2xl">auto_awesome</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Generador IA</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inteligencia Artificial</p>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 leading-relaxed">
                            Describe tu rutina ideal:
                        </p>
                        <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] p-4 text-sm font-medium focus:outline-none focus:border-primary/50 text-slate-900 min-h-[120px] mb-4 shadow-inner transition-all placeholder:text-slate-300"
                            placeholder="Ej: Rutina enfocada en hombros..."
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowAiModal(false)} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 transition-all active:scale-95">Cerrar</button>
                            <button 
                                onClick={handleAiGenerate} 
                                disabled={isGenerating || !aiPrompt.trim()}
                                className="flex-1 bg-primary text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isGenerating ? <div className="w-3 h-3 border-2 border-white/30 border-t-white animate-spin rounded-full"></div> : 'Generar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase truncate">Crear Rutina</h1>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Diseña tu plan</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button 
                        onClick={() => setShowAiModal(true)}
                        className="bg-emerald-50 text-primary border border-emerald-100 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                    >
                         <span className="material-icons-round text-sm">auto_awesome</span> IA
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-slate-400 font-bold text-xs uppercase tracking-widest px-2"
                    >
                        Salir
                    </button>
                </div>
            </div>

            {error && (
                <div className="relative z-10 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl mb-6 flex items-center gap-3 animate-in slide-in-from-top-2 duration-200 shadow-sm">
                    <span className="material-icons-round text-lg">error_outline</span>
                    <p>{error}</p>
                </div>
            )}

            <div className="relative z-10 space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-black text-sm focus:outline-none focus:border-primary shadow-inner transition-all placeholder:text-slate-300"
                        placeholder="ej. Rutina de Empuje"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descripción</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-medium text-sm focus:outline-none focus:border-primary shadow-inner transition-all min-h-[100px] placeholder:text-slate-300"
                        placeholder="Opcional..."
                    />
                </div>

                <div className="pt-4">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                        <span className="material-icons-round text-primary">task_alt</span>
                        Seleccionados ({selectedExercises.length})
                    </h2>
                    {selectedExercises.length === 0 ? (
                        <div className="p-10 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px] shadow-inner">
                            Sin ejercicios añadidos
                        </div>
                    ) : (
                        <div className="space-y-3 mb-6 px-1">
                            {selectedExercises.map((ex, idx) => (
                                <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in slide-in-from-right-2">
                                    <div className="min-w-0">
                                        <h3 className="font-black text-slate-900 text-sm truncate">{ex.name}</h3>
                                        <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                            <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{ex.sets} Series</span>
                                            <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{ex.reps_target} Reps</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeExercise(idx)}
                                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shrink-0"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-8 border-t border-slate-100">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 font-bold text-sm focus:outline-none focus:border-primary shadow-inner transition-all placeholder:text-slate-300"
                            placeholder="Buscar ejercicios..."
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar pb-4">
                        {filteredExercises.map((ex) => (
                            <button
                                key={ex.id}
                                onClick={() => addExercise(ex)}
                                className="w-full text-left bg-white border border-slate-100 rounded-2xl p-4 transition-all flex items-center justify-between group hover:border-primary/30 active:scale-[0.99] shadow-sm"
                            >
                                <div className="min-w-0">
                                    <h4 className="font-black text-slate-900 text-sm group-hover:text-primary transition-colors truncate">{ex.name}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{ex.muscle_group}</p>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                    <Plus className="w-4 h-4" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
                <button
                    onClick={handleCreate}
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[1.5rem] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-slate-900/20"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <><Check className="w-4 h-4" strokeWidth={3} /> Guardar Rutina</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default RoutineBuilder;
