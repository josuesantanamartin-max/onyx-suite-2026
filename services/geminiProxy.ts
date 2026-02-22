/**
 * Gemini API Proxy Wrapper
 * 
 * This module provides a smart client that:
 * - In DEVELOPMENT: Uses GoogleGenAI directly with API key from env
 * - In PRODUCTION: Routes through serverless proxy to keep API key secure
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

interface GenerateContentRequest {
    model?: string;
    contents: any;
    config?: any;
}

interface GenerateContentResponse {
    text: string;
}

/**
 * Proxy class that adapts based on environment
 */
class GeminiProxy {
    private model: string;
    private isDevelopment: boolean;
    private directClient: any;

    constructor(model: string = 'gemini-2.5-flash') {
        this.model = model;
        // @ts-ignore
        this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

        // In development, create direct client
        if (this.isDevelopment) {
            // @ts-ignore
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            if (apiKey) {
                const cleanKey = apiKey.trim();
                console.log("DEBUG: VITE_GEMINI_API_KEY length:", cleanKey.length, "Starts:", cleanKey.substring(0, 5), "Ends:", cleanKey.slice(-4));
                this.directClient = cleanKey;
            } else {
                console.warn("DEBUG: VITE_GEMINI_API_KEY is empty or undefined in Vite env!");
            }
        }
    }

    async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
        // Development: Use direct API via fetch to avoid browser SDK SDK hanging bugs with gemini-2.5-flash
        if (this.isDevelopment && this.directClient) {
            try {
                const modelName = request.model || this.model;
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.directClient}`;

                // Map @google/genai payload to @google/generative-ai format
                let parts: any[] = [];
                if (typeof request.contents === 'string') {
                    parts = [{ text: request.contents }];
                } else if (Array.isArray(request.contents)) {
                    parts = request.contents;
                } else if (request.contents && request.contents.parts) {
                    parts = request.contents.parts;
                }

                const payload = {
                    contents: [{ role: 'user', parts }],
                    generationConfig: request.config?.generationConfig,
                    tools: request.config?.tools,
                };

                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    throw new Error(`Gemini API error: ${res.statusText}`);
                }

                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

                if (this.isDevelopment) {
                    console.log('--- GEMINI RAW RESPONSE ---');
                    console.log(text);
                    console.log('---------------------------');
                }

                return {
                    text: text,
                };
            } catch (error: any) {
                console.error('Gemini API Error (Direct fetch):', error);
                throw error;
            }
        }

        // Production: Use serverless proxy
        const apiUrl = '/api/gemini';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: request.model || this.model,
                    contents: request.contents,
                    config: request.config,
                }),
            });

            if (response.status === 429) {
                const data = await response.json();
                throw new Error(
                    `Rate limit exceeded. Please try again in ${data.retryAfter} seconds.`
                );
            }

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to connect to AI service');
            }

            const data = await response.json();

            if (this.isDevelopment) {
                console.log('--- GEMINI PROXY RESPONSE ---');
                console.log(data.text);
                console.log('-----------------------------');
            }

            return {
                text: data.text || '',
            } as any;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to connect to AI service');
        }
    }
}

/**
 * Factory function that creates a GeminiProxy instance
 * This mimics the GoogleGenAI constructor interface
 */
export function createGeminiClient(options?: { apiKey?: string }) {
    const proxy = new GeminiProxy();

    return {
        getGenerativeModel: (config: { model: string }) => {
            return new GeminiProxy(config.model);
        },
        models: proxy, // Expose models property for ai.models.generateContent() pattern
    };
}
