// llm-api.js
// This file contains the logic for communicating with the LLM (Gemini).

/**
 * Fetches the API key from the local development server.
 * This is a temporary solution for local development to avoid
 * hardcoding the key and to prevent committing it to Git.
 * @returns {Promise<string|null>} The API key or null if an error occurred.
 */
async function getApiKey() {
    try {
        // Request the API key from the local server's endpoint.
        const response = await fetch('http://localhost:3000/api/get-key');
        if (!response.ok) {
            throw new Error('Failed to fetch API key from local server.');
        }
        const data = await response.json();
        return data.apiKey;
    } catch (error) {
        console.error("Error fetching API key:", error);
        return null;
    }
}

/**
 * Sends the given base64 image data to the LLM and gets a response.
 * @param {string} base64ImageData - The raw base64 image data (without the data URL prefix).
 */
async function sendImageToLLM(base64ImageData) {
    // Dynamically get the API key from the local server.
    const apiKey = await getApiKey();
    if (!apiKey) {
        console.error("API Key is not available.");
        return null;
    }

    const prompt = "Please analyze this image for a Cory habitat. Describe what you see in the picture and determine if it is a suitable place for a Cory to live. Please provide the response in Korean.";
    
    // Construct the API request payload.
    const payload = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: "image/jpeg", // MIME type. Should match the actual file type.
                            data: base64ImageData
                        }
                    }
                ]
            }
        ],
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // Exponential backoff for retries.
    const maxRetries = 3;
    let retryCount = 0;
    let delay = 1000; // 1 second

    while (retryCount < maxRetries) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Throw an error to trigger the catch block.
                throw new Error(`API response was not ok: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            // Check response structure and extract text.
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                console.log("LLM 응답:", text);
                return text; // Return on success.
            } else {
                console.error("LLM 응답에 유효한 내용이 없습니다:", result);
                return null;
            }

        } catch (error) {
            console.error(`LLM 통신 오류 (재시도 ${retryCount + 1}/${maxRetries}):`, error);
            retryCount++;
            if (retryCount < maxRetries) {
                // Wait before the next retry.
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Double the delay.
            } else {
                // Throw an error if all retries fail.
                throw new Error("최대 재시도 횟수를 초과했습니다. LLM 통신에 실패했습니다.");
            }
        }
    }
}
