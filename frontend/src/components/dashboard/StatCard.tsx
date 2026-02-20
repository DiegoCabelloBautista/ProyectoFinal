import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    unit: string;
    trend?: string;
    last?: string;
    icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, trend, last, icon }) => {
    return (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-icons-round text-primary">{icon}</span>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-100">{title}</h4>
                    <p className="text-xs text-slate-500">Actualizado: {last}</p>
                </div>
            </div>
            <div className="text-right">
                <div className="text-xl font-bold text-slate-100">{value} <span className="text-xs text-slate-400 font-normal">{unit}</span></div>
                <div className="text-xs text-primary flex items-center justify-end font-bold mt-1">
                    {trend === '¡Nuevo PR!' || trend === 'New PR!' ? (
                        <span className="bg-primary/20 px-2 py-0.5 rounded uppercase text-[10px] tracking-wider">{trend === 'New PR!' ? '¡Nuevo PR!' : trend}</span>
                    ) : (
                        <div className="flex items-center">
                            <span className="material-icons-round text-xs mr-0.5">arrow_drop_up</span>
                            {trend}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
