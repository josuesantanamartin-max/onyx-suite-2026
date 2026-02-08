import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidCadastralReference, fetchCadastralData } from '../catastroService';

// Mock fetch globally
global.fetch = vi.fn();
global.DOMParser = vi.fn(() => ({
    parseFromString: vi.fn(),
})) as any;

describe('CatastroService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('isValidCadastralReference', () => {
        it('should validate correct cadastral reference format', () => {
            expect(isValidCadastralReference('9872023VH5797S0001WX')).toBe(true);
            expect(isValidCadastralReference('1234567890123456AB1234C')).toBe(true);
        });

        it('should handle lowercase input', () => {
            expect(isValidCadastralReference('9872023vh5797s0001wx')).toBe(true);
        });

        it('should handle spaces in reference', () => {
            expect(isValidCadastralReference('9872023 VH 5797 S 0001 WX')).toBe(true);
        });

        it('should reject invalid formats', () => {
            expect(isValidCadastralReference('123')).toBe(false);
            expect(isValidCadastralReference('ABCDEFGHIJKLMNOPQRST')).toBe(false);
            expect(isValidCadastralReference('12345678901234AB1234')).toBe(false); // Missing final letter
        });

        it('should reject references with wrong character types', () => {
            expect(isValidCadastralReference('123456789012AB34AB1234C')).toBe(false); // Letters in digit section
            expect(isValidCadastralReference('12345678901234561234AB')).toBe(false); // Digits in letter section
        });

        it('should reject empty or null references', () => {
            expect(isValidCadastralReference('')).toBe(false);
        });

        it('should reject references that are too short', () => {
            expect(isValidCadastralReference('9872023VH5797S000')).toBe(false);
        });

        it('should reject references that are too long', () => {
            expect(isValidCadastralReference('9872023VH5797S0001WXX')).toBe(false);
        });
    });

    describe('fetchCadastralData', () => {
        it('should return error for invalid reference format', async () => {
            const result = await fetchCadastralData('invalid');

            expect(result.success).toBe(false);
            expect(result.error).toContain('inválido');
        });

        it('should fetch cadastral data successfully', async () => {
            const mockXML = `
                <consulta_dnp>
                    <bi>
                        <sfc>120.5</sfc>
                        <ant>2005</ant>
                        <luso>RESIDENCIAL</luso>
                        <loin>
                            <locs>
                                <lous>
                                    <lourb>
                                        <dir>
                                            <bq>A</bq>
                                            <es>1</es>
                                            <pt>3</pt>
                                            <pu>B</pu>
                                        </dir>
                                    </lourb>
                                </lous>
                            </locs>
                        </loin>
                    </bi>
                </consulta_dnp>
            `;

            const mockDoc = {
                querySelector: vi.fn((selector: string) => {
                    if (selector === 'err') return null;
                    if (selector === 'bi') return {
                        querySelector: vi.fn((s: string) => {
                            const values: Record<string, any> = {
                                'sfc': { textContent: '120.5' },
                                'ant': { textContent: '2005' },
                                'luso': { textContent: 'RESIDENCIAL' },
                                'loin > locs > lous > lourb > dir > bq': { textContent: 'A' },
                                'loin > locs > lous > lourb > dir > es': { textContent: '1' },
                                'loin > locs > lous > lourb > dir > pt': { textContent: '3' },
                                'loin > locs > lous > lourb > dir > pu': { textContent: 'B' },
                            };
                            return values[s] || null;
                        }),
                    };
                    return null;
                }),
            };

            (global.DOMParser as any).mockImplementation(() => ({
                parseFromString: () => mockDoc,
            }));

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                text: async () => mockXML,
            });

            const result = await fetchCadastralData('9872023VH5797S0001WX');

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.superficie).toBe(120.5);
            expect(result.data?.añoConstruccion).toBe(2005);
            expect(result.data?.uso).toBe('RESIDENCIAL');
        });

        it('should handle API errors', async () => {
            const mockErrorXML = `
                <consulta_dnp>
                    <err>
                        <des>Referencia catastral no encontrada</des>
                    </err>
                </consulta_dnp>
            `;

            const mockDoc = {
                querySelector: vi.fn((selector: string) => {
                    if (selector === 'err') return {
                        querySelector: vi.fn(() => ({ textContent: 'Referencia catastral no encontrada' })),
                    };
                    return null;
                }),
            };

            (global.DOMParser as any).mockImplementation(() => ({
                parseFromString: () => mockDoc,
            }));

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                text: async () => mockErrorXML,
            });

            const result = await fetchCadastralData('9872023VH5797S0001WX');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Catastro');
        });

        it('should handle HTTP errors', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            const result = await fetchCadastralData('9872023VH5797S0001WX');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should handle network errors', async () => {
            (global.fetch as any).mockRejectedValueOnce(new Error('Network failure'));

            const result = await fetchCadastralData('9872023VH5797S0001WX');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Network failure');
        });

        it('should handle missing data in XML', async () => {
            const mockDoc = {
                querySelector: vi.fn((selector: string) => {
                    if (selector === 'err') return null;
                    if (selector === 'bi') return null;
                    return null;
                }),
            };

            (global.DOMParser as any).mockImplementation(() => ({
                parseFromString: () => mockDoc,
            }));

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                text: async () => '<consulta_dnp></consulta_dnp>',
            });

            const result = await fetchCadastralData('9872023VH5797S0001WX');

            expect(result.success).toBe(false);
            expect(result.error).toContain('No se encontraron datos');
        });

        it('should clean and uppercase reference', async () => {
            const mockDoc = {
                querySelector: vi.fn(() => null),
            };

            (global.DOMParser as any).mockImplementation(() => ({
                parseFromString: () => mockDoc,
            }));

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                text: async () => '<consulta_dnp></consulta_dnp>',
            });

            await fetchCadastralData('9872023 vh 5797 s 0001 wx');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('RC=9872023VH5797S0001WX'),
                expect.any(Object)
            );
        });

        it('should extract province and municipality from reference', async () => {
            const mockDoc = {
                querySelector: vi.fn(() => null),
            };

            (global.DOMParser as any).mockImplementation(() => ({
                parseFromString: () => mockDoc,
            }));

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                text: async () => '<consulta_dnp></consulta_dnp>',
            });

            await fetchCadastralData('9872023VH5797S0001WX');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('Provincia=98'),
                expect.any(Object)
            );
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('Municipio=720'),
                expect.any(Object)
            );
        });
    });
});
