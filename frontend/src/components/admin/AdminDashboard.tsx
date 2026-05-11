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
        <div className="p-6 md:p-8 max-w-7xl mx-auto mb-20 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
                    <span className="material-icons-round text-red-400">admin_panel_settings</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
                    <p className="text-slate-400 text-sm">Gestiona usuarios y permisos de la plataforma</p>
                </div>
            </div>

            <div className="glass rounded-3xl p-6 overflow-hidden">
                <h2 className="text-lg font-bold text-white mb-6">Lista de Usuarios</h2>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 py-8">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-sm">
                                    <th className="pb-3 px-4 font-medium">Usuario</th>
                                    <th className="pb-3 px-4 font-medium">Email</th>
                                    <th className="pb-3 px-4 font-medium">Rol</th>
                                    <th className="pb-3 px-4 font-medium">Registro</th>
                                    <th className="pb-3 px-4 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 font-medium text-white">{u.username}</td>
                                        <td className="py-4 px-4 text-slate-400 text-sm">{u.email}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                                    u.role === 'trainer' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-slate-700/50 text-slate-300'
                                                }`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-400 text-sm">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, u.username, e.target.value)}
                                                    className="bg-surface border border-slate-700 rounded-lg text-sm px-2 py-1 text-white focus:outline-none focus:border-primary"
                                                    disabled={u.id === user.id}
                                                >
                                                    <option value="user">Usuario</option>
                                                    <option value="trainer">Entrenador</option>
                                                    <option value="admin">Administrador</option>
                                                </select>
                                                {u.id !== user.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id, u.username)}
                                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModal(prev => ({ ...prev, show: false }))}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm glass rounded-3xl p-6 shadow-2xl border border-white/10"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${modal.type === 'danger' ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'
                                }`}>
                                <span className="material-icons-round">
                                    {modal.type === 'danger' ? 'warning' : 'info'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{modal.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                {modal.message}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setModal(prev => ({ ...prev, show: false }))}
                                    className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={modal.onConfirm}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 ${modal.type === 'danger'
                                            ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/20'
                                            : 'bg-gradient-to-r from-primary to-blue-600 shadow-primary/20'
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
