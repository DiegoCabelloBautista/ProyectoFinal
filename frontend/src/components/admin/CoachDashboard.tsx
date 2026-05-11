import React, { useState, useEffect } from 'react';
import { adminApi, routinesApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const CoachDashboard: React.FC = () => {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [clientStats, setClientStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Custom Notification States
    const [statusModal, setStatusModal] = useState<{
        show: boolean;
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
    }>({ show: false, type: 'success', title: '', message: '' });

    const [promptModal, setPromptModal] = useState<{
        show: boolean;
        title: string;
        placeholder: string;
        defaultValue: string;
        onConfirm: (val: string) => void;
    }>({ show: false, title: '', placeholder: '', defaultValue: '', onConfirm: () => {} });

    const [promptValue, setPromptValue] = useState('');
    const [promptLoading, setPromptLoading] = useState(false);

    useEffect(() => {
        loadClients();
    }, []);

    const showStatus = (type: 'success' | 'error' | 'info', title: string, message: string) => {
        setStatusModal({ show: true, type, title, message });
    };

    const loadClients = async () => {
        try {
            const res = await adminApi.getCoachClients();
            setClients(res.data);
        } catch (err) {
            console.error('Error al cargar clientes:', err);
            showStatus('error', 'Error', 'No se pudieron cargar los atletas.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewStats = async (client: any) => {
        setSelectedClient(client);
        setLoadingStats(true);
        try {
            const res = await adminApi.getClientStats(client.id);
            setClientStats(res.data);
        } catch (err) {
            console.error('Error al cargar estadísticas:', err);
            showStatus('error', 'Error', 'No se pudieron obtener las estadísticas.');
        } finally {
            setLoadingStats(false);
        }
    };

    const filteredClients = clients.filter(c => 
        c.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNudge = (clientId: number, username: string) => {
        const defaultMsg = '¡Tu entrenador te ha enviado un toque! Mantén la constancia.';
        setPromptValue(defaultMsg);
        setPromptModal({
            show: true,
            title: `Advertir a ${username}`,
            placeholder: 'Escribe el mensaje de advertencia...',
            defaultValue: defaultMsg,
            onConfirm: async (note) => {
                setPromptLoading(true);
                try {
                    await adminApi.nudgeUser(clientId, note);
                    setPromptModal(p => ({ ...p, show: false }));
                    showStatus('success', 'Toque Enviado', `Se ha enviado el aviso a ${username} correctamente.`);
                } catch (err) {
                    showStatus('error', 'Error', 'No se pudo enviar el toque.');
                } finally {
                    setPromptLoading(false);
                }
            }
        });
    };

    const handleAssignRoutine = async (client: any) => {
        try {
            const routinesRes = await routinesApi.getAll();
            const routines = routinesRes.data;
            if (routines.length === 0) {
                showStatus('info', 'Sin Rutinas', 'No tienes rutinas creadas para asignar.');
                return;
            }

            setPromptValue('');
            setPromptModal({
                show: true,
                title: `Asignar Rutina a ${client.username}`,
                placeholder: 'Escribe el ID de la rutina...',
                defaultValue: '',
                onConfirm: async (routineId) => {
                    if (!routineId) return;
                    setPromptLoading(true);
                    try {
                        await adminApi.assignRoutine(client.id, parseInt(routineId));
                        setPromptModal(p => ({ ...p, show: false }));
                        showStatus('success', 'Rutina Asignada', 'La rutina ha sido asignada correctamente.');
                    } catch (err) {
                        showStatus('error', 'Error', 'ID de rutina no válido o error de servidor.');
                    } finally {
                        setPromptLoading(false);
                    }
                }
            });
            
            // Mostrar lista de IDs en la descripción del modal
            setPromptModal(prev => ({
                ...prev,
                title: `Asignar Rutina a ${client.username}\nIDs: ` + routines.map((r: any) => `${r.id}(${r.name})`).join(', ')
            }));

        } catch (err) {
            showStatus('error', 'Error', 'No se pudieron cargar tus rutinas.');
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-slate-100 pb-24">
            <header className="px-6 pt-12 pb-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <span className="material-icons-round text-blue-400 text-3xl">sports</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Panel de Entrenador</h1>
                        <p className="text-sm text-slate-400">Supervisa el progreso de tus atletas</p>
                    </div>
                </div>
            </header>

            <main className="px-6 space-y-6">
                {/* Search Bar */}
                <div className="relative">
                    <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                    <input
                        type="text"
                        placeholder="Buscar atleta por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Atletas Registrados</h2>
                    
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <p className="text-center text-slate-500 py-12">No se han encontrado atletas.</p>
                    ) : (
                        <div className="grid gap-3">
                            {filteredClients.map((client, index) => (
                                <motion.div
                                    key={client.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-card p-4 flex items-center justify-between group hover:border-blue-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div 
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                                            style={{ 
                                                background: `linear-gradient(135deg, ${client.username_color}, #1e293b)`,
                                                boxShadow: `0 4px 12px ${client.username_color}20`
                                            }}
                                        >
                                            <span className="material-icons-round text-white">{client.avatar_icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{client.username}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase">
                                                    NV. {client.level}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {client.last_workout ? `Último entreno: ${new Date(client.last_workout).toLocaleDateString()}` : 'Sin entrenos aún'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleNudge(client.id, client.username)}
                                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-orange-400 hover:bg-orange-500/20 transition-all"
                                            title="Enviar advertencia"
                                        >
                                            <span className="material-icons-round text-sm">notification_important</span>
                                        </button>
                                        <button 
                                            onClick={() => handleViewStats(client)}
                                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all"
                                        >
                                            <span className="material-icons-round">analytics</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Client Stats Modal */}
            <AnimatePresence>
                {selectedClient && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedClient(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="relative w-full max-w-lg glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center gap-6 mb-8">
                                <div 
                                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-2xl border-2 border-white/20"
                                    style={{ background: `linear-gradient(135deg, ${selectedClient.username_color}, #000)` }}
                                >
                                    <span className="material-icons-round text-white">{selectedClient.avatar_icon}</span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white">{selectedClient.username}</h2>
                                    <p className="text-blue-400 font-bold uppercase tracking-tighter text-sm">Reporte de Desempeño</p>
                                </div>
                            </div>

                            {loadingStats ? (
                                <div className="py-20 flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-blue-500 animate-spin" />
                                    <p className="text-slate-400 animate-pulse">Analizando datos del atleta...</p>
                                </div>
                            ) : clientStats && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5 hover:border-blue-500/20 transition-all group">
                                            <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Volumen Total</p>
                                            <p className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                                                {clientStats.total_volume.toLocaleString()} <span className="text-xs font-medium text-slate-400">kg</span>
                                            </p>
                                        </div>
                                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5 hover:border-blue-500/20 transition-all group">
                                            <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Sesiones</p>
                                            <p className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                                                {clientStats.total_sessions}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black text-slate-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                                            <span className="material-icons-round text-sm">military_tech</span> Récords Personales (Max. Peso)
                                        </h4>
                                        <div className="space-y-2">
                                            {clientStats.best_lifts.length > 0 ? clientStats.best_lifts.map((lift: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                                    <span className="text-slate-300 font-medium">{lift.exercise}</span>
                                                    <span className="text-white font-black">{lift.weight} kg</span>
                                                </div>
                                            )) : (
                                                <p className="text-slate-500 text-center py-4 text-sm italic">El atleta aún no ha registrado pesos.</p>
                                            )}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setSelectedClient(null)}
                                        className="w-full py-4 rounded-3xl bg-white/5 text-slate-400 font-black uppercase tracking-tighter hover:bg-white/10 transition-all text-xs"
                                    >
                                        Cerrar Reporte
                                    </button>

                                    <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={async () => {
                                                try {
                                                    await adminApi.rewardUser(selectedClient.id, 100);
                                                    showStatus('success', '¡Recompensa Enviada!', `Has premiado a ${selectedClient.username} con 100 monedas.`);
                                                } catch(e) { showStatus('error', 'Error', 'No se pudo enviar la recompensa.'); }
                                            }}
                                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all group"
                                        >
                                            <span className="material-icons-round text-yellow-500">payments</span>
                                            <span className="text-[10px] font-black text-yellow-500 uppercase">Premiar Atleta</span>
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleAssignRoutine(selectedClient)}
                                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                                        >
                                            <span className="material-icons-round text-blue-400">assignment_add</span>
                                            <span className="text-[10px] font-black text-blue-400 uppercase">Asignar Rutina</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Status Modal */}
            <AnimatePresence>
                {statusModal.show && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setStatusModal({ ...statusModal, show: false })}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl text-center"
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                                statusModal.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                statusModal.type === 'error' ? 'bg-red-500/20 text-red-400' :
                                'bg-blue-500/20 text-blue-400'
                            }`}>
                                <span className="material-icons-round text-3xl">
                                    {statusModal.type === 'success' ? 'check_circle' :
                                     statusModal.type === 'error' ? 'error' : 'info'}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{statusModal.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                {statusModal.message}
                            </p>
                            
                            <button 
                                onClick={() => setStatusModal({ ...statusModal, show: false })}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${
                                    statusModal.type === 'success' ? 'bg-green-500 text-white shadow-green-500/20' :
                                    statusModal.type === 'error' ? 'bg-red-500 text-white shadow-red-500/20' :
                                    'bg-blue-500 text-white shadow-blue-500/20'
                                }`}
                            >
                                Continuar
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Prompt Modal */}
            <AnimatePresence>
                {promptModal.show && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !promptLoading && setPromptModal({ ...promptModal, show: false })}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl"
                        >
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight text-center whitespace-pre-line">{promptModal.title}</h3>
                            
                            <div className="mt-6 mb-8">
                                <textarea
                                    autoFocus
                                    placeholder={promptModal.placeholder}
                                    value={promptValue}
                                    onChange={(e) => setPromptValue(e.target.value)}
                                    disabled={promptLoading}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 min-h-[100px] resize-none disabled:opacity-50"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setPromptModal({ ...promptModal, show: false })}
                                    disabled={promptLoading}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={() => promptModal.onConfirm(promptValue)}
                                    disabled={promptLoading}
                                    className="flex-1 py-4 rounded-2xl bg-blue-500 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {promptLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Confirmar'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CoachDashboard;
