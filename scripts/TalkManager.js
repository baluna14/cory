// Talk/Chat Management System
class TalkManager {
    constructor(app) {
        this.app = app;
        this.chatMessages = [];
        this.openAIService = new OpenAIService();
        this.maxChatHistory = 30; // Maximum chat history to keep
        this.isWaitingForResponse = false; // Prevent multiple concurrent requests
    }

    bindEvents() {
        // Back to home button
        const backToHome = document.getElementById('backToHome');
        if (backToHome) {
            backToHome.addEventListener('click', () => this.backToHomeView());
        }

        // Chat input and send button
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');

        if (chatInput && sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    openTalkScreen() {
        // Hide all views
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.remove('active'));

        // Hide main header
        const mainHeader = document.querySelector('.header');
        if (mainHeader) {
            mainHeader.style.display = 'none';
        }

        // Hide bottom navigation
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }

        // Set talk background
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.classList.remove('home-view');
            mainContainer.classList.add('talk-view');
        }

        // Show talk header
        const talkHeader = document.getElementById('talkHeader');
        if (talkHeader) {
            talkHeader.classList.remove('hidden');
        }

        // Show talk view
        const talkView = document.getElementById('talkView');
        if (talkView) {
            talkView.classList.remove('hidden');
            talkView.classList.add('active');
        }

        // Show talk input area
        const talkInputArea = document.getElementById('talkInputArea');
        if (talkInputArea) {
            talkInputArea.classList.remove('hidden');
        }

        // Update talk screen content
        this.updateTalkScreen();

        this.app.currentView = 'talk';
        console.log('Opening talk screen with:', this.app.representativeCory.name);
    }

    backToHomeView() {
        // Hide talk header
        const talkHeader = document.getElementById('talkHeader');
        if (talkHeader) {
            talkHeader.classList.add('hidden');
        }

        // Hide talk view
        const talkView = document.getElementById('talkView');
        if (talkView) {
            talkView.classList.add('hidden');
            talkView.classList.remove('active');
        }

        // Hide talk input area
        const talkInputArea = document.getElementById('talkInputArea');
        if (talkInputArea) {
            talkInputArea.classList.add('hidden');
        }

        // Show main header
        const mainHeader = document.querySelector('.header');
        if (mainHeader) {
            mainHeader.style.display = 'flex';
        }

        // Show bottom navigation
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'flex';
        }

        // Show home view
        const homeView = document.getElementById('homeView');
        if (homeView) {
            homeView.classList.add('active');
        }

        // Update header and main container
        const headerTitle = document.querySelector('.screen-title');
        if (headerTitle) {
            headerTitle.textContent = 'Home';
        }

        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.classList.remove('talk-view');
            mainContainer.classList.add('home-view');
        }

        // Show alarm container
        const alarmContainer = document.getElementById('alarmContainer');
        if (alarmContainer) {
            alarmContainer.style.display = 'block';
        }

        this.app.currentView = 'home';
    }

    updateTalkScreen() {
        // Update cory name tag
        const coryNameTag = document.getElementById('coryNameTag');
        if (coryNameTag && this.app.representativeCory) {
            coryNameTag.textContent = this.app.representativeCory.name;
        }

        // Update cory image
        const talkCoryImage = document.getElementById('talkCoryImage');
        if (talkCoryImage && this.app.representativeCory) {
            talkCoryImage.src = this.app.representativeCory.imageUrl;
            talkCoryImage.alt = this.app.representativeCory.name;
        }

        // Initialize chat with sample message if empty
        if (this.chatMessages.length === 0) {
            this.addMessage('cory', '안녕하세요! 저와 대화해요!');
        }

        this.renderChatMessages();
    }

    async sendMessage() {
        const chatInput = document.getElementById('chatInput');
        if (!chatInput || !chatInput.value.trim()) return;

        // Prevent sending while waiting for response
        if (this.isWaitingForResponse) {
            this.app.showToast('응답을 기다리는 중입니다...');
            return;
        }

        const message = chatInput.value.trim();
        chatInput.value = '';

        // Add user message
        this.addMessage('user', message);

        // Show typing indicator
        this.showTypingIndicator();
        this.isWaitingForResponse = true;

        try {
            let response;

            // Check if OpenAI is configured
            if (this.openAIService.isConfigured()) {
                // Use OpenAI API
                response = await this.openAIService.sendMessage(
                    this.app.representativeCory,
                    this.chatMessages,
                    message
                );
            } else {
                // Fallback to simple keyword-based responses
                console.warn('OpenAI API not configured. Using fallback responses.');
                await this.delay(1000); // Simulate network delay
                response = this.generateCoryResponse(message);
            }

            // Remove typing indicator and add response
            this.hideTypingIndicator();
            this.addMessage('cory', response);
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();

            // Show error message to user
            this.app.showToast('응답을 받는 데 실패했습니다. 다시 시도해주세요.');

            // Fallback to simple response
            const fallbackResponse = this.generateCoryResponse(message);
            this.addMessage('cory', fallbackResponse);
        } finally {
            this.isWaitingForResponse = false;
        }
    }

    addMessage(sender, text) {
        const message = {
            sender: sender,
            text: text,
            timestamp: Date.now()
        };

        this.chatMessages.push(message);

        // Trim chat history to keep only last 30 messages
        if (this.chatMessages.length > this.maxChatHistory) {
            this.chatMessages = this.chatMessages.slice(-this.maxChatHistory);
        }

        this.renderChatMessages();
    }

    renderChatMessages() {
        const chatMessagesContainer = document.getElementById('chatMessages');
        if (!chatMessagesContainer) return;

        // Clear container but keep typing indicator if present
        const typingIndicator = chatMessagesContainer.querySelector('.typing-indicator');
        chatMessagesContainer.innerHTML = '';

        this.chatMessages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${message.sender}`;

            const headerDiv = document.createElement('div');
            headerDiv.className = `chat-message-header ${message.sender === 'cory' ? 'cory' : ''}`;
            headerDiv.textContent = message.sender === 'user' ? '나' : this.app.representativeCory.name;

            const textDiv = document.createElement('div');
            textDiv.className = 'chat-message-text';
            textDiv.textContent = message.text;

            messageDiv.appendChild(headerDiv);
            messageDiv.appendChild(textDiv);
            chatMessagesContainer.appendChild(messageDiv);
        });

        // Re-add typing indicator if it existed
        if (typingIndicator) {
            chatMessagesContainer.appendChild(typingIndicator);
        }

        // Scroll to bottom
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const chatMessagesContainer = document.getElementById('chatMessages');
        if (!chatMessagesContainer) return;

        // Create typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="chat-message-header cory">${this.app.representativeCory.name}</div>
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        `;

        chatMessagesContainer.appendChild(typingDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const chatMessagesContainer = document.getElementById('chatMessages');
        if (!chatMessagesContainer) return;

        const typingIndicator = chatMessagesContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateCoryResponse(userMessage) {
        // Simple keyword-based response generation (fallback when OpenAI is not configured)
        const responses = {
            '안녕': ['안녕하세요! 오늘 기분이 어떠세요?', '안녕! 좋은 하루예요!'],
            '먹이': ['저는 복숭아를 좋아해요!', '맛있는 과일이 먹고 싶어요.'],
            '놀이': ['함께 놀면 재미있을 것 같아요!', '어떤 놀이를 좋아하세요?'],
            '날씨': ['오늘 날씨가 참 좋네요!', '햇볕이 따뜻해서 기분이 좋아요.'],
            '기분': ['저는 항상 즐거워요!', '당신과 대화하니까 기분이 좋네요!'],
            '이름': [`제 이름은 ${this.app.representativeCory.name}이에요!`, '저를 기억해 주세요!'],
            '고마워': ['천만에요!', '언제든지 말해주세요!'],
            '사랑': ['저도 당신을 좋아해요!', '따뜻한 마음 감사해요!']
        };

        // Find matching keywords
        for (const [keyword, responseList] of Object.entries(responses)) {
            if (userMessage.includes(keyword)) {
                return responseList[Math.floor(Math.random() * responseList.length)];
            }
        }

        // Default responses
        const defaultResponses = [
            '흥미로운 이야기네요!',
            '더 자세히 말해주세요.',
            '그렇군요! 재미있어요.',
            '저도 그렇게 생각해요.',
            '오늘도 즐거운 하루 보내세요!',
            '당신과 대화하는 시간이 즐거워요.',
            '또 다른 이야기도 들려주세요!'
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
}

// Export for use in app.js
if (typeof window !== 'undefined') {
    window.TalkManager = TalkManager;
}
