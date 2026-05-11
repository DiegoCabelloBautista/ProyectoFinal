import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface DayData {
    date: string;
    session_count: number;
}

const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const TrainingCalendar: React.FC = () => {
    const { user } = useAuth();
    const [heatmapData, setHeatmapData] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        analyticsApi.getHeatmap(365).then(r => {
            setHeatmapData(r.data);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    // Build a Set of trained date strings for O(1) lookup
    const trainedDates = new Set(heatmapData.map((d: DayData) => d.date?.slice(0, 10)));

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First weekday of the month (0=Sun…6=Sat → convert to Mon-based)
    const firstDay = new Date(year, month, 1).getDay();
    const offsetDays = (firstDay === 0 ? 6 : firstDay - 1); // Mon=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const today = new Date().toISOString().slice(0, 10);

    // Alert logic: days since last workout
    const lastWorkout = user?.last_workout_date;
    const daysSinceWorkout = lastWorkout
        ? Math.floor((Date.now() - new Date(lastWorkout).getTime()) / 86400000)
        : null;

    const sessionsThisMonth = heatmapData.filter(d => {
        const date = new Date(d.date);
        return date.getFullYear() === year && date.getMonth() === month;
    }).length;

    if (loading) return (
        <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
    );

    const cells: React.ReactNode[] = [];
    // Padding cells
    for (let i = 0; i < offsetDays; i++) {
        cells.push(<div key={`pad-${i}`} />);
    }
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const trained = trainedDates.has(dateStr);
        const isToday = dateStr === today;

        cells.push(
            <div key={dateStr} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all
                ${trained ? 'bg-primary text-white shadow-md shadow-emerald-500/20' : 'bg-slate-50 text-slate-400 border border-slate-100'}
                ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-white' : ''}
            `}>
                {day}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Alert banner */}
            {daysSinceWorkout !== null && daysSinceWorkout >= 3 && (
                <div className={`flex items-start gap-3 p-4 rounded-2xl border ${daysSinceWorkout >= 7
                    ? 'bg-red-50 border-red-100 text-red-600'
                    : 'bg-orange-50 border-orange-100 text-orange-600'
                }`}>
                    <span className="material-icons-round text-xl shrink-0">
                        {daysSinceWorkout >= 7 ? 'warning' : 'notifications_active'}
                    </span>
                    <div>
                        <p className="font-black text-xs uppercase tracking-tight">
                            {daysSinceWorkout >= 7 ? '¡Atención, atleta!' : 'Recordatorio'}
                        </p>
                        <p className="text-xs font-medium opacity-80 mt-0.5">
                            {daysSinceWorkout >= 7
                                ? 'Llevas una semana sin entrenar. ¡Retoma hoy!'
                                : `Llevas ${daysSinceWorkout} días sin entrenar. ¡No pierdas tu racha!`}
                        </p>
                    </div>
                </div>
            )}

            {/* Calendar card */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <button onClick={prevMonth} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                        <span className="material-icons-round text-slate-400">chevron_left</span>
                    </button>
                    <div className="text-center">
                        <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">{MONTHS[month]} {year}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">{sessionsThisMonth} sesiones</p>
                    </div>
                    <button onClick={nextMonth} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                        <span className="material-icons-round text-slate-400">chevron_right</span>
                    </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                    {DAYS_SHORT.map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase py-1">{d}</div>
                    ))}
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7 gap-1.5">
                    {cells}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-3 mt-5 px-1">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-100 border border-slate-200" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Inactivo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Activo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full ring-2 ring-primary bg-white" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Hoy</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Total', value: trainedDates.size, icon: 'fitness_center', color: 'bg-emerald-50 text-emerald-500' },
                    { label: 'Mes', value: sessionsThisMonth, icon: 'calendar_today', color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Racha', value: user?.longest_streak ?? 0, icon: 'local_fire_department', color: 'bg-orange-50 text-orange-500' },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
                        <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                            <span className="material-icons-round text-lg">{s.icon}</span>
                        </div>
                        <p className="text-lg font-black text-slate-900">{s.value}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{s.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrainingCalendar;
