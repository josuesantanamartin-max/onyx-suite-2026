import { describe, it, expect } from 'vitest';
import { accountSchema, validateAccount } from '../account.schema';

describe('Account Schema', () => {
    describe('Cuentas Válidas', () => {
        it('debe validar una cuenta bancaria completa', () => {
            const validAccount = {
                name: 'Cuenta Corriente Principal',
                bankName: 'Banco Santander',
                type: 'BANK',
                balance: 5000.50,
                currency: 'EUR',
                isRemunerated: true,
                tae: 2.5,
            };

            const result = validateAccount(validAccount);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe('Cuenta Corriente Principal');
                expect(result.data.balance).toBe(5000.50);
            }
        });

        it('debe validar una cuenta de inversión', () => {
            const investmentAccount = {
                name: 'Cartera de Inversión',
                type: 'INVESTMENT',
                balance: 25000,
                currency: 'USD',
            };

            const result = validateAccount(investmentAccount);

            expect(result.success).toBe(true);
        });

        it('debe validar una cuenta de efectivo', () => {
            const cashAccount = {
                name: 'Efectivo en Casa',
                type: 'CASH',
                balance: 500,
                currency: 'EUR',
            };

            const result = validateAccount(cashAccount);

            expect(result.success).toBe(true);
        });

        it('debe validar una tarjeta de crédito completa', () => {
            const creditCard = {
                name: 'Visa Gold',
                bankName: 'BBVA',
                type: 'CREDIT',
                balance: -1500,
                currency: 'EUR',
                creditLimit: 5000,
                cutoffDay: 25,
                paymentDay: 5,
            };

            const result = validateAccount(creditCard);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.creditLimit).toBe(5000);
                expect(result.data.cutoffDay).toBe(25);
            }
        });

        it('debe validar cuenta con balance negativo', () => {
            const account = {
                name: 'Cuenta con Descubierto',
                type: 'BANK',
                balance: -200,
                currency: 'EUR',
            };

            const result = validateAccount(account);

            expect(result.success).toBe(true);
        });

        it('debe validar cuenta con balance cero', () => {
            const account = {
                name: 'Cuenta Nueva',
                type: 'WALLET',
                balance: 0,
                currency: 'GBP',
            };

            const result = validateAccount(account);

            expect(result.success).toBe(true);
        });
    });

    describe('Cuentas Inválidas', () => {
        it('debe rechazar nombre vacío', () => {
            const invalidAccount = {
                name: '',
                type: 'BANK',
                balance: 1000,
                currency: 'EUR',
            };

            const result = validateAccount(invalidAccount);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('cannot be empty');
            }
        });

        it('debe rechazar nombre mayor a 100 caracteres', () => {
            const invalidAccount = {
                name: 'a'.repeat(101),
                type: 'BANK',
                balance: 1000,
                currency: 'EUR',
            };

            const result = validateAccount(invalidAccount);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('less than 100');
            }
        });

        it('debe rechazar tipo de cuenta inválido', () => {
            const invalidAccount = {
                name: 'Mi Cuenta',
                type: 'SAVINGS', // Tipo inválido
                balance: 1000,
                currency: 'EUR',
            };

            const result = validateAccount(invalidAccount);

            expect(result.success).toBe(false);
        });

        it('debe rechazar moneda inválida', () => {
            const invalidAccount = {
                name: 'Mi Cuenta',
                type: 'BANK',
                balance: 1000,
                currency: 'JPY', // Moneda no soportada
            };

            const result = validateAccount(invalidAccount);

            expect(result.success).toBe(false);
        });

        it('debe rechazar balance Infinity', () => {
            const invalidAccount = {
                name: 'Mi Cuenta',
                type: 'BANK',
                balance: Infinity,
                currency: 'EUR',
            };

            const result = validateAccount(invalidAccount);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('expected number');
            }
        });

        it('debe rechazar TAE negativo', () => {
            const invalidAccount = {
                name: 'Mi Cuenta',
                type: 'BANK',
                balance: 1000,
                currency: 'EUR',
                tae: -1,
            };

            const result = validateAccount(invalidAccount);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('must be positive');
            }
        });

        it('debe rechazar TAE mayor a 100', () => {
            const invalidAccount = {
                name: 'Mi Cuenta',
                type: 'BANK',
                balance: 1000,
                currency: 'EUR',
                tae: 150,
            };

            const result = validateAccount(invalidAccount);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('less than 100');
            }
        });

        it('debe rechazar límite de crédito negativo', () => {
            const invalidAccount = {
                name: 'Tarjeta',
                type: 'CREDIT',
                balance: 0,
                currency: 'EUR',
                creditLimit: -1000,
                cutoffDay: 25,
                paymentDay: 5,
            };

            const result = validateAccount(invalidAccount);

            expect(result.success).toBe(false);
        });

        it('debe rechazar día de corte menor a 1', () => {
            const invalidAccount = {
                name: 'Tarjeta',
                type: 'CREDIT',
                balance: 0,
                currency: 'EUR',
                creditLimit: 5000,
                cutoffDay: 0,
                paymentDay: 5,
            };

            const result = validateAccount(invalidAccount);

            expect(result.success).toBe(false);
        });

        it('debe rechazar día de corte mayor a 31', () => {
            const invalidAccount = {
                name: 'Tarjeta',
                type: 'CREDIT',
                balance: 0,
                currency: 'EUR',
                creditLimit: 5000,
                cutoffDay: 32,
                paymentDay: 5,
            };

            const result = validateAccount(invalidAccount);

            expect(result.success).toBe(false);
        });

        it('debe rechazar día de corte decimal', () => {
            const invalidAccount = {
                name: 'Tarjeta',
                type: 'CREDIT',
                balance: 0,
                currency: 'EUR',
                creditLimit: 5000,
                cutoffDay: 15.5,
                paymentDay: 5,
            };

            const result = validateAccount(invalidAccount);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('integer');
            }
        });
    });

    describe('Validación Condicional - Tarjetas de Crédito', () => {
        it('debe rechazar tarjeta de crédito sin límite de crédito', () => {
            const invalidCreditCard = {
                name: 'Visa',
                type: 'CREDIT',
                balance: 0,
                currency: 'EUR',
                cutoffDay: 25,
                paymentDay: 5,
                // Falta creditLimit
            };

            const result = validateAccount(invalidCreditCard);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('Credit limit is required')
                )).toBe(true);
            }
        });

        it('debe rechazar tarjeta de crédito sin día de corte', () => {
            const invalidCreditCard = {
                name: 'Visa',
                type: 'CREDIT',
                balance: 0,
                currency: 'EUR',
                creditLimit: 5000,
                paymentDay: 5,
                // Falta cutoffDay
            };

            const result = validateAccount(invalidCreditCard);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('Cutoff day and payment day are required')
                )).toBe(true);
            }
        });

        it('debe rechazar tarjeta de crédito sin día de pago', () => {
            const invalidCreditCard = {
                name: 'Visa',
                type: 'CREDIT',
                balance: 0,
                currency: 'EUR',
                creditLimit: 5000,
                cutoffDay: 25,
                // Falta paymentDay
            };

            const result = validateAccount(invalidCreditCard);

            expect(result.success).toBe(false);
        });

        it('debe permitir otros tipos de cuenta sin límite de crédito', () => {
            const bankAccount = {
                name: 'Cuenta Corriente',
                type: 'BANK',
                balance: 1000,
                currency: 'EUR',
                // No tiene creditLimit y está bien
            };

            const result = validateAccount(bankAccount);

            expect(result.success).toBe(true);
        });
    });

    describe('Casos Extremos', () => {
        it('debe manejar balance muy grande', () => {
            const account = {
                name: 'Cuenta Millonaria',
                type: 'INVESTMENT',
                balance: 999999999.99,
                currency: 'USD',
            };

            const result = validateAccount(account);

            expect(result.success).toBe(true);
        });

        it('debe manejar balance muy negativo', () => {
            const account = {
                name: 'Cuenta en Rojo',
                type: 'CREDIT',
                balance: -999999,
                currency: 'EUR',
                creditLimit: 1000000,
                cutoffDay: 1,
                paymentDay: 15,
            };

            const result = validateAccount(account);

            expect(result.success).toBe(true);
        });

        it('debe manejar TAE de 0%', () => {
            const account = {
                name: 'Cuenta Sin Interés',
                type: 'BANK',
                balance: 1000,
                currency: 'EUR',
                tae: 0,
            };

            const result = validateAccount(account);

            expect(result.success).toBe(true);
        });

        it('debe manejar TAE de 100%', () => {
            const account = {
                name: 'Cuenta Alto Rendimiento',
                type: 'INVESTMENT',
                balance: 1000,
                currency: 'EUR',
                tae: 100,
            };

            const result = validateAccount(account);

            expect(result.success).toBe(true);
        });

        it('debe manejar nombre de banco muy largo', () => {
            const account = {
                name: 'Mi Cuenta',
                bankName: 'a'.repeat(100), // Exactamente 100 caracteres
                type: 'BANK',
                balance: 1000,
                currency: 'EUR',
            };

            const result = validateAccount(account);

            expect(result.success).toBe(true);
        });

        it('debe rechazar nombre de banco mayor a 100 caracteres', () => {
            const account = {
                name: 'Mi Cuenta',
                bankName: 'a'.repeat(101),
                type: 'BANK',
                balance: 1000,
                currency: 'EUR',
            };

            const result = validateAccount(account);

            expect(result.success).toBe(false);
        });

        it('debe manejar todos los tipos de cuenta', () => {
            const types = ['BANK', 'INVESTMENT', 'CASH', 'CREDIT', 'DEBIT', 'WALLET', 'ASSET'];

            types.forEach(type => {
                const account: any = {
                    name: `Cuenta ${type}`,
                    type,
                    balance: 1000,
                    currency: 'EUR',
                };

                // Agregar campos requeridos para CREDIT
                if (type === 'CREDIT') {
                    account.creditLimit = 5000;
                    account.cutoffDay = 15;
                    account.paymentDay = 5;
                }

                const result = validateAccount(account);
                expect(result.success).toBe(true);
            });
        });

        it('debe manejar todas las monedas soportadas', () => {
            const currencies = ['EUR', 'USD', 'GBP'];

            currencies.forEach(currency => {
                const account = {
                    name: `Cuenta en ${currency}`,
                    type: 'BANK',
                    balance: 1000,
                    currency,
                };

                const result = validateAccount(account);
                expect(result.success).toBe(true);
            });
        });
    });
});
