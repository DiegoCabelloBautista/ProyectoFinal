import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfUse: React.FC = () => {
    return (
        <div className="min-h-screen bg-bg text-slate-300 p-6 md:p-12">
            <div className="max-w-3xl mx-auto glass rounded-3xl p-8 md:p-12">
                <div className="mb-8">
                    <Link to="/register" className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors">
                        <span className="material-icons-round text-sm">arrow_back</span>
                        <span className="text-sm font-semibold">Volver</span>
                    </Link>
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-6">Términos de Uso y Política de Privacidad</h1>
                <p className="text-slate-400 mb-8">Última actualización: Mayo 2026</p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-primary">gavel</span>
                            1. Aceptación de los Términos
                        </h2>
                        <p className="leading-relaxed">
                            Al acceder y utilizar GymTrack Pro, aceptas estar sujeto a estos términos y condiciones de uso. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder a la aplicación.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-primary">health_and_safety</span>
                            2. Descargo de Responsabilidad Médica
                        </h2>
                        <p className="leading-relaxed">
                            GymTrack Pro es una herramienta de seguimiento y planificación deportiva. No proporcionamos asesoramiento médico. Siempre consulta con un profesional de la salud o un entrenador cualificado antes de comenzar cualquier nuevo programa de ejercicios, especialmente si tienes condiciones médicas preexistentes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-primary">verified_user</span>
                            3. Privacidad y Datos Personales
                        </h2>
                        <p className="leading-relaxed">
                            Tu privacidad es fundamental para nosotros. Recopilamos datos básicos de perfil y métricas de entrenamiento exclusivamente para mejorar tu experiencia en la aplicación y proporcionarte análisis de progreso. No vendemos tus datos personales a terceros.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-primary">groups</span>
                            4. Comportamiento en la Comunidad
                        </h2>
                        <p className="leading-relaxed">
                            Las funciones sociales de GymTrack Pro están diseñadas para fomentar la motivación y el apoyo mutuo. Nos reservamos el derecho de suspender o eliminar cuentas que incurran en acoso, spam o compartan contenido inapropiado.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-primary">workspace_premium</span>
                            5. Roles y Entrenadores
                        </h2>
                        <p className="leading-relaxed">
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
