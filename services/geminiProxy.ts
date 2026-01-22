/**
 * Gemini API Proxy Wrapper
 * 
 * This module provides a smart client that:
 * - In DEVELOPMENT: Uses GoogleGenAI directly with API key from env
 * - In PRODUCTION: Routes through serverless proxy to keep API key secure
 */

import { GoogleGenAI } from "@google/genai";

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

    constructor(model: string = 'gemini-2.0-flash-exp') {
        this.model = model;
        this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

        // In development, create direct client
        if (this.isDevelopment) {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (apiKey) {
                this.directClient = new GoogleGenAI({ apiKey });
            }
        }
    }

    async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
        // Development: Use direct API
        if (this.isDevelopment && this.directClient) {
            try {
                const response = await this.directClient.models.generateContent({
                    model: request.model || this.model,
                    contents: request.contents,
                    config: request.config,
                });
                return {
                    text: response.text || '',
                };
            } catch (error) {
                console.error('Gemini API Error (Direct):', error);
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
