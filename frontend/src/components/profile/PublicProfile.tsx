import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communityApi, BASE_URL } from '../../services/api';
import { ChevronLeft, Users, UserCheck, Heart } from 'lucide-react';

export default function PublicProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await communityApi.getUserProfile(Number(id));
                setProfile(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleFollow = async () => {
        if (actionLoading || !profile) return;
        setActionLoading(true);
        try {
            const res = await communityApi.toggleFollow(profile.id);
            setProfile({ 
                ...profile, 
                is_followed: res.data.following,
                followers_count: res.data.followers_count 
            });
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
            <div>
                <span className="material-icons-round text-red-500 text-6xl mb-4">error_outline</span>
                <h2 className="text-xl font-bold text-slate-900">Usuario no encontrado</h2>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold uppercase tracking-widest text-xs">Volver</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-slate-900 pb-24 relative overflow-hidden">
            {/* Orbs de fondo */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="orb w-96 h-96" style={{ background: '#10B981', top: '-10%', right: '-10%', opacity: 0.1 }} />
                <div className="orb w-80 h-80" style={{ background: '#3B82F6', bottom: '10%', left: '-5%', opacity: 0.08 }} />
            </div>

            {/* Header / Nav */}
            <div className="px-6 pt-12 pb-6 sticky top-0 bg-white/80 backdrop-blur-xl z-40 flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 -ml-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">Perfil de Atleta</h1>
            </div>

            {/* Profile Info */}
            <div className="px-6 py-8 flex flex-col items-center relative z-10">
                <div 
                    className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl mb-6 relative overflow-hidden transition-transform hover:scale-105" 
                    style={{ 
                        background: profile.avatar_url ? 'none' : `linear-gradient(135deg, ${profile.username_color || '#10B981'}, #60A5FA)`, 
                        border: `4px solid white`,
                        boxShadow: `0 12px 40px -8px ${profile.username_color || '#10B981'}40`
                    }}
                >
                    {profile.avatar_url ? (
                        <img 
                            src={`${BASE_URL}${profile.avatar_url}?t=${new Date().getTime()}`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="material-icons-round text-white text-5xl">
                            {profile.avatar_icon || 'person'}
                        </span>
                    )}
                </div>
                
                <h2 className="text-3xl font-black mb-1 tracking-tight" style={{ color: profile.username_color || '#10B981' }}>
                    {profile.username}
                </h2>
                
                {profile.title && (
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-6 shadow-sm">
                        {profile.title}
                    </span>
                )}

                {/* Stats Grid */}
                <div className="flex gap-4 mb-8 w-full max-w-xs">
                    <div className="flex-1 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm text-center">
                        <div className="text-2xl font-black text-slate-900">{profile.followers_count}</div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Seguidores</div>
                    </div>
                    <div className="flex-1 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm text-center">
                        <div className="text-2xl font-black text-slate-900">{profile.following_count}</div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Siguiendo</div>
                    </div>
                    <div className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-3xl shadow-sm text-center">
                        <div className="text-2xl font-black text-emerald-600">{profile.level}</div>
                        <div className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Nivel</div>
                    </div>
                </div>

                {!profile.is_own_profile && (
                    <button 
                        onClick={handleFollow}
                        disabled={actionLoading}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                            profile.is_followed 
                            ? 'bg-slate-100 text-slate-600 border border-slate-200 shadow-slate-200/20' 
                            : 'bg-primary text-white shadow-emerald-500/20'
                        }`}
                    >
                        {profile.is_followed ? (
                            <><UserCheck className="w-5 h-5"/> Siguiendo</>
                        ) : (
                            <><Users className="w-5 h-5"/> Seguir Atleta</>
                        )}
                    </button>
                )}
            </div>

            {/* User Routines */}
            <div className="px-6 mt-4 relative z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Rutinas Públicas ({profile.routines.length})
                </h3>
                
                <div className="space-y-4">
                    {profile.routines.map((routine: any) => (
                        <div key={routine.id} className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:border-primary/30 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[2.5rem] -mr-6 -mt-6 transition-transform group-hover:scale-110" />
                            
                            <div className="relative z-10">
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-lg text-slate-900 truncate tracking-tight">{routine.name}</h4>
                                        {routine.description && (
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{routine.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                                        <Heart className="w-3.5 h-3.5 fill-current" />
                                        {routine.likes}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <span className="material-icons-round text-xs">fitness_center</span>
                                        {routine.exercise_count} EJERCICIOS
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-icons-round text-xs">calendar_today</span>
                                        {new Date(routine.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {profile.routines.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem]">
                            <span className="material-icons-round text-slate-300 text-4xl mb-2">history_edu</span>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Este atleta aún no ha compartido rutinas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
}
