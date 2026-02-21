import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface MacroChartProps {
    data: {
        protein: number;
        carbs: number;
        fat: number;
    };
    title?: string;
}

export const MacroChart: React.FC<MacroChartProps> = ({ data, title }) => {
    // Normalize data for Radar Chart (assuming 100 as a peak for visualization)
    const chartData = [
        { subject: 'Proteína', A: data.protein, fullMark: 100 },
        { subject: 'Carbohidratos', A: data.carbs, fullMark: 100 },
        { subject: 'Grasas', A: data.fat, fullMark: 100 },
    ];

    return (
        <div className="w-full h-[220px] bg-white/40 backdrop-blur-sm rounded-3xl p-4 border border-white/60 shadow-sm transition-all hover:shadow-md">
            {title && (
                <div className="mb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-900/50">{title}</h4>
                </div>
            )}
            <ResponsiveContainer width="100%" height="85%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#064e3b', fontSize: 10, fontWeight: 800 }}
                    />
                    <Radar
                        name="Macros"
                        dataKey="A"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px'
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
