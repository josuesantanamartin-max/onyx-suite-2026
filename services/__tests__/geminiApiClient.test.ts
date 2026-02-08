import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callGeminiAPI, generateContent, generateContentWithImage, generateContentWithSearch } from '../geminiApiClient';

// Mock fetch globally
global.fetch = vi.fn();

describe('GeminiApiClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('callGeminiAPI', () => {
        it('should make successful API call in production', async () => {
            const mockResponse = { text: 'AI response', success: true };
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await callGeminiAPI({
                model: 'gemini-2.0-flash-exp',
                contents: 'test prompt',
            });

            expect(result).toBe('AI response');
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/gemini'),
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
        });

        it('should handle rate limiting (429)', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                status: 429,
                ok: false,
                json: async () => ({ retryAfter: 60 }),
            });

            await expect(
                callGeminiAPI({ contents: 'test' })
            ).rejects.toThrow('Rate limit exceeded. Please try again in 60 seconds.');
        });

        it('should handle API errors', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'Internal server error' }),
            });

            await expect(
                callGeminiAPI({ contents: 'test' })
            ).rejects.toThrow('Internal server error');
        });

        it('should handle network errors', async () => {
            (global.fetch as any).mockRejectedValueOnce(new Error('Network failure'));

            await expect(
                callGeminiAPI({ contents: 'test' })
            ).rejects.toThrow('Network failure');
        });

        it('should handle non-Error exceptions', async () => {
            (global.fetch as any).mockRejectedValueOnce('String error');

            await expect(
                callGeminiAPI({ contents: 'test' })
            ).rejects.toThrow('Failed to connect to AI service');
        });

        it('should return empty string if response has no text', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            });

            const result = await callGeminiAPI({ contents: 'test' });
            expect(result).toBe('');
        });

        it('should include custom model in request', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ text: 'response', success: true }),
            });

            await callGeminiAPI({
                model: 'custom-model',
                contents: 'test',
            });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: expect.stringContaining('custom-model'),
                })
            );
        });
    });

    describe('generateContent', () => {
        it('should generate content with default model', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ text: 'Generated content', success: true }),
            });

            const result = await generateContent('Test prompt');

            expect(result).toBe('Generated content');
            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: expect.stringContaining('gemini-2.0-flash-exp'),
                })
            );
        });

        it('should generate content with custom model', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ text: 'Custom model response', success: true }),
            });

            const result = await generateContent('Test prompt', 'gemini-pro');

            expect(result).toBe('Custom model response');
            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: expect.stringContaining('gemini-pro'),
                })
            );
        });
    });

    describe('generateContentWithImage', () => {
        it('should generate content with image data', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ text: 'Image analysis', success: true }),
            });

            const result = await generateContentWithImage(
                'Describe this image',
                'base64imagedata',
                'image/jpeg'
            );

            expect(result).toBe('Image analysis');
            const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
            expect(callBody.contents.parts).toHaveLength(2);
            expect(callBody.contents.parts[0].inlineData).toEqual({
                mimeType: 'image/jpeg',
                data: 'base64imagedata',
            });
        });

        it('should use default mime type', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ text: 'Response', success: true }),
            });

            await generateContentWithImage('Analyze', 'imagedata');

            const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
            expect(callBody.contents.parts[0].inlineData.mimeType).toBe('image/webp');
        });
    });

    describe('generateContentWithSearch', () => {
        it('should generate content with Google Search enabled', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ text: 'Search-enhanced response', success: true }),
            });

            const result = await generateContentWithSearch('What is the weather today?');

            expect(result).toBe('Search-enhanced response');
            const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
            expect(callBody.config.tools).toEqual([{ googleSearch: {} }]);
        });

        it('should support custom model with search', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ text: 'Response', success: true }),
            });

            await generateContentWithSearch('Search query', 'gemini-pro');

            const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
            expect(callBody.model).toBe('gemini-pro');
            expect(callBody.config.tools).toBeDefined();
        });
    });
});
