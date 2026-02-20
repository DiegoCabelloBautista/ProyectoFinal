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
    const navigate = useNavigate();

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
        if (!name) {
            alert('Por favor, introduce un nombre para la rutina');
            return;
        }
        if (selectedExercises.length === 0) {
            alert('Por favor, añade al menos un ejercicio');
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
        <div className="min-h-screen pb-24 text-slate-100 px-6 pt-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Crear Rutina</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-400 font-medium"
                >
                    Cancelar
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Nombre de la Rutina</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary transition-colors"
                        placeholder="ej. Pecho y Tríceps"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Descripción (Opcional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary transition-colors min-h-[100px]"
                        placeholder="¿Cuál es el objetivo de esta rutina?"
                    />
                </div>

                <div className="pt-4">
                    <h2 className="text-lg font-bold mb-4">Ejercicios Seleccionados ({selectedExercises.length})</h2>
                    {selectedExercises.length === 0 ? (
                        <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 text-slate-500 italic">
                            No has añadido ejercicios todavía. Usa el buscador de abajo.
                        </div>
                    ) : (
                        <div className="space-y-3 mb-6">
                            {selectedExercises.map((ex, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold">{ex.name}</h3>
                                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                                            <span>{ex.sets} Series</span>
                                            <span>{ex.reps_target} Reps</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeExercise(idx)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-white/10">
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-100 focus:outline-none focus:border-primary transition-colors"
                            placeholder="Buscar ejercicios..."
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {filteredExercises.map((ex) => (
                            <button
                                key={ex.id}
                                onClick={() => addExercise(ex)}
                                className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors flex items-center justify-between group"
                            >
                                <div>
                                    <h4 className="font-medium group-hover:text-primary transition-colors">{ex.name}</h4>
                                    <p className="text-xs text-slate-500">{ex.muscle_group}</p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="w-5 h-5" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 glass-nav z-50">
                <button
                    onClick={handleCreate}
                    disabled={isSubmitting}
                    className="w-full bg-primary text-background-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <><Check className="w-5 h-5" /> Crear Rutina</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default RoutineBuilder;
