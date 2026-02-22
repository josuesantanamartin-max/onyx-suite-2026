import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    const duffelToken = process.env.VITE_DUFFEL_ACCESS_TOKEN;
    const geminiKey = process.env.VITE_GEMINI_API_KEY;

    return res.status(200).json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        diagnostics: {
            hasDuffelToken: !!duffelToken,
            duffelTokenPrefix: duffelToken ? `${duffelToken.substring(0, 10)}...` : 'not set',
            hasGeminiKey: !!geminiKey,
            geminiKeyPrefix: geminiKey ? `${geminiKey.substring(0, 7)}...` : 'not set',
            geminiKeyLength: geminiKey ? geminiKey.length : 0
        },
        timestamp: new Date().toISOString()
    });
}
