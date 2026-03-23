import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communityApi } from '../../services/api';
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

    if (loading) return <div className="min-h-screen bg-[#0A0D14] text-white flex items-center justify-center">Cargando perfil...</div>;
    if (!profile) return <div className="min-h-screen bg-[#0A0D14] text-white flex items-center justify-center">Usuario no encontrado</div>;

    return (
        <div className="min-h-screen pb-28 text-slate-100" style={{ background: '#0A0D14' }}>
            {/* Header / Nav */}
            <div className="px-6 pt-12 pb-6 border-b border-white/10 sticky top-0 bg-[#0A0D14]/90 backdrop-blur-md z-40 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-white/5 active:scale-95 transition-all">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold tracking-tight">Perfil de Atleta</h1>
            </div>

            {/* Profile Info */}
            <div className="px-6 py-8 flex flex-col items-center">
                <div 
                    className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl mb-4 relative" 
                    style={{ background: 'rgba(139,92,246,0.15)', border: `2px solid ${profile.username_color || '#00C9FF'}` }}
                >
                    <span className="material-icons-round text-primary text-5xl">
                        {profile.avatar_icon || 'person'}
                    </span>
                    <div className="absolute -bottom-3 -right-2 bg-background-dark border border-white/10 px-2 py-0.5 rounded-lg text-xs font-bold text-slate-300">
                        Nv.{profile.level}
                    </div>
                </div>
                
                <h2 className="text-2xl font-black mb-1" style={{ color: profile.username_color || '#00C9FF' }}>
                    {profile.username}
                </h2>
                
                {profile.title && (
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-slate-400 mb-6">
                        {profile.title}
                    </span>
                )}

                <div className="flex items-center gap-8 mb-8 w-full justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{profile.followers_count}</div>
                        <div className="text-xs text-slate-500 font-medium">Seguidores</div>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{profile.following_count}</div>
                        <div className="text-xs text-slate-500 font-medium">Siguiendo</div>
                    </div>
                </div>

                {!profile.is_own_profile && (
                    <button 
                        onClick={handleFollow}
                        disabled={actionLoading}
                        className={`w-full py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${
                            profile.is_followed 
                            ? 'bg-white/10 text-white' 
                            : 'bg-primary text-background-dark'
                        }`}
                    >
                        {profile.is_followed ? (
                            <><UserCheck className="w-5 h-5"/> Siguiendo</>
                        ) : (
                            <><Users className="w-5 h-5"/> Seguir a {profile.username}</>
                        )}
                    </button>
                )}
            </div>

            {/* User Routines */}
            <div className="px-6 mt-4">
                <h3 className="font-bold text-lg mb-4 text-slate-200">Rutinas Públicas ({profile.routines.length})</h3>
                <div className="space-y-4">
                    {profile.routines.map((routine: any) => (
                        <div key={routine.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-base text-slate-100 truncate">{routine.name}</h4>
                                    {routine.description && (
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{routine.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 text-slate-400 border border-white/10">
                                    <Heart className="w-3.5 h-3.5" />
                                    {routine.likes}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4 text-[10px] text-slate-500">
                                <span>{routine.exercise_count} ejercicios</span>
                                <span>·</span>
                                <span>{new Date(routine.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                    {profile.routines.length === 0 && (
                        <div className="text-center py-8 text-sm text-slate-500 font-medium border border-dashed border-white/10 rounded-2xl">
                            Este atleta no tiene rutinas públicas aún.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
