import React, { useState, useEffect } from 'react';
import { useRetirementStore } from '../../../store/useRetirementStore';
import { retirementCalculator } from '../../../utils/retirementCalculator';
import { RetirementPlan } from '../../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calculator, TrendingUp, AlertCircle, Save, RefreshCw } from 'lucide-react';

export const RetirementSimulator: React.FC = () => {
    const { plans, createPlan, updatePlan, activePlanId, setActivePlan } = useRetirementStore();

    // Local state for simulation (detached from store until saved)
    const [formData, setFormData] = useState({
        currentAge: 30,
        targetAge: 65,
        currentSavings: 10000,
        monthlyContribution: 500,
        expectedReturn: 7, // %
        inflationRate: 3, // %
        targetMonthlyIncome: 2000
    });

    const [projectionData, setProjectionData] = useState<any[]>([]);
    const [result, setResult] = useState<any>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [planName, setPlanName] = useState("Mi Plan de Jubilación");

    // Load active plan if exists
    useEffect(() => {
        if (activePlanId) {
            const plan = plans.find(p => p.id === activePlanId);
            if (plan) {
                setFormData({
                    currentAge: plan.currentAge,
                    targetAge: plan.targetAge,
                    currentSavings: plan.currentSavings,
                    monthlyContribution: plan.monthlyContribution,
                    expectedReturn: plan.expectedReturn,
                    inflationRate: plan.inflationRate,
                    targetMonthlyIncome: plan.targetMonthlyIncome
                });
                setPlanName(plan.name);
            }
        }
    }, [activePlanId, plans]);

    // Recalculate on change
    useEffect(() => {
        calculateProjection();
    }, [formData]);

    const calculateProjection = () => {
        const { currentAge, targetAge, currentSavings, monthlyContribution, expectedReturn, inflationRate, targetMonthlyIncome } = formData;

        // 1. Calculate Summary Metrics
        const projection = retirementCalculator.calculate(
            currentAge, targetAge, currentSavings, monthlyContribution, expectedReturn, inflationRate, targetMonthlyIncome
        );
        setResult(projection);

        // 2. Generate Chart Data (Year by Year)
        const years = [];
        const realAnnualRate = ((1 + expectedReturn / 100) / (1 + inflationRate / 100)) - 1;
        let balance = currentSavings;

        // Accumulation Phase
        for (let age = currentAge; age <= targetAge; age++) {
            years.push({
                age,
                accumulation: Math.round(balance),
                drawdown: null,
                phase: 'Acumulación'
            });
            // Add interest + contributions
            balance = balance * (1 + realAnnualRate) + (monthlyContribution * 12);
        }

        // Decumulation Phase (Drawdown)
        let drawdownBalance = years[years.length - 1].accumulation;
        // Limit to 100 years old or when money runs out
        for (let age = targetAge + 1; age <= 100; age++) {
            // Subtract annual income needs, balance continues to grow
            drawdownBalance = drawdownBalance * (1 + realAnnualRate) - (targetMonthlyIncome * 12);
            if (drawdownBalance < 0) drawdownBalance = 0;

            years.push({
                age,
                accumulation: null,
                drawdown: Math.round(drawdownBalance),
                phase: 'Retiro'
            });

            if (drawdownBalance === 0) break;
        }

        setProjectionData(years);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSave = async () => {
        if (activePlanId) {
            await updatePlan(activePlanId, { name: planName, ...formData });
        } else {
            await createPlan({ name: planName, ...formData });
        }
        setShowSaveModal(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-onyx-500" />
                        Planificador de Jubilación
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Simula tu futuro financiero con ajuste de inflación real.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSaveModal(true)}
                        className="bg-onyx-600 hover:bg-onyx-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {activePlanId ? 'Actualizar Plan' : 'Guardar Plan'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inputs */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-1 space-y-6">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 mb-4">Parámetros</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Edad Actual" name="currentAge" value={formData.currentAge} onChange={handleInputChange} min={18} max={100} />
                        <InputGroup label="Edad Retiro" name="targetAge" value={formData.targetAge} onChange={handleInputChange} min={formData.currentAge + 1} max={100} />
                    </div>

                    <InputGroup label="Ahorro Actual" name="currentSavings" value={formData.currentSavings} onChange={handleInputChange} prefix="€" step={100} />
                    <InputGroup label="Aportación Mensual" name="monthlyContribution" value={formData.monthlyContribution} onChange={handleInputChange} prefix="€" step={50} />

                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Retorno Esperado (%)" name="expectedReturn" value={formData.expectedReturn} onChange={handleInputChange} step={0.1} />
                        <InputGroup label="Inflación Estimada (%)" name="inflationRate" value={formData.inflationRate} onChange={handleInputChange} step={0.1} />
                    </div>

                    <InputGroup label="Ingreso Mensual Deseado (Valor Presente)" name="targetMonthlyIncome" value={formData.targetMonthlyIncome} onChange={handleInputChange} prefix="€" step={100} />

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300 flex gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>Los cálculos usan "Valor Real" (poder adquisitivo de hoy), descontando la inflación automáticamente.</p>
                    </div>
                </div>

                {/* Visualization */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                            title="Capital Acumulado"
                            value={`${result?.totalSavings.toLocaleString()}€`}
                            subtitle="A la edad de retiro (Valor Real)"
                            icon={<TrendingUp className="text-green-500" />}
                        />
                        <MetricCard
                            title="Ingreso Mensual Sostenible"
                            value={`${result?.monthlyIncome.toLocaleString()}€`}
                            subtitle="Sin tocar el capital (Regla 4%)"
                            icon={<RefreshCw className="text-blue-500" />}
                        />
                        <MetricCard
                            title="Años de Cobertura"
                            value={result?.yearsOfFunding > 50 ? "> 50 años" : `${result?.yearsOfFunding} años`}
                            subtitle={`Extrayendo ${formData.targetMonthlyIncome}€/mes y reinvirtiendo el resto`}
                            icon={result?.yearsOfFunding < 20 ? <AlertCircle className="text-red-500" /> : <Save className="text-green-500" />}
                            highlight={result?.yearsOfFunding < 25}
                        />
                    </div>

                    {/* Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-96">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Proyección Patrimonio</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={projectionData}>
                                <defs>
                                    <linearGradient id="colorAccumulation" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="age" label={{ value: 'Edad', position: 'insideBottomRight', offset: -5 }} stroke="#9CA3AF" />
                                <YAxis tickFormatter={(val) => `${val / 1000}k`} stroke="#9CA3AF" />
                                <Tooltip
                                    formatter={(val: any, name: any) => [
                                        `${(val || 0).toLocaleString()}€`,
                                        name === 'accumulation' ? 'Ahorro Acumulado' : 'Capital en Retiro'
                                    ]}
                                    labelFormatter={(label, payload) => {
                                        const phase = payload[0]?.payload?.phase;
                                        return `Edad: ${label} (${phase})`;
                                    }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="accumulation"
                                    stroke="#4F46E5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAccumulation)"
                                    name="accumulation"
                                    activeDot={{ r: 6 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="drawdown"
                                    stroke="#F59E0B"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorDrawdown)"
                                    name="drawdown"
                                    activeDot={{ r: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Recommendations */}
                    {result && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Análisis</h3>
                            <ul className="space-y-2">
                                {retirementCalculator.getRecommendations(result, formData.targetMonthlyIncome).map((rec, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-onyx-500 flex-shrink-0" />
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Guardar Plan</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Plan</label>
                                <input
                                    type="text"
                                    value={planName}
                                    onChange={(e) => setPlanName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-onyx-500 outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-onyx-600 text-white rounded-lg hover:bg-onyx-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputGroup = ({ label, name, value, onChange, prefix, ...props }: any) => (
    <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</label>
        <div className="relative">
            {prefix && <span className="absolute left-3 top-2.5 text-gray-400">{prefix}</span>}
            <input
                name={name}
                type="number"
                value={value}
                onChange={onChange}
                className={`w-full ${prefix ? 'pl-7' : 'px-3'} py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-onyx-500 outline-none transition-all`}
                {...props}
            />
        </div>
    </div>
);

const MetricCard = ({ title, value, subtitle, icon, highlight }: any) => (
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'} shadow-sm`}>
        <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</span>
            {icon}
        </div>
        <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {value}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">
            {subtitle}
        </div>
    </div>
);
