import { GoogleGenAI } from '@google/genai'

// Google Gemini free tier: get a free key (no card) at https://aistudio.google.com/apikey
let client = null

export const getAiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        const error = new Error('AI is not configured: add a free GEMINI_API_KEY to server/.env and restart the server.')
        error.status = 503
        throw error
    }
    if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    return client
}

export const AI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest'

// Sends a prompt and returns plain text, or parsed JSON when a schema is given
export const generate = async ({ system, prompt, schema }) => {
    const response = await getAiClient().models.generateContent({
        model: AI_MODEL,
        contents: prompt,
        config: {
            systemInstruction: system,
            ...(schema && { responseMimeType: 'application/json', responseSchema: schema }),
        },
    })
    const text = response.text?.trim()
    if (!text) throw Object.assign(new Error('The AI returned an empty response. Please try again.'), { status: 502 })
    return schema ? JSON.parse(text) : text
}
