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
        <div className="min-h-screen bg-white text-slate-900 pb-24 relative overflow-hidden">
            {/* Orbs de fondo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="orb w-[500px] h-[500px]" style={{ background: '#3B82F6', top: '-10%', right: '-5%', opacity: 0.08 }} />
                <div className="orb w-[400px] h-[400px]" style={{ background: '#10B981', bottom: '10%', left: '-10%', opacity: 0.05 }} />
            </div>

            <header className="px-6 pt-14 pb-6 relative z-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                        <span className="material-icons-round text-blue-500 text-3xl">sports</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Panel de Entrenador</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gestión de Atletas y Rendimiento</p>
                    </div>
                </div>
            </header>

            <main className="px-6 space-y-8 relative z-10">
                {/* Search Bar */}
                <div className="relative">
                    <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar atleta por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-all shadow-sm"
                    />
                </div>

                <div className="space-y-4">
                    <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Atletas Registrados</h2>
                    
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin"></div>
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No se han encontrado atletas</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredClients.map((client, index) => (
                                <motion.div
                                    key={client.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between group hover:border-blue-200 hover:shadow-md transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div 
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-white"
                                            style={{ 
                                                background: `linear-gradient(135deg, ${client.username_color}, #60A5FA)`,
                                                boxShadow: `0 8px 20px ${client.username_color}30`
                                            }}
                                        >
                                            <span className="material-icons-round text-white">{client.avatar_icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-lg leading-none">{client.username}</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-blue-50 text-blue-500 uppercase border border-blue-100 shadow-sm">
                                                    NV. {client.level}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    {client.last_workout ? `Último entreno: ${new Date(client.last_workout).toLocaleDateString()}` : 'Sin registros'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleNudge(client.id, client.username)}
                                            className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center border border-orange-100 shadow-sm active:scale-90"
                                            title="Enviar advertencia"
                                        >
                                            <span className="material-icons-round text-lg">notification_important</span>
                                        </button>
                                        <button 
                                            onClick={() => handleViewStats(client)}
                                            className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all flex items-center justify-center border border-blue-100 shadow-sm active:scale-90"
                                        >
                                            <span className="material-icons-round text-lg">analytics</span>
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedClient(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-24 -mt-24 opacity-50" />
                            
                            <div className="flex items-center gap-6 mb-10 relative z-10">
                                <div 
                                    className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl border-4 border-white"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${selectedClient.username_color}, #60A5FA)`,
                                        boxShadow: `0 12px 30px ${selectedClient.username_color}40`
                                    }}
                                >
                                    <span className="material-icons-round text-white">{selectedClient.avatar_icon}</span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 leading-none">{selectedClient.username}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-blue-600 font-black uppercase tracking-widest text-[9px] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                            Reporte de Desempeño
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {loadingStats ? (
                                <div className="py-24 flex flex-col items-center gap-4">
                                    <div className="w-14 h-14 rounded-full border-4 border-slate-50 border-t-blue-500 animate-spin" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Analizando datos del atleta...</p>
                                </div>
                            ) : clientStats && (
                                <div className="space-y-8 relative z-10">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                                            <p className="text-slate-400 text-[9px] font-black uppercase mb-1 tracking-widest">Volumen Total</p>
                                            <p className="text-3xl font-black text-slate-900 group-hover:text-blue-500 transition-colors">
                                                {clientStats.total_volume.toLocaleString()} <span className="text-[10px] font-black text-slate-400 ml-1">KG</span>
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                                            <p className="text-slate-400 text-[9px] font-black uppercase mb-1 tracking-widest">Sesiones</p>
                                            <p className="text-3xl font-black text-slate-900 group-hover:text-blue-500 transition-colors">
                                                {clientStats.total_sessions}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-[0.2em] flex items-center gap-2 ml-2">
                                            <span className="material-icons-round text-blue-500 text-sm">military_tech</span> Récords Personales
                                        </h4>
                                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-hide">
                                            {clientStats.best_lifts.length > 0 ? clientStats.best_lifts.map((lift: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all shadow-sm">
                                                    <span className="text-slate-600 font-bold text-sm">{lift.exercise}</span>
                                                    <span className="text-slate-900 font-black text-sm">{lift.weight} kg</span>
                                                </div>
                                            )) : (
                                                <div className="text-center py-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Sin registros de fuerza</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={async () => {
                                                try {
                                                    await adminApi.rewardUser(selectedClient.id, 100);
                                                    showStatus('success', '¡Recompensa Enviada!', `Has premiado a ${selectedClient.username} con 100 monedas.`);
                                                } catch(e) { showStatus('error', 'Error', 'No se pudo enviar la recompensa.'); }
                                            }}
                                            className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-yellow-50 text-yellow-600 border border-yellow-100 hover:bg-yellow-500 hover:text-white transition-all group shadow-sm active:scale-95"
                                        >
                                            <span className="material-icons-round text-2xl group-hover:scale-110 transition-transform">payments</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest">Premiar Atleta</span>
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleAssignRoutine(selectedClient)}
                                            className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-500 hover:text-white transition-all group shadow-sm active:scale-95"
                                        >
                                            <span className="material-icons-round text-2xl group-hover:scale-110 transition-transform">assignment_add</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest">Asignar Rutina</span>
                                        </button>
                                    </div>

                                    <button 
                                        onClick={() => setSelectedClient(null)}
                                        className="w-full py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase tracking-widest hover:bg-slate-200 transition-all text-[10px]"
                                    >
                                        Cerrar Reporte
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Status Modal */}
            <AnimatePresence>
                {statusModal.show && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center px-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setStatusModal({ ...statusModal, show: false })}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl text-center overflow-hidden"
                        >
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg ${
                                statusModal.type === 'success' ? 'bg-emerald-50 text-primary border border-emerald-100' :
                                statusModal.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' :
                                'bg-blue-50 text-blue-500 border border-blue-100'
                            }`}>
                                <span className="material-icons-round text-4xl">
                                    {statusModal.type === 'success' ? 'check_circle' :
                                     statusModal.type === 'error' ? 'error' : 'info'}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">{statusModal.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 uppercase tracking-wide">
                                {statusModal.message}
                            </p>
                            
                            <button 
                                onClick={() => setStatusModal({ ...statusModal, show: false })}
                                className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 ${
                                    statusModal.type === 'success' ? 'bg-primary text-white shadow-emerald-500/20' :
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
                    <div className="fixed inset-0 z-[250] flex items-center justify-center px-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !promptLoading && setPromptModal({ ...promptModal, show: false })}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl"
                        >
                            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight text-center whitespace-pre-line leading-tight">{promptModal.title}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-8">Acción Requerida</p>
                            
                            <div className="mb-8">
                                <textarea
                                    autoFocus
                                    placeholder={promptModal.placeholder}
                                    value={promptValue}
                                    onChange={(e) => setPromptValue(e.target.value)}
                                    disabled={promptLoading}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 min-h-[120px] resize-none disabled:opacity-50 transition-all shadow-inner"
                                />
                            </div>
                            
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setPromptModal({ ...promptModal, show: false })}
                                    disabled={promptLoading}
                                    className="flex-1 py-5 rounded-[1.5rem] bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all disabled:opacity-50 active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={() => promptModal.onConfirm(promptValue)}
                                    disabled={promptLoading}
                                    className="flex-1 py-5 rounded-[1.5rem] bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center active:scale-95"
                                >
                                    {promptLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
