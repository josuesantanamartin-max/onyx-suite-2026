import { describe, it, expect } from 'vitest';
import { retirementCalculator } from '../retirementCalculator';

describe('RetirementCalculator', () => {
    describe('calculate', () => {
        it('should calculate retirement projection with basic inputs', () => {
            const result = retirementCalculator.calculate(
                30, // currentAge
                65, // targetAge
                10000, // currentSavings
                500, // monthlyContribution
                7, // expectedReturn (7%)
                2, // inflationRate (2%)
                2000 // targetMonthlyIncome
            );

            expect(result.totalSavings).toBeGreaterThan(0);
            expect(result.monthlyIncome).toBeGreaterThan(0);
            expect(result.yearsOfFunding).toBeGreaterThan(0);
        });

        it('should handle zero current savings', () => {
            const result = retirementCalculator.calculate(
                25, 65, 0, 1000, 7, 2, 3000
            );

            expect(result.totalSavings).toBeGreaterThan(0);
            expect(result.yearsOfFunding).toBeGreaterThan(0);
        });

        it('should handle zero monthly contribution', () => {
            const result = retirementCalculator.calculate(
                40, 65, 100000, 0, 7, 2, 2000
            );

            expect(result.totalSavings).toBeGreaterThan(0);
            expect(result.monthlyIncome).toBeGreaterThan(0);
        });

        it('should calculate with high return rate', () => {
            const result = retirementCalculator.calculate(
                30, 65, 50000, 1000, 10, 2, 3000
            );

            expect(result.totalSavings).toBeGreaterThan(50000);
            expect(result.yearsOfFunding).toBeGreaterThan(0);
        });

        it('should calculate with low return rate', () => {
            const result = retirementCalculator.calculate(
                30, 65, 50000, 1000, 3, 2, 3000
            );

            expect(result.totalSavings).toBeGreaterThan(0);
            expect(result.monthlyIncome).toBeGreaterThan(0);
        });

        it('should handle high inflation rate', () => {
            const result = retirementCalculator.calculate(
                30, 65, 50000, 1000, 7, 5, 3000
            );

            expect(result.totalSavings).toBeGreaterThan(0);
            expect(result.yearsOfFunding).toBeGreaterThan(0);
        });

        it('should calculate sustainable monthly income (4% rule)', () => {
            const result = retirementCalculator.calculate(
                30, 65, 50000, 1000, 7, 2, 2000
            );

            // 4% rule: monthlyIncome should be approximately (totalSavings * 0.04) / 12
            const expected4PercentIncome = (result.totalSavings * 0.04) / 12;
            expect(result.monthlyIncome).toBeCloseTo(expected4PercentIncome, 0);
        });

        it('should handle short investment period', () => {
            const result = retirementCalculator.calculate(
                60, 65, 100000, 2000, 5, 2, 3000
            );

            expect(result.totalSavings).toBeGreaterThan(100000);
            expect(result.yearsOfFunding).toBeGreaterThan(0);
        });

        it('should handle long investment period', () => {
            const result = retirementCalculator.calculate(
                20, 65, 5000, 500, 7, 2, 2500
            );

            expect(result.totalSavings).toBeGreaterThan(5000);
            expect(result.yearsOfFunding).toBeGreaterThan(0);
        });

        it('should return "forever" funding when returns exceed withdrawals', () => {
            const result = retirementCalculator.calculate(
                30, 65, 10000, 5000, 12, 2, 1000
            );

            // With high contributions and returns, should last very long
            expect(result.yearsOfFunding).toBeGreaterThan(100);
        });

        it('should handle zero real rate (inflation equals return)', () => {
            const result = retirementCalculator.calculate(
                30, 65, 50000, 1000, 5, 5, 2000
            );

            expect(result.totalSavings).toBeGreaterThan(0);
            expect(result.yearsOfFunding).toBeGreaterThan(0);
        });

        it('should handle negative savings (expenses exceed income)', () => {
            const result = retirementCalculator.calculate(
                55, 65, 0, 0, 5, 2, 3000
            );

            expect(result.totalSavings).toBe(0);
            expect(result.yearsOfFunding).toBe(0);
        });

        it('should round results appropriately', () => {
            const result = retirementCalculator.calculate(
                30, 65, 10000, 500, 7, 2, 2000
            );

            // totalSavings and monthlyIncome should be rounded to integers
            expect(Number.isInteger(result.totalSavings)).toBe(true);
            expect(Number.isInteger(result.monthlyIncome)).toBe(true);

            // yearsOfFunding should have at most 1 decimal place
            expect(result.yearsOfFunding.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
        });
    });

    describe('getRecommendations', () => {
        it('should provide positive feedback for sustainable plans', () => {
            const projection = {
                totalSavings: 1000000,
                monthlyIncome: 3500,
                yearsOfFunding: 35,
            };

            const recommendations = retirementCalculator.getRecommendations(projection, 3000);

            expect(recommendations).toContain(expect.stringContaining('buen camino'));
            expect(recommendations.length).toBeGreaterThan(0);
        });

        it('should suggest increasing contributions when there is a gap', () => {
            const projection = {
                totalSavings: 300000,
                monthlyIncome: 1500,
                yearsOfFunding: 15,
            };

            const recommendations = retirementCalculator.getRecommendations(projection, 2500);

            expect(recommendations.some(r => r.includes('aumentar'))).toBe(true);
            expect(recommendations.some(r => r.includes('brecha'))).toBe(true);
        });

        it('should provide years of coverage information', () => {
            const projection = {
                totalSavings: 500000,
                monthlyIncome: 2000,
                yearsOfFunding: 20,
            };

            const recommendations = retirementCalculator.getRecommendations(projection, 2500);

            expect(recommendations.some(r => r.includes('20 años'))).toBe(true);
        });

        it('should always include annual review recommendation', () => {
            const projection = {
                totalSavings: 100000,
                monthlyIncome: 500,
                yearsOfFunding: 10,
            };

            const recommendations = retirementCalculator.getRecommendations(projection, 1000);

            expect(recommendations.some(r => r.includes('anualmente'))).toBe(true);
        });

        it('should not suggest increasing contributions when income meets target', () => {
            const projection = {
                totalSavings: 1000000,
                monthlyIncome: 3500,
                yearsOfFunding: 35,
            };

            const recommendations = retirementCalculator.getRecommendations(projection, 3000);

            expect(recommendations.some(r => r.includes('brecha'))).toBe(false);
        });

        it('should handle edge case with very low funding years', () => {
            const projection = {
                totalSavings: 50000,
                monthlyIncome: 200,
                yearsOfFunding: 2,
            };

            const recommendations = retirementCalculator.getRecommendations(projection, 2000);

            expect(recommendations.some(r => r.includes('2 años'))).toBe(true);
            expect(recommendations.length).toBeGreaterThan(1);
        });
    });

    describe('Edge cases and validation', () => {
        it('should handle very large numbers', () => {
            const result = retirementCalculator.calculate(
                25, 65, 1000000, 10000, 8, 2, 5000
            );

            expect(result.totalSavings).toBeGreaterThan(1000000);
            expect(isFinite(result.totalSavings)).toBe(true);
        });

        it('should handle very small contributions', () => {
            const result = retirementCalculator.calculate(
                30, 65, 1000, 10, 5, 2, 1500
            );

            expect(result.totalSavings).toBeGreaterThan(0);
            expect(result.yearsOfFunding).toBeGreaterThan(0);
        });

        it('should handle zero target monthly income', () => {
            const result = retirementCalculator.calculate(
                30, 65, 50000, 1000, 7, 2, 0
            );

            expect(result.totalSavings).toBeGreaterThan(0);
            // With zero target income, funding should be "infinite"
            expect(result.yearsOfFunding).toBeGreaterThan(100);
        });
    });
});
