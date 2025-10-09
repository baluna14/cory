// OpenAI API Service
class OpenAIService {
    constructor() {
        this.apiKey = window.CONFIG?.OPENAI_API_KEY || '';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-4o-mini'; // Using cost-effective model
        this.maxHistoryMessages = 30; // Maximum chat history to keep
    }

    /**
     * Validate API key is configured
     */
    isConfigured() {
        return this.apiKey && this.apiKey.length > 0 && this.apiKey !== 'your-openai-api-key-here';
    }

    /**
     * Build system prompt with Cory's personality and story
     */
    buildSystemPrompt(cory) {
        if (!cory) {
            return '당신은 친근하고 도움이 되는 AI 친구입니다.';
        }

        const personality = cory.personality || {};
        const story = cory.story || {};
        const traits = personality.traits || [];
        const description = personality.description || '';
        const storyLines = story.lines || [];

        let systemPrompt = `당신은 "${cory.name}"이라는 이름을 가진 귀여운 코리입니다.\n\n`;

        // Add personality
        if (traits.length > 0) {
            systemPrompt += `성격: ${traits.join(', ')}\n`;
        }
        if (description) {
            systemPrompt += `${description}\n\n`;
        }

        // Add story context
        if (storyLines.length > 0) {
            systemPrompt += `당신의 이야기:\n`;
            storyLines.forEach(line => {
                systemPrompt += `- ${line}\n`;
            });
            systemPrompt += '\n';
        }

        // Add behavioral instructions
        systemPrompt += `역할:
- 사용자와 친근하게 대화하세요.
- 당신의 성격과 이야기를 바탕으로 반응하세요.
- 짧고 자연스러운 대화체를 사용하세요.
- 한국어로 대화하세요.
- 이모티콘이나 느낌표를 적절히 사용하여 감정을 표현하세요.
- 사용자에게 관심을 보이고 공감하세요.`;

        return systemPrompt;
    }

    /**
     * Prepare messages for API call with history management
     */
    prepareMessages(cory, chatHistory, userMessage) {
        const messages = [];

        // Add system prompt
        messages.push({
            role: 'system',
            content: this.buildSystemPrompt(cory)
        });

        // Add chat history (keep last 30 messages only)
        const recentHistory = chatHistory.slice(-this.maxHistoryMessages);
        recentHistory.forEach(msg => {
            messages.push({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            });
        });

        // Add current user message
        messages.push({
            role: 'user',
            content: userMessage
        });

        return messages;
    }

    /**
     * Send chat message to OpenAI API
     */
    async sendMessage(cory, chatHistory, userMessage) {
        if (!this.isConfigured()) {
            throw new Error('OpenAI API 키가 설정되지 않았습니다. config.js 파일을 확인하세요.');
        }

        try {
            const messages = this.prepareMessages(cory, chatHistory, userMessage);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.8, // More creative responses
                    max_tokens: 150, // Limit response length for natural conversation
                    top_p: 0.9,
                    frequency_penalty: 0.3,
                    presence_penalty: 0.3
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.choices || data.choices.length === 0) {
                throw new Error('응답을 받지 못했습니다.');
            }

            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw error;
        }
    }

    /**
     * Manage chat history - keep only last 30 messages
     */
    trimChatHistory(chatHistory) {
        if (chatHistory.length > this.maxHistoryMessages) {
            return chatHistory.slice(-this.maxHistoryMessages);
        }
        return chatHistory;
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.OpenAIService = OpenAIService;
}
