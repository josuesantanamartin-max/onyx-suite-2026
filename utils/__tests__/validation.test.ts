import { describe, it, expect } from 'vitest';
import {
    validateEmail,
    validatePassword,
    validateAmount,
    validateDate,
    validateRequired,
    validateIBAN,
    validateCadastralReference
} from '../validation';

describe('validation utilities', () => {
    describe('validateEmail', () => {
        it('should validate correct email addresses', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
            expect(validateEmail('user_123@test-domain.com')).toBe(true);
        });

        it('should reject invalid email addresses', () => {
            expect(validateEmail('invalid')).toBe(false);
            expect(validateEmail('test@')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
            expect(validateEmail('test @example.com')).toBe(false);
            expect(validateEmail('')).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('should validate strong passwords', () => {
            expect(validatePassword('MyP@ssw0rd')).toBe(true);
            expect(validatePassword('Secure123!')).toBe(true);
            expect(validatePassword('C0mpl3x!Pass')).toBe(true);
        });

        it('should reject weak passwords', () => {
            expect(validatePassword('short')).toBe(false);
            expect(validatePassword('alllowercase')).toBe(false);
            expect(validatePassword('ALLUPPERCASE')).toBe(false);
            expect(validatePassword('NoNumbers!')).toBe(false);
            expect(validatePassword('NoSpecial123')).toBe(false);
            expect(validatePassword('')).toBe(false);
        });

        it('should require minimum length', () => {
            expect(validatePassword('Ab1!')).toBe(false); // Too short
            expect(validatePassword('Abcd1234!')).toBe(true); // Long enough
        });
    });

    describe('validateAmount', () => {
        it('should validate positive numbers', () => {
            expect(validateAmount(100)).toBe(true);
            expect(validateAmount(0.01)).toBe(true);
            expect(validateAmount(1000000)).toBe(true);
        });

        it('should reject invalid amounts', () => {
            expect(validateAmount(-100)).toBe(false);
            expect(validateAmount(0)).toBe(false);
            expect(validateAmount(NaN)).toBe(false);
        });

        it('should handle decimal amounts', () => {
            expect(validateAmount(99.99)).toBe(true);
            expect(validateAmount(0.5)).toBe(true);
        });
    });

    describe('validateDate', () => {
        it('should validate correct date formats', () => {
            expect(validateDate('2026-01-27')).toBe(true);
            expect(validateDate('2025-12-31')).toBe(true);
        });

        it('should reject invalid dates', () => {
            expect(validateDate('invalid')).toBe(false);
            expect(validateDate('2026-13-01')).toBe(false); // Invalid month
            expect(validateDate('2026-01-32')).toBe(false); // Invalid day
            expect(validateDate('')).toBe(false);
        });

        it('should handle Date objects', () => {
            expect(validateDate(new Date())).toBe(true);
            expect(validateDate(new Date('2026-01-27'))).toBe(true);
        });
    });

    describe('validateRequired', () => {
        it('should validate non-empty values', () => {
            expect(validateRequired('text')).toBe(true);
            expect(validateRequired('123')).toBe(true);
            expect(validateRequired(' value ')).toBe(true);
        });

        it('should reject empty values', () => {
            expect(validateRequired('')).toBe(false);
            expect(validateRequired('   ')).toBe(false);
            expect(validateRequired(null)).toBe(false);
            expect(validateRequired(undefined)).toBe(false);
        });
    });

    describe('validateIBAN', () => {
        it('should validate correct Spanish IBANs', () => {
            expect(validateIBAN('ES9121000418450200051332')).toBe(true);
            expect(validateIBAN('ES7921000813610123456789')).toBe(true);
        });

        it('should validate IBANs from other countries', () => {
            expect(validateIBAN('GB29NWBK60161331926819')).toBe(true);
            expect(validateIBAN('DE89370400440532013000')).toBe(true);
        });

        it('should reject invalid IBANs', () => {
            expect(validateIBAN('ES00000000000000000000')).toBe(false);
            expect(validateIBAN('INVALID')).toBe(false);
            expect(validateIBAN('ES12')).toBe(false); // Too short
            expect(validateIBAN('')).toBe(false);
        });

        it('should handle IBANs with spaces', () => {
            expect(validateIBAN('ES91 2100 0418 4502 0005 1332')).toBe(true);
        });
    });

    describe('validateCadastralReference', () => {
        it('should validate correct cadastral references', () => {
            expect(validateCadastralReference('1234567AB1234C0001AB')).toBe(true);
            expect(validateCadastralReference('9876543ZY9876D0002XY')).toBe(true);
        });

        it('should reject invalid cadastral references', () => {
            expect(validateCadastralReference('INVALID')).toBe(false);
            expect(validateCadastralReference('123')).toBe(false); // Too short
            expect(validateCadastralReference('')).toBe(false);
        });

        it('should handle references with spaces or dashes', () => {
            expect(validateCadastralReference('1234567 AB1234 C0001 AB')).toBe(true);
            expect(validateCadastralReference('1234567-AB1234-C0001-AB')).toBe(true);
        });
    });
});
