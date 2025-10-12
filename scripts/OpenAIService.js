// OpenAI API Service
class OpenAIService {
    constructor() {
        this.apiKey = window.CONFIG?.OPENAI_API_KEY || '';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-4o-2024-08-06'; // Using cost-effective model
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
     * Analyze image and generate Cory data
     */
    async analyzeImageForCory(imageFile) {
        if (!this.isConfigured()) {
            throw new Error('OpenAI API 키가 설정되지 않았습니다. config.js 파일을 확인하세요.');
        }

        try {
            // Convert image to base64
            const base64Image = await this.convertImageToBase64(imageFile);

            const systemPrompt = `당신은 이미지를 분석하여 귀여운 가상 펫 "코리"의 성격과 특성을 생성하는 AI입니다.

주어진 이미지를 분석하여 다음 JSON 형식으로 코리 데이터를 생성해주세요:

{
  "name": "이미지에서 영감을 받은 귀여운 한국어 이름 (2-4글자)",
  "color": {
    "r": 숫자,
    "g": 숫자,
    "b": 숫자,
    "hex": "#000000"
  },
  "personality": {
    "traits": ["성격특성1", "성격특성2", "성격특성3"],
    "description": "이미지에서 느껴지는 성격을 한 문장으로 설명"
  },
  "story": {
    "summary": "코리의 배경 이야기를 한 문장으로",
    "lines": [
      "코리가 말할 법한 대사 1",
      "코리가 말할 법한 대사 2",
      "코리가 말할 법한 대사 3",
      "코리가 말할 법한 대사 4",
      "코리가 말할 법한 대사 5"
    ]
  }
}

규칙:
- 이미지의 주요 색상을 color 필드에 반영
- 이미지에서 느껴지는 분위기나 요소를 성격에 반영
- 친근하고 긍정적인 성격으로 생성
- story.lines는 코리가 사용자에게 말할 법한 짧고 귀여운 대사들
- 모든 텍스트는 한국어로 작성
- 유효한 JSON 형식으로만 응답`;

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: '이 이미지를 분석하여 코리 데이터를 생성해주세요.'
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:${imageFile.type};base64,${base64Image}`,
                                        detail: 'low'
                                    }
                                }
                            ]
                        }
                    ],
                    temperature: 0.8,
                    max_tokens: 800
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.choices || data.choices.length === 0) {
                throw new Error('이미지 분석 응답을 받지 못했습니다.');
            }

            const content = data.choices[0].message.content.trim();
            console.log('Raw AI response:', content);

            // Clean JSON response (remove markdown code blocks if present)
            let cleanedContent = content;
            if (content.includes('```json')) {
                const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    cleanedContent = jsonMatch[1].trim();
                    console.log('Extracted JSON from markdown:', cleanedContent);
                }
            } else if (content.includes('```')) {
                const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
                if (codeMatch) {
                    cleanedContent = codeMatch[1].trim();
                    console.log('Extracted content from code blocks:', cleanedContent);
                }
            }

            // Parse JSON response
            let parsedData;
            try {
                parsedData = JSON.parse(cleanedContent);
                console.log('Parsed AI data:', parsedData);
            } catch (parseError) {
                console.error('JSON parsing error:', parseError);
                console.error('Content that failed to parse:', cleanedContent);
                throw new Error('AI 응답을 파싱할 수 없습니다.');
            }

            // Validate required fields
            if (!parsedData.name || !parsedData.color || !parsedData.personality || !parsedData.story) {
                throw new Error('AI 응답에 필수 필드가 누락되었습니다.');
            }

            return parsedData;
        } catch (error) {
            console.error('Image analysis error:', error);
            throw error;
        }
    }

    /**
     * Convert image file to base64
     */
    async convertImageToBase64(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
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
