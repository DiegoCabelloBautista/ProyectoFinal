import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfUse: React.FC = () => {
    return (
        <div className="min-h-screen bg-white text-slate-600 p-6 md:p-12">
            <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                <div className="mb-8">
                    <Link to="/register" className="inline-flex items-center gap-2 text-emerald-600 hover:opacity-80 transition-opacity">
                        <span className="material-icons-round text-sm">arrow_back</span>
                        <span className="text-sm font-black uppercase tracking-tight">Volver al registro</span>
                    </Link>
                </div>
                
                <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Términos de Uso</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Última actualización: Mayo 2026</p>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <span className="material-icons-round text-emerald-600">gavel</span>
                            </div>
                            1. Aceptación de los Términos
                        </h2>
                        <p className="leading-relaxed text-sm font-medium text-slate-500 pl-13">
                            Al acceder y utilizar GymTrack Pro, aceptas estar sujeto a estos términos y condiciones de uso. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder a la aplicación.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <span className="material-icons-round text-emerald-600">health_and_safety</span>
                            </div>
                            2. Descargo de Responsabilidad Médica
                        </h2>
                        <p className="leading-relaxed text-sm font-medium text-slate-500 pl-13">
                            GymTrack Pro es una herramienta de seguimiento y planificación deportiva. No proporcionamos asesoramiento médico. Siempre consulta con un profesional de la salud o un entrenador cualificado antes de comenzar cualquier nuevo programa de ejercicios.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <span className="material-icons-round text-emerald-600">verified_user</span>
                            </div>
                            3. Privacidad y Datos Personales
                        </h2>
                        <p className="leading-relaxed text-sm font-medium text-slate-500 pl-13">
                            Tu privacidad es fundamental para nosotros. Recopilamos datos básicos de perfil y métricas de entrenamiento exclusivamente para mejorar tu experiencia. No vendemos tus datos personales a terceros.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <span className="material-icons-round text-emerald-600">groups</span>
                            </div>
                            4. Comportamiento en la Comunidad
                        </h2>
                        <p className="leading-relaxed text-sm font-medium text-slate-500 pl-13">
                            Las funciones sociales de GymTrack Pro están diseñadas para fomentar la motivación. Nos reservamos el derecho de suspender cuentas que incurran en acoso o compartan contenido inapropiado.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <span className="material-icons-round text-emerald-600">workspace_premium</span>
                            </div>
                            5. Roles y Entrenadores
                        </h2>
                        <p className="leading-relaxed text-sm font-medium text-slate-500 pl-13">
                            Los usuarios con rol de "Entrenador" actúan de forma independiente. GymTrack Pro no se hace responsable de los acuerdos, pagos o rutinas específicas proporcionadas por entrenadores a través de nuestra plataforma.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} GymTrack Pro. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUse;
