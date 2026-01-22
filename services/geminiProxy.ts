/**
 * Gemini API Proxy Wrapper
 * 
 * This module provides a drop-in replacement for GoogleGenAI that routes
 * all API calls through the serverless proxy to keep the API key secure.
 */

interface GenerateContentRequest {
    model?: string;
    contents: any;
    config?: any;
}

interface GenerateContentResponse {
    text: string;
}

/**
 * Proxy class that mimics GoogleGenAI interface but uses the serverless proxy
 */
class GeminiProxy {
    private model: string;

    constructor(model: string = 'gemini-2.0-flash-exp') {
        this.model = model;
    }

    async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
        const apiUrl = '/api/gemini';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
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

            // Return an object that mimics the GoogleGenAI response structure
            // text is a property, not a function
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
    // API key is ignored since we use the proxy
    const proxy = new GeminiProxy();

    return {
        getGenerativeModel: (config: { model: string }) => {
            return new GeminiProxy(config.model);
        },
        models: proxy, // Expose models property for ai.models.generateContent() pattern
    };
}
