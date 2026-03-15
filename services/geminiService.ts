import { GoogleGenAI } from "@google/genai";
import { AIConfig } from "../types";
import { getDefaultModel, generateWithOpenAI, generateWithClaude } from "./aiProviders";

// Default Configuration - No API Key by default
let currentConfig: AIConfig = {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-3-flash-preview'
};

export const configureAI = (config: AIConfig) => {
    currentConfig = {
        ...config,
        model: config.model ? config.model : getDefaultModel(config.provider)
    };
    console.log("AI Configured:", { provider: currentConfig.provider, model: currentConfig.model });
};

const generateTextCommon = async (systemPrompt: string, userPrompt: string): Promise<string> => {
    const { provider, apiKey, model } = currentConfig;

    if (provider !== 'local' && !apiKey) {
        throw new Error("⚠️ API Key missing. Please configure AI in Settings.");
    }

    if (provider === 'gemini') {
        const ai = new GoogleGenAI({ apiKey });
        try {
            const response = await ai.models.generateContent({
                model: model || 'gemini-3-flash-preview',
                contents: userPrompt,
                config: { systemInstruction: systemPrompt }
            });
            return response.text || "";
        } catch (e) {
            console.error("Gemini Error:", e);
            throw new Error(`Gemini Error: ${(e as Error).message}`);
        }
    }

    if (provider === 'openai' || provider === 'openrouter' || provider === 'local' || provider === 'groq') {
        try {
            return await generateWithOpenAI(systemPrompt, userPrompt, currentConfig);
        } catch (e) {
            console.error(`${provider} Error:`, e);
            throw new Error(`Error with ${provider}: ${(e as Error).message}`);
        }
    }

    if (provider === 'claude') {
        try {
            return await generateWithClaude(systemPrompt, userPrompt, currentConfig);
        } catch (e) {
            console.error("Claude Error:", e);
            throw new Error(`Error with Claude: ${(e as Error).message}. (Check CORS/Proxy)`);
        }
    }

    throw new Error("Provider not supported.");
};

export const generateArticleContent = async (title: string, parentContext?: string | { title: string, content: string } | Array<{ title: string, content: string }>): Promise<string> => {
    let contextPrompt = "";
    if (parentContext) {
        if (typeof parentContext === 'string') {
            contextPrompt = `The user is branching out from: "${parentContext}". Ensure relevance.`;
        } else if (Array.isArray(parentContext)) {
            if (parentContext.length === 1) {
                contextPrompt = `User is branching from "${parentContext[0].title}".\nParent Content:\n"""\n${parentContext[0].content}\n"""\nEnsure logical connection.`;
            } else {
                const combinedContext = parentContext.map((ctx, index) => 
                    `Source ${index + 1} (${ctx.title}):\n"""\n${ctx.content}\n"""`
                ).join('\n\n');
                contextPrompt = `User is creating a node that aggregates from multiple sources:\n\n${combinedContext}\n\nSynthesize these sources into a coherent article for: "${title}". Focus on key themes and connections.`;
            }
        } else {
            contextPrompt = `User is branching from "${parentContext.title}".\nParent Content:\n"""\n${parentContext.content}\n"""\nEnsure logical connection.`;
        }
    }

    const system = `You are an encyclopedia writer. Write in clean Markdown. No main # Title. Use **bold** for key terms. Approx 150-200 words.`;
    const prompt = `${contextPrompt}\n\nWrite an entry for: "${title}".`;

    return generateTextCommon(system, prompt);
};

export const suggestConnection = async (nodeA: string, nodeB: string): Promise<string> => {
    const system = "You are a knowledge graph assistant.";
    const prompt = `Briefly explain the connection between "${nodeA}" and "${nodeB}" in one short sentence (max 10 words).`;

    const result = await generateTextCommon(system, prompt);
    return result.length < 50 ? result.trim() : "Related";
};

export const expandStub = async (title: string, currentContent: string, userInstruction?: string): Promise<string> => {
    const instruction = userInstruction ? `Focus on: ${userInstruction}` : "Write a more comprehensive version.";
    const system = "You are an expert editor. Return strictly Markdown body content.";
    const prompt = `Expand the article for "${title}". ${instruction}\n\nCurrent content:\n${currentContent}`;

    return generateTextCommon(system, prompt);
};

export const refineContent = async (content: string, instruction: string): Promise<string> => {
    const system = "You are an expert editor. Return strictly Markdown body content.";
    const prompt = `Rewrite based on instruction: "${instruction}".\n\nCurrent Content:\n${content}`;

    return generateTextCommon(system, prompt);
};

export const generateImageForArticle = async (title: string): Promise<string | null> => {
    const { provider, apiKey } = currentConfig;

    if (provider !== 'local' && !apiKey) {
        throw new Error("API Key missing. Please configure AI in Settings.");
    }

    const prompt = `A clean, illustrative, educational image for: "${title}". Minimalist style.`;

    if (provider === 'gemini') {
        const ai = new GoogleGenAI({ apiKey });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
            });
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        } catch (e) { console.error(e); throw e; }
    }

    if (provider === 'openai') {
        try {
            const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ model: "dall-e-3", prompt: prompt, n: 1, size: "1024x1024", response_format: "b64_json" })
            });
            const data = await response.json();
            if (data.data?.[0]?.b64_json) {
                return `data:image/png;base64,${data.data[0].b64_json}`;
            }
        } catch (e) { console.error(e); throw e; }
    }

    return null;
};

export const searchImageForArticle = async (title: string): Promise<string | null> => {
    const { provider, apiKey } = currentConfig;

    if (provider !== 'local' && !apiKey) {
        throw new Error("API Key missing. Please configure AI in Settings.");
    }
    if (provider !== 'gemini') return null;

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Find a direct URL to a public domain image representing "${title}". Return ONLY the URL.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });

        const text = response.text?.trim();
        if (!text) return null;
        const match = text.match(/(https?:\/\/[^\s"'>]+)/);
        return match ? match[0] : null;
    } catch (error) {
        console.error("Image search error:", error);
        throw error;
    }
};

export const generateTitleFromContent = async (content: string): Promise<string> => {
    const system = "You are an expert editor. Generate concise, descriptive titles (2-6 words) for given content. Return ONLY the title, no quotes or extra text.";
    const prompt = `Generate a title for this content:\n\n${content}`;

    return generateTextCommon(system, prompt);
};