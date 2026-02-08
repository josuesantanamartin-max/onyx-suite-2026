import { describe, it, expect, vi } from 'vitest';
import { parseCSV, detectCSVFormat, mapCSVColumns } from '../csvUtils';

describe('CSV utilities', () => {
    describe('parseCSV', () => {
        it('should parse basic CSV data', () => {
            const csv = 'name,amount,date\nGroceries,50.00,2026-01-27\nSalary,3000,2026-01-26';
            const result = parseCSV(csv);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                name: 'Groceries',
                amount: '50.00',
                date: '2026-01-27'
            });
        });

        it('should handle CSV with quotes', () => {
            const csv = 'name,description\n"Test, Inc","Description with, comma"';
            const result = parseCSV(csv);

            expect(result[0].name).toBe('Test, Inc');
            expect(result[0].description).toBe('Description with, comma');
        });

        it('should handle empty lines', () => {
            const csv = 'name,amount\nTest,100\n\nTest2,200';
            const result = parseCSV(csv);

            expect(result).toHaveLength(2);
        });

        it('should handle different delimiters', () => {
            const csv = 'name;amount;date\nTest;100;2026-01-27';
            const result = parseCSV(csv, ';');

            expect(result[0]).toEqual({
                name: 'Test',
                amount: '100',
                date: '2026-01-27'
            });
        });
    });

    describe('detectCSVFormat', () => {
        it('should detect comma-separated format', () => {
            const csv = 'name,amount,date\nTest,100,2026-01-27';
            expect(detectCSVFormat(csv)).toBe(',');
        });

        it('should detect semicolon-separated format', () => {
            const csv = 'name;amount;date\nTest;100;2026-01-27';
            expect(detectCSVFormat(csv)).toBe(';');
        });

        it('should detect tab-separated format', () => {
            const csv = 'name\tamount\tdate\nTest\t100\t2026-01-27';
            expect(detectCSVFormat(csv)).toBe('\t');
        });

        it('should default to comma if unclear', () => {
            const csv = 'name amount date\nTest 100 2026-01-27';
            expect(detectCSVFormat(csv)).toBe(',');
        });
    });

    describe('mapCSVColumns', () => {
        it('should map columns correctly', () => {
            const data = [
                { 'Fecha': '2026-01-27', 'Concepto': 'Test', 'Importe': '100' }
            ];

            const mapping = {
                'Fecha': 'date',
                'Concepto': 'description',
                'Importe': 'amount'
            };

            const result = mapCSVColumns(data, mapping);

            expect(result[0]).toEqual({
                date: '2026-01-27',
                description: 'Test',
                amount: '100'
            });
        });

        it('should handle missing columns', () => {
            const data = [
                { 'Fecha': '2026-01-27', 'Concepto': 'Test' }
            ];

            const mapping = {
                'Fecha': 'date',
                'Concepto': 'description',
                'Importe': 'amount'
            };

            const result = mapCSVColumns(data, mapping);

            expect(result[0].date).toBe('2026-01-27');
            expect(result[0].description).toBe('Test');
            expect(result[0].amount).toBeUndefined();
        });

        it('should preserve unmapped columns', () => {
            const data = [
                { 'Fecha': '2026-01-27', 'Extra': 'value' }
            ];

            const mapping = {
                'Fecha': 'date'
            };

            const result = mapCSVColumns(data, mapping, true);

            expect(result[0].date).toBe('2026-01-27');
            expect(result[0].Extra).toBe('value');
        });
    });
});
