const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export async function callGeminiApi(prompt) {
    if (!apiKey) {
        console.error("Chave da API Gemini não foi encontrada nas variáveis de ambiente (.env.local).");
        return "Funcionalidade de IA desabilitada. A chave de API não está configurada.";
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const result = await response.json();
        return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error) {
        console.error("Erro ao chamar a API Gemini:", error);
        throw error;
    }
}

