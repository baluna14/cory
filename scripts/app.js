// Main App JavaScript
class CoryApp {
    constructor() {
        this.currentView = 'home';
        this.representativeCory = null;
        this.isArrowVisible = false;
        this.hasNewAlarm = true; // Default to having an alarm for demo
        this.coryCollection = []; // Array to store all collected Corys
        this.explorationState = 'idle'; // 'idle', 'exploring', 'ready_to_claim'
        this.explorationTimer = null;
        this.selectedPhoto = null;
        this.chatMessages = []; // Store chat history
        this.selectedCoryForRepresentative = null; // Store selected cory for representative dialog
        this.userProfile = {
            nickname: '주인',
            playerId: '392819274943',
            profileImage: 'assets/images/profile.png',
            playTime: 140,
            startTime: Date.now() - (140 * 60 * 1000) // Subtract initial play time
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeDefaultCory();
        this.initializeMockCollection();
        this.updateAlarmDisplay();
        this.renderPocketGrid();

        // Set initial view
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.classList.add('home-view');
        }

        console.log('Cory App initialized');
    }

    bindEvents() {
        // Representative Cory click events
        const cory = document.getElementById('representativeCory');
        const coryArrow = document.getElementById('coryArrow');

        if (cory) {
            cory.addEventListener('click', () => this.handleCoryClick());
        }

        // Alarm icon click
        const alarmIcon = document.getElementById('alarmIcon');
        if (alarmIcon) {
            alarmIcon.addEventListener('click', () => this.handleAlarmClick());
        }

        // Navigation tabs
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Hide arrow when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.cory-container') && this.isArrowVisible) {
                this.hideArrow();
            }
        });

        // Journey radar arrows
        const radarArrow1 = document.getElementById('radarArrow1');
        const radarArrow2 = document.getElementById('radarArrow2');
        if (radarArrow1) {
            radarArrow1.addEventListener('click', () => this.handleRadarArrowClick());
        }
        if (radarArrow2) {
            radarArrow2.addEventListener('click', () => this.handleRadarArrowClick());
        }

        // Cancel exploration button
        const cancelButton = document.getElementById('cancelExploration');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => this.cancelExploration());
        }

        // Profile interactions
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
            profileImage.addEventListener('click', () => this.handleProfileImageClick());
        }

        const userNickname = document.getElementById('userNickname');
        if (userNickname) {
            userNickname.addEventListener('click', () => this.handleNicknameEdit());
        }

        // Talk Dialog buttons
        const dialogNoBtn = document.getElementById('dialogNoBtn');
        const dialogYesBtn = document.getElementById('dialogYesBtn');
        if (dialogNoBtn) {
            dialogNoBtn.addEventListener('click', () => this.closeTalkDialog());
        }
        if (dialogYesBtn) {
            dialogYesBtn.addEventListener('click', () => this.acceptTalkDialog());
        }

        // Talk Dialog overlay click to close
        const dialogOverlay = document.getElementById('talkDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.addEventListener('click', (e) => {
                if (e.target === dialogOverlay) {
                    this.closeTalkDialog();
                }
            });
        }

        // Representative Dialog buttons
        const representativeNoBtn = document.getElementById('representativeNoBtn');
        const representativeYesBtn = document.getElementById('representativeYesBtn');
        if (representativeNoBtn) {
            representativeNoBtn.addEventListener('click', () => this.closeRepresentativeDialog());
        }
        if (representativeYesBtn) {
            representativeYesBtn.addEventListener('click', () => this.confirmRepresentativeChange());
        }

        // Representative Dialog overlay click to close
        const representativeDialogOverlay = document.getElementById('representativeDialogOverlay');
        if (representativeDialogOverlay) {
            representativeDialogOverlay.addEventListener('click', (e) => {
                if (e.target === representativeDialogOverlay) {
                    this.closeRepresentativeDialog();
                }
            });
        }

        // Exploration Dialog buttons
        const explorationNoBtn = document.getElementById('explorationNoBtn');
        const explorationYesBtn = document.getElementById('explorationYesBtn');
        if (explorationNoBtn) {
            explorationNoBtn.addEventListener('click', () => this.closeExplorationDialog());
        }
        if (explorationYesBtn) {
            explorationYesBtn.addEventListener('click', () => this.confirmExploration());
        }

        // Exploration Dialog overlay click to close
        const explorationDialogOverlay = document.getElementById('explorationDialogOverlay');
        if (explorationDialogOverlay) {
            explorationDialogOverlay.addEventListener('click', (e) => {
                if (e.target === explorationDialogOverlay) {
                    this.closeExplorationDialog();
                }
            });
        }

        // Photo Upload Dialog buttons
        const photoUploadNoBtn = document.getElementById('photoUploadNoBtn');
        const photoUploadYesBtn = document.getElementById('photoUploadYesBtn');
        if (photoUploadNoBtn) {
            photoUploadNoBtn.addEventListener('click', () => this.closePhotoUploadDialog());
        }
        if (photoUploadYesBtn) {
            photoUploadYesBtn.addEventListener('click', () => this.confirmPhotoUpload());
        }

        // Photo Upload Dialog overlay click to close
        const photoUploadDialogOverlay = document.getElementById('photoUploadDialogOverlay');
        if (photoUploadDialogOverlay) {
            photoUploadDialogOverlay.addEventListener('click', (e) => {
                if (e.target === photoUploadDialogOverlay) {
                    this.closePhotoUploadDialog();
                }
            });
        }

        // Talk screen interactions
        const backToHome = document.getElementById('backToHome');
        if (backToHome) {
            backToHome.addEventListener('click', () => this.backToHomeView());
        }

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

    initializeDefaultCory() {
        this.representativeCory = {
            id: 'default-cory',
            name: 'Cory #001',
            imageUrl: 'assets/images/default_cory.png',
            story: {
                summary: '첫 번째 코리입니다. 당신을 기다리고 있어요!',
                lines: [
                    '안녕하세요!',
                    '저는 당신의 첫 번째 코리예요.',
                    '함께 멋진 모험을 떠나요!',
                    '사진을 업로드하면',
                    '새로운 친구들을 만날 수 있어요.',
                    '궁금한 게 있으면 언제든 물어보세요!',
                    '당신과 함께하는 시간이 즐거워요.',
                    '오늘은 어떤 하루를 보내셨나요?'
                ]
            },
            createdAt: Date.now(),
            isRepresentative: true
        };

        // Add to collection
        this.coryCollection.push(this.representativeCory);
    }

    initializeMockCollection() {
        // Add some mock Corys for demonstration
        const mockCorys = [
            {
                id: 'mock-cory-2',
                name: 'Cory #002',
                imageUrl: 'assets/images/small_pattern_cory.png',
                story: {
                    summary: '패턴이 있는 두 번째 코리입니다.',
                    lines: ['안녕하세요!', '저는 두 번째 코리예요.']
                },
                createdAt: Date.now() - 86400000,
                isRepresentative: false
            },
            {
                id: 'mock-cory-3',
                name: 'Cory #003',
                imageUrl: 'assets/images/midieum_pattern_cory.png',
                story: {
                    summary: '미디엄 패턴의 세 번째 코리입니다.',
                    lines: ['안녕하세요!', '저는 세 번째 코리예요.']
                },
                createdAt: Date.now() - 172800000,
                isRepresentative: false
            }
        ];

        this.coryCollection.push(...mockCorys);
    }

    handleCoryClick() {
        if (!this.isArrowVisible) {
            this.showArrow();
        } else {
            this.showTalkConfirm();
        }
    }

    showArrow() {
        const arrow = document.getElementById('coryArrow');
        if (arrow) {
            arrow.classList.add('visible');
            this.isArrowVisible = true;
        }
    }

    hideArrow() {
        const arrow = document.getElementById('coryArrow');
        if (arrow) {
            arrow.classList.remove('visible');
            this.isArrowVisible = false;
        }
    }

    showTalkConfirm() {
        this.showTalkDialog();
        this.hideArrow();
    }

    showTalkDialog() {
        const dialogOverlay = document.getElementById('talkDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.remove('hidden');
        }
    }

    closeTalkDialog() {
        const dialogOverlay = document.getElementById('talkDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }
    }

    acceptTalkDialog() {
        this.closeTalkDialog();
        this.openTalkScreen();
    }

    openTalkScreen() {
        // Hide all views
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.remove('active'));

        // Hide main header (to prevent overlap with talk header)
        const mainHeader = document.querySelector('.header');
        if (mainHeader) {
            mainHeader.style.display = 'none';
        }

        // Hide bottom navigation
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }

        // Set talk background on container
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

        this.currentView = 'talk';
        console.log('Opening talk screen with:', this.representativeCory.name);
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

        // Show main header again
        const mainHeader = document.querySelector('.header');
        if (mainHeader) {
            mainHeader.style.display = 'flex';
        }

        // Show bottom navigation again
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

        this.currentView = 'home';
    }

    updateTalkScreen() {
        // Update cory name tag
        const coryNameTag = document.getElementById('coryNameTag');
        if (coryNameTag && this.representativeCory) {
            coryNameTag.textContent = this.representativeCory.name;
        }

        // Update cory image
        const talkCoryImage = document.getElementById('talkCoryImage');
        if (talkCoryImage && this.representativeCory) {
            talkCoryImage.src = this.representativeCory.imageUrl;
            talkCoryImage.alt = this.representativeCory.name;
        }

        // Initialize chat with sample message if empty
        if (this.chatMessages.length === 0) {
            this.addMessage('cory', '안녕하세요! 저와 대화해요!');
        }

        this.renderChatMessages();
    }

    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        if (!chatInput || !chatInput.value.trim()) return;

        const message = chatInput.value.trim();
        chatInput.value = '';

        // Add user message
        this.addMessage('user', message);

        // Generate cory response after a short delay
        setTimeout(() => {
            const response = this.generateCoryResponse(message);
            this.addMessage('cory', response);
        }, 1000);
    }

    addMessage(sender, text) {
        const message = {
            sender: sender,
            text: text,
            timestamp: Date.now()
        };

        this.chatMessages.push(message);
        this.renderChatMessages();
    }

    renderChatMessages() {
        const chatMessagesContainer = document.getElementById('chatMessages');
        if (!chatMessagesContainer) return;

        chatMessagesContainer.innerHTML = '';

        this.chatMessages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${message.sender}`;

            const headerDiv = document.createElement('div');
            headerDiv.className = `chat-message-header ${message.sender === 'cory' ? 'cory' : ''}`;
            headerDiv.textContent = message.sender === 'user' ? '나' : this.representativeCory.name;

            const textDiv = document.createElement('div');
            textDiv.className = 'chat-message-text';
            textDiv.textContent = message.text;

            messageDiv.appendChild(headerDiv);
            messageDiv.appendChild(textDiv);
            chatMessagesContainer.appendChild(messageDiv);
        });

        // Scroll to bottom
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    generateCoryResponse(userMessage) {
        // Simple response generation based on keywords
        const responses = {
            '안녕': ['안녕하세요! 오늘 기분이 어떠세요?', '안녕! 좋은 하루예요!'],
            '먹이': ['저는 복숭아를 좋아해요!', '맛있는 과일이 먹고 싶어요.'],
            '놀이': ['함께 놀면 재미있을 것 같아요!', '어떤 놀이를 좋아하세요?'],
            '날씨': ['오늘 날씨가 참 좋네요!', '햇볕이 따뜻해서 기분이 좋아요.'],
            '기분': ['저는 항상 즐거워요!', '당신과 대화하니까 기분이 좋네요!'],
            '이름': [`제 이름은 ${this.representativeCory.name}이에요!`, '저를 기억해 주세요!'],
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

    handleAlarmClick() {
        if (this.hasNewAlarm) {
            this.showNewCoryAlert();
        } else {
            this.showToast('새로운 알림이 없습니다.');
        }
    }

    showNewCoryAlert() {
        // Mock new Cory data
        const newCory = {
            id: 'mock-cory-' + Date.now(),
            name: 'Cory #002',
            imageUrl: 'assets/images/small_pattern_cory.png',
            story: {
                summary: '사진에서 탄생한 새로운 코리입니다!',
                lines: [
                    '안녕하세요!',
                    '저는 당신의 사진에서 태어났어요.',
                    '멋진 색깔과 무늬를 가지고 있어요!',
                    '저를 대표 코리로 설정하시겠어요?'
                ]
            }
        };

        const confirmed = confirm(
            `새로운 코리를 발견했습니다!\n\n` +
            `이름: ${newCory.name}\n` +
            `${newCory.story.summary}\n\n` +
            `이 코리를 대표 코리로 설정하시겠어요?`
        );

        if (confirmed) {
            this.setRepresentativeCory(newCory);
            this.showToast(`${newCory.name}이(가) 대표 코리로 설정되었습니다!`);
        } else {
            this.showToast('코리가 포켓에 추가되었습니다.');
        }

        // Mark alarm as read
        this.hasNewAlarm = false;
        this.updateAlarmDisplay();
    }

    setRepresentativeCory(cory) {
        // Update previous representative
        if (this.representativeCory) {
            this.representativeCory.isRepresentative = false;
        }

        // Set new representative
        this.representativeCory = cory;
        cory.isRepresentative = true;

        // Update the display
        const coryImage = document.getElementById('representativeCory');
        if (coryImage && cory.imageUrl) {
            coryImage.src = cory.imageUrl;
            coryImage.alt = cory.name;
        }
    }

    updateAlarmDisplay() {
        const alarmDot = document.getElementById('alarmDot');
        const alertMessage = document.getElementById('alertMessage');

        if (alarmDot) {
            alarmDot.style.display = this.hasNewAlarm ? 'block' : 'none';
        }

        if (alertMessage) {
            if (this.hasNewAlarm) {
                alertMessage.classList.remove('hidden');
            } else {
                alertMessage.classList.add('hidden');
            }
        }
    }

    switchTab(tabName) {
        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            }
        });

        // Update views
        const views = document.querySelectorAll('.view');
        views.forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(`${tabName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Update header title
        const headerTitle = document.querySelector('.screen-title');
        if (headerTitle) {
            const titles = {
                'home': 'Home',
                'pocket': 'Pocket',
                'journey': 'Journey',
                'profile': 'Profile'
            };
            headerTitle.textContent = titles[tabName] || tabName;
        }

        // Show/hide alarm container based on current view
        const alarmContainer = document.getElementById('alarmContainer');
        if (alarmContainer) {
            if (tabName === 'home') {
                alarmContainer.style.display = 'block';
            } else {
                alarmContainer.style.display = 'none';
            }
        }

        // Update main container background based on current view
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.className = '';
            if (tabName === 'home') {
                mainContainer.classList.add('home-view');
            } else if (tabName === 'pocket') {
                mainContainer.classList.add('pocket-view');
            } else if (tabName === 'journey') {
                mainContainer.classList.add('journey-view');
            } else if (tabName === 'profile') {
                mainContainer.classList.add('profile-view');
            }
        }

        this.currentView = tabName;

        // Render content based on view
        if (tabName === 'pocket') {
            this.renderPocketGrid();
        } else if (tabName === 'journey') {
            this.updateJourneyDisplay();
        } else if (tabName === 'profile') {
            this.updateProfileDisplay();
        }

        console.log(`Switched to tab: ${tabName}`);
    }

    renderPocketGrid() {
        const pocketGrid = document.getElementById('pocketGrid');
        if (!pocketGrid) return;

        pocketGrid.innerHTML = '';

        // Create rows (3 cards per row)
        const cardsPerRow = 3;
        const rows = Math.ceil(this.coryCollection.length / cardsPerRow);
        const maxRows = Math.max(rows, 3); // Minimum 3 rows

        for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
            const row = document.createElement('div');
            row.className = 'pocket-row';

            for (let cardIndex = 0; cardIndex < cardsPerRow; cardIndex++) {
                const coryIndex = rowIndex * cardsPerRow + cardIndex;
                const cory = this.coryCollection[coryIndex];

                const card = document.createElement('div');
                card.className = 'cory-card';

                if (cory) {
                    // Filled card
                    card.innerHTML = `
                        <img src="${cory.imageUrl}" alt="${cory.name}" class="cory-card-image">
                        <div class="cory-card-name">${cory.name}</div>
                    `;
                    card.dataset.coryId = cory.id;
                    card.addEventListener('click', () => this.handleCoryCardClick(cory));
                } else {
                    // Empty card
                    card.classList.add('empty');
                    card.innerHTML = `
                        <div class="empty-text">Empty<br>Slot</div>
                    `;
                }

                row.appendChild(card);
            }

            pocketGrid.appendChild(row);
        }
    }

    handleCoryCardClick(cory) {
        if (cory.isRepresentative) {
            this.showToast('이미 대표 코리로 설정되어 있습니다.');
            return;
        }

        this.selectedCoryForRepresentative = cory;
        this.showRepresentativeDialog(cory);
    }

    showRepresentativeDialog(cory) {
        const dialogOverlay = document.getElementById('representativeDialogOverlay');
        const dialogText = document.getElementById('representativeDialogText');

        if (dialogOverlay && dialogText) {
            dialogText.textContent = `${cory.name}을(를) 대표 코리로 지정할까요?`;
            dialogOverlay.classList.remove('hidden');
        }
    }

    closeRepresentativeDialog() {
        const dialogOverlay = document.getElementById('representativeDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }
        this.selectedCoryForRepresentative = null;
    }

    confirmRepresentativeChange() {
        if (this.selectedCoryForRepresentative) {
            this.setRepresentativeCory(this.selectedCoryForRepresentative);
            this.showToast(`${this.selectedCoryForRepresentative.name}이(가) 대표 코리로 설정되었습니다!`);
            this.renderPocketGrid(); // Re-render to update the grid
        }
        this.closeRepresentativeDialog();
    }

    showToast(message, duration = 3000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.add('visible');
        }, 10);

        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // Journey Methods
    handleRadarArrowClick() {
        if (this.explorationState === 'exploring') {
            this.showToast('이미 탐험 중입니다!');
            return;
        }

        this.showExplorationDialog();
    }

    showExplorationDialog() {
        const dialogOverlay = document.getElementById('explorationDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.remove('hidden');
        }
    }

    closeExplorationDialog() {
        const dialogOverlay = document.getElementById('explorationDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }
    }

    confirmExploration() {
        this.closeExplorationDialog();
        this.startPhotoSelection();
    }

    startPhotoSelection() {
        // Create file input for photo selection
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handlePhotoSelection(file);
            }
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    handlePhotoSelection(file) {
        // Store the selected photo
        this.selectedPhoto = {
            file: file,
            name: file.name,
            size: file.size,
            type: file.type
        };

        this.showPhotoUploadDialog();
    }

    showPhotoUploadDialog() {
        const dialogOverlay = document.getElementById('photoUploadDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.remove('hidden');
        }
    }

    closePhotoUploadDialog() {
        const dialogOverlay = document.getElementById('photoUploadDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }
        this.selectedPhoto = null;
    }

    confirmPhotoUpload() {
        this.closePhotoUploadDialog();
        this.startExploration();
    }

    startExploration() {
        if (!this.selectedPhoto) return;

        this.explorationState = 'exploring';
        this.updateJourneyDisplay();

        // Random exploration time between 15-60 seconds
        const minDuration = 15000; // 15 seconds
        const maxDuration = 60000; // 60 seconds
        const duration = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;

        const interval = 100; // Update every 100ms
        let progress = 0;
        let remainingTime = duration;

        console.log(`Starting exploration for ${duration / 1000} seconds`);

        this.explorationTimer = setInterval(() => {
            progress += interval;
            remainingTime -= interval;

            const percentage = (progress / duration) * 100;

            // Update progress bar
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }

            // Update remaining time display
            const timeRemainingElement = document.getElementById('timeRemaining');
            if (timeRemainingElement) {
                const minutes = Math.floor(remainingTime / 60000);
                const seconds = Math.floor((remainingTime % 60000) / 1000);
                timeRemainingElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} remains`;
            }

            if (progress >= duration) {
                this.completeExploration();
            }
        }, interval);
    }

    completeExploration() {
        if (this.explorationTimer) {
            clearInterval(this.explorationTimer);
            this.explorationTimer = null;
        }

        this.explorationState = 'idle';

        // Generate new Cory
        const newCory = this.generateCoryFromPhoto();
        this.coryCollection.push(newCory);

        // Add to mailbox
        this.hasNewAlarm = true;
        this.updateAlarmDisplay();

        // Reset photo selection
        this.selectedPhoto = null;

        this.updateJourneyDisplay();
        this.showToast('탐험이 완료되었습니다! 메일함을 확인하세요.');
    }

    cancelExploration() {
        if (this.explorationTimer) {
            clearInterval(this.explorationTimer);
            this.explorationTimer = null;
        }

        this.explorationState = 'idle';
        this.selectedPhoto = null;
        this.updateJourneyDisplay();
        this.showToast('탐험이 중단되었습니다.');
    }

    updateJourneyDisplay() {
        const explorationStatus = document.getElementById('explorationStatus');
        const explorationProgress = document.getElementById('explorationProgress');
        const radarArrows = document.querySelectorAll('.radar-arrow');

        if (!explorationStatus || !explorationProgress) return;

        if (this.explorationState === 'idle') {
            explorationStatus.style.display = 'block';
            explorationProgress.classList.add('hidden');
            radarArrows.forEach(arrow => arrow.style.display = 'block');
        } else if (this.explorationState === 'exploring') {
            explorationStatus.style.display = 'none';
            explorationProgress.classList.remove('hidden');
            radarArrows.forEach(arrow => arrow.style.display = 'none');

            // Reset progress bar
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }
    }

    generateCoryFromPhoto() {
        const coryNumber = this.coryCollection.length + 1;
        const paddedNumber = coryNumber.toString().padStart(3, '0');

        // Mock Cory generation based on photo
        const mockImages = [
            'assets/images/small_pattern_cory.png',
            'assets/images/midieum_pattern_cory.png',
            'assets/images/default_cory.png'
        ];

        const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];

        return {
            id: `photo-cory-${Date.now()}`,
            name: `Cory #${paddedNumber}`,
            imageUrl: randomImage,
            story: {
                summary: `${this.selectedPhoto.name}에서 탄생한 특별한 코리입니다.`,
                lines: [
                    '안녕하세요!',
                    `저는 ${this.selectedPhoto.name}에서 태어났어요.`,
                    '당신의 사진에서 많은 영감을 받았답니다!',
                    '앞으로 잘 부탁드려요!'
                ]
            },
            sourcePhoto: this.selectedPhoto,
            createdAt: Date.now(),
            isRepresentative: false
        };
    }

    // Profile Methods
    updateProfileDisplay() {
        // Update cory count
        const coryCountElement = document.getElementById('coryCount');
        if (coryCountElement) {
            coryCountElement.textContent = this.coryCollection.length.toString();
        }

        // Update play time (calculate current play time)
        const playTimeElement = document.getElementById('playTime');
        if (playTimeElement) {
            const currentSessionTime = Math.floor((Date.now() - this.userProfile.startTime) / 60000); // minutes
            const totalPlayTime = this.userProfile.playTime + currentSessionTime;
            playTimeElement.textContent = totalPlayTime.toString();
        }

        // Update user nickname
        const nicknameElement = document.getElementById('userNickname');
        if (nicknameElement) {
            nicknameElement.textContent = this.userProfile.nickname;
        }

        // Update player ID
        const playerIdElement = document.getElementById('playerId');
        if (playerIdElement) {
            playerIdElement.textContent = `PlayerID: ${this.userProfile.playerId}`;
        }

        // Update profile image
        const profileImageElement = document.getElementById('profileImage');
        if (profileImageElement) {
            profileImageElement.src = this.userProfile.profileImage;
        }
    }

    handleProfileImageClick() {
        // Create file input for image selection
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleProfileImageChange(file);
            }
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    handleProfileImageChange(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.userProfile.profileImage = e.target.result;
            this.updateProfileDisplay();
            this.showToast('프로필 이미지가 변경되었습니다!');
        };
        reader.readAsDataURL(file);
    }

    handleNicknameEdit() {
        const currentNickname = this.userProfile.nickname;
        const newNickname = prompt('닉네임을 입력하세요:', currentNickname);

        if (newNickname !== null && newNickname.trim() !== '') {
            this.userProfile.nickname = newNickname.trim();
            this.updateProfileDisplay();
            this.showToast(`닉네임이 "${this.userProfile.nickname}"으로 변경되었습니다!`);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.coryApp = new CoryApp();
});