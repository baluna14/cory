// Journey/Exploration Management System
class JourneyManager {
    constructor(app) {
        this.app = app;
        this.explorationState = 'idle'; // 'idle', 'exploring'
        this.explorationTimer = null;
        this.arrowPositions = null; // Store arrow positions
        this.openAIService = new OpenAIService();
        this.geminiService = new GeminiService();
        this.generatedCory = null; // Store generated Cory reference
    }

    bindEvents() {
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
            cancelButton.addEventListener('click', () => this.app.dialogManager.showCancelExplorationDialog());
        }

        // Position arrows randomly on initial load only
        if (!this.arrowPositions) {
            this.positionArrowsRandomly();
        } else {
            this.applyArrowPositions();
        }
    }

    positionArrowsRandomly() {
        // Radar info: center at (251px, 406px) from top-left of viewport
        // Green circle radius: approximately 90px
        const radarCenterX = 251; // center X of radar
        const radarCenterY = 406; // center Y of radar
        const greenCircleRadius = 90; // radius of green circle

        // Generate new random positions
        const pos1 = this.getRandomPositionInCircle(radarCenterX, radarCenterY, greenCircleRadius);
        const pos2 = this.getRandomPositionInCircle(radarCenterX, radarCenterY, greenCircleRadius);

        // Store positions
        this.arrowPositions = {
            arrow1: pos1,
            arrow2: pos2
        };

        // Apply positions to DOM
        this.applyArrowPositions();
    }

    applyArrowPositions() {
        if (!this.arrowPositions) return;

        const radarArrow1 = document.getElementById('radarArrow1');
        const radarArrow2 = document.getElementById('radarArrow2');

        if (radarArrow1) {
            radarArrow1.style.left = `${this.arrowPositions.arrow1.x}px`;
            radarArrow1.style.top = `${this.arrowPositions.arrow1.y}px`;
        }

        if (radarArrow2) {
            radarArrow2.style.left = `${this.arrowPositions.arrow2.x}px`;
            radarArrow2.style.top = `${this.arrowPositions.arrow2.y}px`;
        }
    }

    getRandomPositionInCircle(centerX, centerY, radius) {
        // Generate random point within circle using polar coordinates
        const angle = Math.random() * 2 * Math.PI;
        const r = Math.sqrt(Math.random()) * radius; // sqrt for uniform distribution

        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);

        return { x, y };
    }

    handleRadarArrowClick() {
        if (this.explorationState === 'exploring') {
            this.app.showToast('이미 탐험 중입니다!');
            return;
        }

        this.app.dialogManager.showExplorationDialog();
    }

    startPhotoSelection() {
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
        const selectedPhoto = {
            file: file,
            name: file.name,
            size: file.size,
            type: file.type
        };

        const reader = new FileReader();
        reader.onload = (e) => {
            selectedPhoto.dataUrl = e.target.result;
            this.app.dialogManager.selectedPhoto = selectedPhoto;
            this.app.dialogManager.showPhotoUploadDialog();
        };
        reader.readAsDataURL(file);
    }

    async startExploration(selectedPhoto) {
        if (!selectedPhoto) return;

        // Store selected photo in app
        this.app.selectedPhoto = selectedPhoto;

        // Close the photo upload dialog
        const dialogOverlay = document.getElementById('photoUploadDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }

        this.explorationState = 'exploring';
        this.updateJourneyDisplay();

        // Start AI analysis and Cory generation immediately (in background)
        this.startAIAnalysisAndGenerateCory().catch(error => {
            console.error('Cory generation failed:', error);
        });

        // Random exploration time between 15-60 seconds (to allow API time)
        const minDuration = 60000;
        const maxDuration = 120000;
        const duration = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;

        const interval = 100;
        let progress = 0;
        let remainingTime = duration;

        console.log(`Starting exploration for ${duration / 1000} seconds`);

        this.explorationTimer = setInterval(() => {
            progress += interval;
            remainingTime -= interval;

            const percentage = (progress / duration) * 100;

            // Update progress bar
            const progressBarImage = document.getElementById('progressBarImage');
            if (progressBarImage) {
                const clipRight = 100 - percentage;
                progressBarImage.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
            }

            // Update time display
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

    async startAIAnalysisAndGenerateCory() {
        if (!this.app.selectedPhoto || !this.app.selectedPhoto.file) {
            console.log('No photo selected, generating mock Cory');
            const coryNumber = this.app.account.getCoryCount() + 1;
            const paddedNumber = coryNumber.toString().padStart(3, '0');
            const coryData = this.generateMockCoryData(paddedNumber);
            const newCory = new Cory(coryData);
            this.generatedCory = this.app.account.addCory(newCory);
            return;
        }

        try {
            console.log('Starting AI analysis immediately...');

            let aiData = null;

            // Start OpenAI analysis
            if (this.openAIService.isConfigured()) {
                aiData = await this.openAIService.analyzeImageForCory(this.app.selectedPhoto.file);
                console.log('AI analysis completed:', aiData);
            } else {
                console.log('OpenAI not configured, will use fallback');
            }

            // Generate Cory immediately after AI analysis
            console.log('Generating Cory with AI data...');
            const newCory = await this.generateCoryFromPhotoWithData(aiData);
            this.generatedCory = newCory;
            console.log('Cory generated and saved:', newCory.name);

        } catch (error) {
            console.error('AI analysis or Cory generation failed:', error);

            // Check if it's a parsing error
            if (error.message && error.message.includes('parse')) {
                console.error('Parsing error detected, Cory escaped!');
                this.handleCoryEscaped();
                return;
            }

            // For other errors, fallback to mock generation
            const coryNumber = this.app.account.getCoryCount() + 1;
            const paddedNumber = coryNumber.toString().padStart(3, '0');
            const coryData = this.generateMockCoryData(paddedNumber);
            const newCory = new Cory(coryData);
            this.generatedCory = this.app.account.addCory(newCory);
        }
    }

    handleCoryEscaped() {
        // Stop exploration timer
        if (this.explorationTimer) {
            clearInterval(this.explorationTimer);
            this.explorationTimer = null;
        }

        // Reset exploration state
        this.explorationState = 'idle';
        this.app.selectedPhoto = null;
        this.generatedCory = null;

        // Generate new arrow positions for next exploration
        this.positionArrowsRandomly();

        // Update UI
        this.updateJourneyDisplay();

        // Show escape message
        this.app.showToast('앗! 새로운 코리가 도망갔어요!', 5000);
    }

    async completeExploration() {
        if (this.explorationTimer) {
            clearInterval(this.explorationTimer);
            this.explorationTimer = null;
        }

        this.explorationState = 'idle';

        // Cory already generated in background, just show alarm
        console.log('Exploration timer completed, showing alarm for generated Cory');

        // Add to mailbox (Cory already exists in collection)
        this.app.hasNewAlarm = true;
        this.app.updateAlarmDisplay();

        // Reset photo selection and generated Cory reference
        this.app.selectedPhoto = null;
        this.generatedCory = null;

        // Generate new arrow positions for next exploration
        this.positionArrowsRandomly();

        this.updateJourneyDisplay();
        this.app.showToast('탐험이 완료되었습니다! 메일함을 확인하세요.');
    }

    cancelExploration() {
        if (this.explorationTimer) {
            clearInterval(this.explorationTimer);
            this.explorationTimer = null;
        }

        this.explorationState = 'idle';
        this.app.selectedPhoto = null;

        // If Cory was already generated, remove it from collection
        if (this.generatedCory) {
            this.app.account.removeCory(this.generatedCory.id);
            this.generatedCory = null;
        }

        // Generate new arrow positions for next exploration
        this.positionArrowsRandomly();

        this.updateJourneyDisplay();
        this.app.showToast('탐험이 중단되었습니다.');
    }

    updateJourneyDisplay() {
        const idleState = document.getElementById('journeyIdleState');
        const explorationProgress = document.getElementById('explorationProgress');

        if (!idleState || !explorationProgress) return;

        if (this.explorationState === 'idle') {
            idleState.classList.remove('hidden');
            explorationProgress.classList.add('hidden');

            // Apply existing positions (don't generate new ones on tab switch)
            this.applyArrowPositions();
        } else if (this.explorationState === 'exploring') {
            idleState.classList.add('hidden');
            explorationProgress.classList.remove('hidden');

            // Reset progress bar
            const progressBarImage = document.getElementById('progressBarImage');
            if (progressBarImage) {
                progressBarImage.style.clipPath = 'inset(0 100% 0 0)';
            }
        }
    }

    async generateCoryFromPhoto() {
        // This method is kept for backward compatibility
        return await this.generateCoryFromPhotoWithData(null);
    }

    async generateCoryFromPhotoWithData(aiData) {
        const coryNumber = this.app.account.getCoryCount() + 1;
        const paddedNumber = coryNumber.toString().padStart(3, '0');

        let coryData;

        if (aiData) {
            // Use pre-analyzed AI data
            coryData = {
                id: `photo-cory-${Date.now()}`,
                name: aiData.name,
                imageUrl: this.getRandomCoryImage(), // This will be updated with generated image
                designFile: this.getRandomCoryImage(),
                color: aiData.color,
                personality: aiData.personality,
                story: aiData.story,
                sourcePhoto: this.app.selectedPhoto,
                createdAt: Date.now(),
                isRepresentative: false
            };

            // Try to generate custom image with Gemini
            if (this.geminiService.isConfigured()) {
                try {
                    console.log('Generating custom image with Gemini...');
                    const baseImagePath = this.geminiService.getDefaultCoryImagePath();
                    const generatedImageUrl = await this.geminiService.generateCoryImage(baseImagePath, aiData);

                    // Update Cory data with generated image
                    coryData.imageUrl = generatedImageUrl;
                    coryData.designFile = generatedImageUrl;
                    console.log('Custom image generated successfully:', generatedImageUrl);
                } catch (error) {
                    console.error('Gemini image generation failed, using default image:', error);
                    this.app.showToast('이미지 생성에 실패했습니다. 기본 이미지를 사용합니다.');
                }
            } else {
                console.log('Gemini API not configured, using default image');
            }
        } else {
            // Fallback to mock generation
            coryData = this.generateMockCoryData(paddedNumber);
        }

        // Create Cory instance and add to collection
        const newCory = new Cory(coryData);
        return this.app.account.addCory(newCory);
    }

    getRandomCoryImage() {
        const mockImages = [
            'assets/images/small_pattern_cory.png',
            'assets/images/midieum_pattern_cory.png',
            'assets/images/default_cory.png'
        ];
        return mockImages[Math.floor(Math.random() * mockImages.length)];
    }

    generateMockCoryData(paddedNumber) {
        const mockColors = [
            { r: 255, g: 182, b: 193, hex: '#FFB6C1' },
            { r: 173, g: 216, b: 230, hex: '#ADD8E6' },
            { r: 221, g: 160, b: 221, hex: '#DDA0DD' },
            { r: 240, g: 230, b: 140, hex: '#F0E68C' },
            { r: 152, g: 251, b: 152, hex: '#98FB98' }
        ];

        const personalityOptions = [
            {
                traits: ['장난스러운', '에너지 넘치는', '밝은'],
                description: '항상 웃음과 즐거움을 가져다주는 활발한 성격입니다.'
            },
            {
                traits: ['차분한', '사려 깊은', '온화한'],
                description: '깊은 생각과 따뜻한 마음을 가진 조용한 성격입니다.'
            },
            {
                traits: ['호기심 많은', '모험적인', '창의적인'],
                description: '새로운 것을 탐험하고 발견하는 것을 좋아하는 성격입니다.'
            },
            {
                traits: ['충성스러운', '보호적인', '믿음직한'],
                description: '언제나 곁을 지키며 의지할 수 있는 든든한 성격입니다.'
            }
        ];

        const randomColor = mockColors[Math.floor(Math.random() * mockColors.length)];
        const randomPersonality = personalityOptions[Math.floor(Math.random() * personalityOptions.length)];

        return {
            id: `photo-cory-${Date.now()}`,
            name: `Cory #${paddedNumber}`,
            imageUrl: this.getRandomCoryImage(),
            designFile: this.getRandomCoryImage(),
            color: randomColor,
            personality: randomPersonality,
            story: {
                summary: `${this.app.selectedPhoto.name}에서 탄생한 특별한 코리입니다.`,
                lines: [
                    '안녕하세요!',
                    `저는 ${this.app.selectedPhoto.name}에서 태어났어요.`,
                    '당신의 사진에서 많은 영감을 받았답니다!',
                    '앞으로 잘 부탁드려요!'
                ]
            },
            sourcePhoto: this.app.selectedPhoto,
            createdAt: Date.now(),
            isRepresentative: false
        };
    }
}

// Export for use in app.js
if (typeof window !== 'undefined') {
    window.JourneyManager = JourneyManager;
}
