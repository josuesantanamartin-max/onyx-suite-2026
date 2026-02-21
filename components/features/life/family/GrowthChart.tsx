import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { GrowthRecord } from '../../../../types';

interface GrowthChartProps {
    data: GrowthRecord[];
    name: string;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ data, name }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Sin datos de crecimiento</p>
                <p className="text-gray-300 text-xs mt-1">Añade registros para ver la progresión</p>
            </div>
        );
    }

    // Format data for Recharts
    const chartData = data.map(record => ({
        ...record,
        formattedDate: new Date(record.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
    }));

    return (
        <div className="h-72 w-full bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Crecimiento: {name}</h4>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="formattedDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#059669', fontSize: 10, fontWeight: 700 }}
                        unit="cm"
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#3B82F6', fontSize: 10, fontWeight: 700 }}
                        unit="kg"
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    />
                    <Legend iconType="circle" />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="height"
                        name="Altura"
                        stroke="#059669"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="weight"
                        name="Peso"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
