import { AIConfig, AIProvider } from '../types';

export const getDefaultModel = (provider: AIProvider): string => {
    switch (provider) {
        case 'gemini': return 'gemini-3-flash-preview';
        case 'openai': return 'gpt-4o';
        case 'claude': return 'claude-3-5-sonnet-latest';
        case 'openrouter': return 'meta-llama/llama-3-70b-instruct';
        case 'local': return 'llama3';
        case 'groq': return 'meta-llama/llama-4-scout-17b-16e-instruct';
        default: return '';
    }
};

export const generateWithOpenAI = async (
    systemPrompt: string,
    userPrompt: string,
    config: AIConfig
): Promise<string> => {
    const { apiKey, baseUrl, model, provider } = config;
    const defaultBaseUrl = provider === 'openai' ? 'https://api.openai.com/v1' :
        provider === 'local' ? 'http://localhost:11434/v1' :
        provider === 'groq' ? 'https://api.groq.com/openai/v1' :
            'https://openrouter.ai/api/v1';

    const apiUrl = (baseUrl || defaultBaseUrl).replace(/\/$/, '') + '/chat/completions';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...(provider === 'openrouter' ? {
                'HTTP-Referer': window.location.origin,
                'X-Title': 'iamtired'
            } : {})
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No content returned.";
};

export const generateWithClaude = async (
    systemPrompt: string,
    userPrompt: string,
    config: AIConfig
): Promise<string> => {
    const { apiKey, model } = config;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'dangerously-allow-browser': 'true'
        },
        body: JSON.stringify({
            model: model || 'claude-3-5-sonnet-latest',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }]
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || "No content returned.";
};