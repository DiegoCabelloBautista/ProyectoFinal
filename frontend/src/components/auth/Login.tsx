import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await authApi.login({ username, password });
            login(res.data.access_token, res.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.msg || err.message || 'Ocurrió un error al iniciar sesión');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden" style={{ background: '#0A0D14' }}>
            {/* Background orbs */}
            <div className="orb w-96 h-96" style={{ background: '#8B5CF6', top: '-10%', left: '-15%' }} />
            <div className="orb w-72 h-72" style={{ background: '#F472B6', bottom: '-5%', right: '-10%' }} />

            {/* Card */}
            <div className="relative z-10 w-full max-w-sm animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse-glow"
                        style={{
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(244,114,182,0.1) 100%)',
                            border: '1px solid rgba(139,92,246,0.3)',
                        }}>
                        <span className="material-icons-round text-3xl" style={{ color: '#A78BFA' }}>fitness_center</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Gym<span className="gradient-text">Track</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Tu progreso. Tu récord. Tu historia.</p>
                </div>

                {/* Form card */}
                <div className="glass rounded-3xl p-7">
                    <h2 className="text-lg font-bold text-white mb-1">Iniciar sesión</h2>
                    <p className="text-slate-500 text-sm mb-6">Bienvenido de nuevo, atleta</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3.5 rounded-xl mb-5 flex items-center gap-2">
                            <span className="material-icons-round text-base">error_outline</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Usuario
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field"
                                placeholder="tu_usuario"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Entrar</span>
                                    <span className="material-icons-round text-base">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-5 text-slate-500 text-sm">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="font-bold" style={{ color: '#A78BFA' }}>
                        Regístrate gratis
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
