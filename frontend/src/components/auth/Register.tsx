import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
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
        <div className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden bg-white">
            {/* Background orbs */}
            <div className="orb w-96 h-96" style={{ background: '#10B981', top: '-15%', right: '-10%', opacity: 0.15 }} />
            <div className="orb w-72 h-72" style={{ background: '#34D399', bottom: '-10%', left: '-5%', opacity: 0.12 }} />

            <div className="relative z-10 w-full max-w-sm animate-slide-up">
                {/* Logo mark */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-emerald-500/10"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(52,211,153,0.1) 100%)',
                            border: '1px solid rgba(16,185,129,0.25)',
                        }}>
                        <span className="material-icons-round text-3xl text-primary">person_add</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                        Únete <span className="text-primary">gratis</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Empieza a romper tus límites hoy</p>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl">
                    <h2 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">Nueva cuenta</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">Solo tardarás 30 segundos</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold p-3.5 rounded-xl mb-5 flex items-center gap-2">
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

                        <div className="flex items-start gap-3 mt-4 mb-2">
                            <div className="pt-0.5">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="w-4 h-4 rounded bg-surface border-slate-700 text-primary focus:ring-primary focus:ring-offset-bg"
                                    required
                                />
                            </div>
                            <label htmlFor="terms" className="text-xs text-slate-400 leading-tight">
                                He leído y acepto los <Link to="/terms" className="font-semibold hover:underline transition-all" style={{ color: '#10B981' }}>Términos de Uso</Link> y la Política de Privacidad de GymTrack Pro.
                            </label>
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
                    <Link to="/login" className="font-bold hover:opacity-80 transition-opacity" style={{ color: '#10B981' }}>
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
