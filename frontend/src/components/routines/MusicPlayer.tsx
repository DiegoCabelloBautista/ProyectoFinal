import React, { useState } from 'react';
import { routinesApi } from '../../services/api';
import { Music, ExternalLink, X } from 'lucide-react';

interface MusicPlayerProps {
    routineId: number;
    musicUrl: string | null;
    onUpdate: (url: string) => void;
}

// Detect platform and extract embed URL
const getEmbedInfo = (url: string): { type: 'spotify' | 'youtube' | 'unknown'; embedUrl: string } => {
    if (!url) return { type: 'unknown', embedUrl: '' };

    // Spotify track/playlist/album
    const spotifyMatch = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (spotifyMatch) {
        return {
            type: 'spotify',
            embedUrl: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&theme=0`
        };
    }

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
        return {
            type: 'youtube',
            embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0`
        };
    }

    return { type: 'unknown', embedUrl: url };
};

const MusicPlayer: React.FC<MusicPlayerProps> = ({ routineId, musicUrl, onUpdate }) => {
    const [editing, setEditing] = useState(false);
    const [inputUrl, setInputUrl] = useState(musicUrl ?? '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await routinesApi.updateMusic(routineId, inputUrl);
            onUpdate(inputUrl);
            setEditing(false);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        setSaving(true);
        try {
            await routinesApi.updateMusic(routineId, '');
            onUpdate('');
            setInputUrl('');
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const { type, embedUrl } = musicUrl ? getEmbedInfo(musicUrl) : { type: 'unknown', embedUrl: '' };

    return (
        <div className="mt-3 space-y-3">
            {/* Player */}
            {musicUrl && embedUrl && type !== 'unknown' && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                    {type === 'spotify' ? (
                        <iframe
                            src={embedUrl}
                            width="100%"
                            height="80"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            style={{ border: 0 }}
                        />
                    ) : (
                        <iframe
                            src={embedUrl}
                            width="100%"
                            height="200"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                            style={{ border: 0 }}
                        />
                    )}
                </div>
            )}

            {musicUrl && type === 'unknown' && (
                <a href={musicUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline">
                    <ExternalLink className="w-3 h-3" /> Abrir música externa
                </a>
            )}

            {/* Edit controls */}
            {editing ? (
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={inputUrl}
                        onChange={e => setInputUrl(e.target.value)}
                        placeholder="Spotify/YouTube URL..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-primary transition-all shadow-inner"
                    />
                    <button onClick={handleSave} disabled={saving}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50 active:scale-95">
                        {saving ? '...' : 'OK'}
                    </button>
                    <button onClick={() => setEditing(false)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-all active:scale-95 border border-slate-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                            musicUrl
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 shadow-sm'
                                : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-primary/30 hover:text-primary shadow-sm'
                        }`}>
                        <Music className="w-3.5 h-3.5" />
                        {musicUrl ? 'Cambiar' : 'Añadir Música'}
                    </button>
                    {musicUrl && (
                        <button onClick={handleRemove} disabled={saving}
                            className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white border border-red-100 transition-all active:scale-95 shadow-sm">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MusicPlayer;
