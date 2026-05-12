import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [modal, setModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'danger' | 'primary';
    }>({
        show: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'primary'
    });

    useEffect(() => {
        if (user?.role === 'admin') {
            loadUsers();
        }
    }, [user]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getUsers();
            setUsers(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (userId: number, username: string, newRole: string) => {
        setModal({
            show: true,
            title: 'Cambiar Rol de Usuario',
            message: `¿Estás seguro de que quieres cambiar el rol de "${username}" a ${newRole.toUpperCase()}?`,
            type: 'primary',
            onConfirm: async () => {
                try {
                    await adminApi.updateUserRole(userId, newRole);
                    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
                    setModal(prev => ({ ...prev, show: false }));
                } catch (err) {
                    console.error(err);
                    setModal(prev => ({ ...prev, show: false }));
                }
            }
        });
    };

    const handleDeleteUser = (userId: number, username: string) => {
        setModal({
            show: true,
            title: 'Eliminar Usuario',
            message: `¿Estás seguro de que quieres eliminar permanentemente a "${username}"? Esta acción no se puede deshacer y borrará todo su historial.`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    await adminApi.deleteUser(userId);
                    setUsers(users.filter(u => u.id !== userId));
                    setModal(prev => ({ ...prev, show: false }));
                } catch (err) {
                    console.error(err);
                    setModal(prev => ({ ...prev, show: false }));
                }
            }
        });
    };

    if (user?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 pb-28 relative overflow-hidden">
            {/* Orbs de fondo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="orb w-[600px] h-[600px]" style={{ background: '#EF4444', top: '-10%', right: '-10%', opacity: 0.05 }} />
                <div className="orb w-[500px] h-[500px]" style={{ background: '#F59E0B', bottom: '-10%', left: '-5%', opacity: 0.04 }} />
            </div>

            <div className="relative z-10 p-2 sm:p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
                {/* Cabecera */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 mb-6 sm:mb-10 mt-2 sm:mt-4 px-2 sm:px-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[2rem] bg-red-50 border border-red-100 flex items-center justify-center shadow-xl shadow-red-500/10">
                        <span className="material-icons-round text-red-500 text-2xl sm:text-4xl">admin_panel_settings</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Administración</h1>
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[7px] sm:text-[8px] font-black uppercase rounded-md tracking-widest shadow-sm">Root</span>
                        </div>
                        <p className="text-slate-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] mt-1.5">Gestión Maestra</p>
                    </div>
                </div>

                {/* Contenedor Principal */}
                <div className="bg-white border border-slate-100 rounded-[1.5rem] sm:rounded-[3rem] p-0.5 sm:p-1 shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-4 sm:p-8 pb-3 sm:pb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                                <h2 className="text-[12px] sm:text-lg font-black text-slate-900 uppercase tracking-tighter">Usuarios</h2>
                            </div>
                            <div className="px-3 py-1.5 bg-slate-50 rounded-lg sm:rounded-2xl border border-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 self-start sm:self-auto">
                                <span className="material-icons-round text-[10px]">group</span>
                                {users.length} Atletas
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 rounded-full border-4 border-slate-50 border-t-red-500 animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-16 bg-red-50 mx-4 mb-4 rounded-2xl border border-red-100 font-black uppercase tracking-widest text-[9px] shadow-inner">{error}</div>
                    ) : (
                        <div className="px-2 sm:px-8 pb-4 sm:pb-8">
                            {/* Vista Móvil */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {users.map(u => (
                                    <div key={u.id} className="bg-slate-50/40 border border-slate-100 p-3 sm:p-5 rounded-[1.5rem] relative overflow-hidden">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 font-black text-xs shadow-sm">
                                                {u.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-black text-slate-900 text-xs leading-tight truncate">{u.username}</h3>
                                                <p className="text-slate-400 text-[9px] font-bold mt-0.5 uppercase tracking-tighter truncate opacity-70">{u.email}</p>
                                                <div className="mt-1.5">
                                                    <span className={`inline-block px-2 py-0.5 rounded-md text-[6px] font-black uppercase tracking-widest border shadow-sm ${
                                                        u.role === 'admin' ? 'bg-red-500 text-white border-red-600' :
                                                        u.role === 'trainer' ? 'bg-blue-600 text-white border-blue-700' :
                                                        'bg-white text-slate-400 border-slate-200'
                                                    }`}>
                                                        {u.role === 'admin' ? 'ADMIN' : u.role === 'trainer' ? 'COACH' : 'ATLETA'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="relative flex-1 mr-2">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, u.username, e.target.value)}
                                                    className="appearance-none w-full bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest pl-3 pr-8 py-2.5 text-slate-700 focus:outline-none"
                                                    disabled={u.id === user.id}
                                                >
                                                    <option value="user">Atleta</option>
                                                    <option value="trainer">Coach</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <span className="material-icons-round absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">expand_more</span>
                                            </div>
                                            {u.id !== user.id && (
                                                <button
                                                    onClick={() => handleDeleteUser(u.id, u.username)}
                                                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center active:scale-90"
                                                >
                                                    <span className="material-icons-round text-base">delete_forever</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Vista Escritorio */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-y-3">
                                    <thead>
                                        <tr className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
                                            <th className="pb-4 px-6">Atleta</th>
                                            <th className="pb-4 px-6">Email</th>
                                            <th className="pb-4 px-6">Privilegios</th>
                                            <th className="pb-4 px-6">Fecha</th>
                                            <th className="pb-4 px-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className="group transition-all">
                                                <td className="py-5 px-6 font-black text-slate-900 text-sm bg-slate-50/50 rounded-l-2xl border-y border-l border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100 font-bold text-xs">
                                                            {u.username.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        {u.username}
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6 text-slate-500 text-xs font-bold bg-slate-50/50 border-y border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">{u.email}</td>
                                                <td className="py-5 px-6 bg-slate-50/50 border-y border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border ${
                                                        u.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        u.role === 'trainer' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        'bg-white text-slate-500 border-slate-200'
                                                    }`}>
                                                        {u.role === 'user' ? 'Atleta' : u.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6 text-slate-400 text-[10px] font-black bg-slate-50/50 border-y border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                                                    {new Date(u.created_at).toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="py-5 px-6 bg-slate-50/50 rounded-r-2xl border-y border-r border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => handleRoleChange(u.id, u.username, e.target.value)}
                                                            className="bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase px-3 py-2 focus:outline-none"
                                                            disabled={u.id === user.id}
                                                        >
                                                            <option value="user">Atleta</option>
                                                            <option value="trainer">Coach</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                        {u.id !== user.id && (
                                                            <button onClick={() => handleDeleteUser(u.id, u.username)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center">
                                                                <span className="material-icons-round text-base">delete_forever</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {modal.show && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(prev => ({ ...prev, show: false }))} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 overflow-hidden">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 text-slate-900">
                                <span className="material-icons-round text-3xl">{modal.type === 'danger' ? 'warning' : 'info'}</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{modal.title}</h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8 uppercase tracking-wider">{modal.message}</p>
                            <div className="flex gap-4">
                                <button onClick={() => setModal(prev => ({ ...prev, show: false }))} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">Cancelar</button>
                                <button onClick={modal.onConfirm} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${modal.type === 'danger' ? 'bg-red-500 shadow-red-500/30' : 'bg-primary shadow-emerald-500/30'}`}>Confirmar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
