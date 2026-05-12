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
        <div className="p-6 md:p-8 max-w-7xl mx-auto mb-28 animate-fade-in relative z-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
                    <span className="material-icons-round text-red-500 text-3xl">admin_panel_settings</span>
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Panel de Administración</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Gestión Global de Usuarios</p>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Lista de Usuarios</h2>
                    <div className="px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {users.length} Usuarios totales
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-primary animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-16 bg-red-50 rounded-3xl border border-red-100 font-bold uppercase tracking-widest text-xs">{error}</div>
                ) : (
                    <div className="overflow-x-auto -mx-8 px-8">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                                    <th className="pb-4 px-4">Usuario</th>
                                    <th className="pb-4 px-4">Email</th>
                                    <th className="pb-4 px-4">Rol</th>
                                    <th className="pb-4 px-4">Registro</th>
                                    <th className="pb-4 px-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-5 px-4 font-black text-slate-900 text-sm">{u.username}</td>
                                        <td className="py-5 px-4 text-slate-500 text-xs font-medium">{u.email}</td>
                                        <td className="py-5 px-4">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border ${u.role === 'admin' ? 'bg-red-50 text-red-500 border-red-100' :
                                                    u.role === 'trainer' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                                                        'bg-slate-50 text-slate-500 border-slate-100'
                                                }`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4 text-slate-400 text-[10px] font-bold">
                                            {new Date(u.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="flex items-center justify-end gap-3">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, u.username, e.target.value)}
                                                    className="bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider px-3 py-1.5 text-slate-700 focus:outline-none focus:border-primary/50 transition-all cursor-pointer hover:bg-white shadow-sm"
                                                    disabled={u.id === user.id}
                                                >
                                                    <option value="user">Atleta</option>
                                                    <option value="trainer">Entrenador</option>
                                                    <option value="admin">Administrador</option>
                                                </select>
                                                {u.id !== user.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id, u.username)}
                                                        className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100 shadow-sm active:scale-90"
                                                        title="Eliminar usuario"
                                                    >
                                                        <span className="material-icons-round text-sm">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Custom Modal */}
            <AnimatePresence>
                {modal.show && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModal(prev => ({ ...prev, show: false }))}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 overflow-hidden"
                        >
                            {/* Decoración modal */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50" />
                            
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 ${modal.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-primary'
                                }`}>
                                <span className="material-icons-round text-3xl">
                                    {modal.type === 'danger' ? 'warning' : 'info'}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10 uppercase tracking-tight">{modal.title}</h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8 relative z-10 uppercase tracking-wider">
                                {modal.message}
                            </p>
                            <div className="flex gap-4 relative z-10">
                                <button
                                    onClick={() => setModal(prev => ({ ...prev, show: false }))}
                                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={modal.onConfirm}
                                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${modal.type === 'danger'
                                            ? 'bg-red-500 shadow-red-500/30'
                                            : 'bg-primary shadow-emerald-500/30'
                                        }`}
                                >
                                    Confirmar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
