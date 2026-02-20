import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await authApi.register({ username, email, password });
            navigate('/login', { state: { msg: '¡Registro completado! Por favor, inicia sesión.' } });
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Ocurrió un error al registrar el usuario');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden" style={{ background: '#0A0D14' }}>
            {/* Background orbs */}
            <div className="orb w-96 h-96" style={{ background: '#7C3AED', top: '-15%', right: '-10%' }} />
            <div className="orb w-72 h-72" style={{ background: '#EC4899', bottom: '-10%', left: '-5%' }} />

            <div className="relative z-10 w-full max-w-sm animate-slide-up">
                {/* Logo mark */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(244,114,182,0.1) 100%)',
                            border: '1px solid rgba(139,92,246,0.3)',
                        }}>
                        <span className="material-icons-round text-3xl" style={{ color: '#A78BFA' }}>person_add</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Únete gratis
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Empieza a romper tus límites hoy</p>
                </div>

                {/* Card */}
                <div className="glass rounded-3xl p-7">
                    <h2 className="text-lg font-bold text-white mb-1">Nueva cuenta</h2>
                    <p className="text-slate-500 text-sm mb-6">Solo tardarás 30 segundos</p>

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
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="correo@ejemplo.com"
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
                                minLength={6}
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
                                    <span>Crear cuenta</span>
                                    <span className="material-icons-round text-base">rocket_launch</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-5 text-slate-500 text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="font-bold" style={{ color: '#A78BFA' }}>
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
