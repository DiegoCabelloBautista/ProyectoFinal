import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { analyticsApi } from '../../services/api';

const ProgressChart: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalVolume, setTotalVolume] = useState(0);
    const [trend, setTrend] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await analyticsApi.getWeeklyVolume(4);
            const weeklyData = response.data;

            if (weeklyData.length > 0) {
                const total = weeklyData.reduce((sum: number, item: any) => sum + item.volume, 0);
                setTotalVolume(total);

                // Calcular tendencia (comparar última semana con promedio)
                if (weeklyData.length >= 2) {
                    const lastWeek = weeklyData[weeklyData.length - 1].volume;
                    const previousWeeks = weeklyData.slice(0, -1);
                    const average = previousWeeks.reduce((sum: number, item: any) => sum + item.volume, 0) / previousWeeks.length;
                    const trendPercent = ((lastWeek - average) / average) * 100;
                    setTrend(trendPercent);
                }

                setData(weeklyData);
            }
        } catch (error) {
            console.error('Error loading chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
            <div className="flex items-end justify-between mb-6">
                <div>
                    <p className="text-sm text-slate-400">Volumen Total</p>
                    <h3 className="text-3xl font-bold">
                        {totalVolume > 1000
                            ? `${(totalVolume / 1000).toFixed(1)}`
                            : totalVolume.toFixed(0)
                        }
                        <span className="text-sm font-normal text-slate-500 ml-1">
                            {totalVolume > 1000 ? 'toneladas' : 'kg'}
                        </span>
                    </h3>
                </div>
                {trend !== 0 && (
                    <div className="text-right">
                        <span className={`flex items-center text-sm font-bold ${trend > 0 ? 'text-primary' : 'text-red-500'}`}>
                            <span className="material-icons-round text-sm mr-1">
                                {trend > 0 ? 'trending_up' : 'trending_down'}
                            </span>
                            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>

            {data.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-slate-500">
                    <p>No hay datos de volumen aún</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={data}>
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#00C9FF" />
                                <stop offset="100%" stopColor="#92FE9D" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis
                            dataKey="week"
                            stroke="#94a3b8"
                            fontSize={11}
                            tick={{ fill: '#94a3b8' }}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tick={{ fill: '#94a3b8' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '12px',
                                fontSize: '12px'
                            }}
                            labelStyle={{ color: '#00C9FF' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="volume"
                            stroke="url(#lineGradient)"
                            strokeWidth={3}
                            dot={{ fill: '#00C9FF', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default ProgressChart;

