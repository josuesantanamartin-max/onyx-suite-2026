import { RetirementProjection, RetirementPlan } from '../types';

export const retirementCalculator = {
    /**
     * Calculates the retirement projection based on inputs.
     * Based on compound interest formula with monthly contributions.
     */
    calculate: (
        currentAge: number,
        targetAge: number,
        currentSavings: number,
        monthlyContribution: number,
        expectedReturn: number, // Annual %
        inflationRate: number, // Annual %
        targetMonthlyIncome: number
    ): RetirementProjection => {
        const yearsToInvest = targetAge - currentAge;
        const months = yearsToInvest * 12;

        // Real Return Rate (Fisher Equation approximation)
        // (1 + nominal) = (1 + real) * (1 + inflation) => real = (1 + nominal)/(1 + inflation) - 1
        const nominalRate = expectedReturn / 100;
        const inflation = inflationRate / 100;
        const realRate = (1 + nominalRate) / (1 + inflation) - 1;
        const monthlyRealRate = realRate / 12;

        let totalSavings = currentSavings;

        // Future Value of Current Savings
        totalSavings = currentSavings * Math.pow(1 + monthlyRealRate, months);

        // Future Value of Series (Contributions)
        // PMT * [((1 + r)^n - 1) / r]
        if (monthlyRealRate !== 0) {
            totalSavings += monthlyContribution * ((Math.pow(1 + monthlyRealRate, months) - 1) / monthlyRealRate);
        } else {
            totalSavings += monthlyContribution * months;
        }

        // Determine how long this capital lasts
        // Withdrawal phase: how many years can we withdraw 'targetMonthlyIncome' (adjusted for inflation is implicitly handled by using real rates above? No, we projected everything to Future Value in today's purchasing power if we assumed inputs were 'real'.
        // If inputs are nominal, we should adjust targetMonthlyIncome for inflation during accumulation to see nominal need.
        // simpler approach: Use Real Return for everything. user inputs "Target Income in Today's Money".
        // So 'totalSavings' is in "Today's Money" (Real Value).

        // Years of Funding = NPER(rate, -pmt, pv)
        // How many months can we support targetMonthlyIncome?
        // PV = totalSavings
        // PMT = -targetMonthlyIncome
        // i = monthlyRealRate
        // Formula for N = -ln(1 - (PV * i / PMT)) / ln(1 + i)
        // derived from PV = PMT * (1 - (1+i)^-n) / i

        let monthsOfFunding = 0;

        if (totalSavings <= 0) {
            monthsOfFunding = 0;
        } else if (monthlyRealRate === 0) {
            monthsOfFunding = totalSavings / targetMonthlyIncome;
        } else {
            if (totalSavings * monthlyRealRate >= targetMonthlyIncome) {
                // If interest generated is enough to cover withdrawal, capital lasts forever
                monthsOfFunding = 999 * 12; // "Forever"
            } else {
                // Standard NPER formula: considers that the remaining balance 
                // continues to grow at 'monthlyRealRate' while withdrawals happen
                monthsOfFunding = -Math.log(1 - (totalSavings * monthlyRealRate / targetMonthlyIncome)) / Math.log(1 + monthlyRealRate);
            }
        }

        if (isNaN(monthsOfFunding) || monthsOfFunding < 0) monthsOfFunding = 0;

        // Safe Withdrawal Rate (4% Rule) implication
        const sustainableMonthlyIncome = (totalSavings * 0.04) / 12;

        return {
            totalSavings: Math.round(totalSavings),
            monthlyIncome: Math.round(sustainableMonthlyIncome),
            yearsOfFunding: parseFloat((monthsOfFunding / 12).toFixed(1)),
        };
    },

    /**
     * Generates recommendations based on the gap.
     */
    getRecommendations: (
        projection: RetirementProjection,
        targetMonthlyIncome: number
    ): string[] => {
        const recommendations: string[] = [];

        if (projection.yearsOfFunding >= 30) {
            recommendations.push("¡Vas por buen camino! Tu plan parece sostenible para más de 30 años.");
        } else {
            recommendations.push(`Tu ahorro actual cubre aproximadamente ${projection.yearsOfFunding} años de jubilación.`);

            const gap = targetMonthlyIncome - projection.monthlyIncome;
            if (gap > 0) {
                recommendations.push(`Considera aumentar tu contribución mensual para cubrir la brecha de ${gap.toFixed(0)}€/mes.`);
            }
        }

        // Generic advice
        recommendations.push("Revisa este plan anualmente para ajustar inflación y cambios en ingresos.");

        return recommendations;
    }
};
