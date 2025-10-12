// Main App JavaScript
class CoryApp {
    constructor() {
        // Initialize Account first
        this.account = new Account('1234567890');

        // App state
        this.currentView = 'home';
        this.isArrowVisible = false;
        this.hasNewAlarm = false;
        this.selectedPhoto = null;
        this.loadedViews = {};

        // Initialize managers
        this.dialogManager = new DialogManager(this);
        this.journeyManager = new JourneyManager(this);
        this.talkManager = new TalkManager(this);
        this.pocketManager = new PocketManager(this);
        this.profileManager = new ProfileManager(this);
        this.geminiService = new GeminiService(); // For image URL resolution

        this.init();
    }

    async init() {
        // Load all views first
        await this.loadAllViews();

        // Bind events
        this.bindEvents();

        // Initialize account data
        this.initializeAccountData();

        // Initial display updates
        this.updateAlarmDisplay();
        this.pocketManager.renderPocketGrid();

        // Set initial view
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.classList.add('home-view');
        }

        // Setup auto-save
        this.account.setupAutoSave();

        console.log('Cory App initialized');
        console.log('Account Summary:', this.account.getAccountSummary());
    }

    initializeAccountData() {
        // If account has no Corys, create default one
        if (this.account.getCoryCount() === 0) {
            const defaultCory = {
                id: 'default-cory-001',
                name: 'Cory #001',
                imageUrl: 'assets/images/default_cory.png',
                designFile: 'assets/images/default_cory.png',
                color: {
                    r: 228,
                    g: 149,
                    b: 164,
                    hex: '#E495A4'
                },
                personality: {
                    traits: ['친근한', '활발한', '호기심 많은'],
                    description: '당신의 첫 번째 친구입니다. 밝고 긍정적인 성격으로 항상 당신 곁을 지킵니다.'
                },
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

            this.account.addCory(defaultCory);
            console.log('Default Cory created');
        }

        // Update profile display with account data
        this.profileManager.updateProfileDisplay();

        // Update representative Cory image if exists
        this.updateRepresentativeCoryDisplay();
    }

    async loadAllViews() {
        const views = ['home', 'pocket', 'journey', 'profile', 'talk', 'dialogs'];
        const mainContent = document.querySelector('.main-content');

        if (!mainContent) {
            console.error('Main content container not found');
            return;
        }

        try {
            // Load all views in parallel
            const viewPromises = views.map(viewName =>
                fetch(`views/${viewName}.html`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to load ${viewName}.html`);
                        }
                        return response.text();
                    })
                    .then(html => {
                        this.loadedViews[viewName] = html;
                        return { viewName, html };
                    })
            );

            const loadedViews = await Promise.all(viewPromises);

            // Insert all loaded views into main content
            loadedViews.forEach(({ viewName, html }) => {
                if (viewName === 'dialogs') {
                    mainContent.insertAdjacentHTML('afterend', html);
                } else {
                    mainContent.insertAdjacentHTML('beforeend', html);
                }
            });

            console.log('All views loaded successfully');
        } catch (error) {
            console.error('Error loading views:', error);
        }
    }

    bindEvents() {
        // Bind all manager events
        this.dialogManager.bindEvents();
        this.journeyManager.bindEvents();
        this.talkManager.bindEvents();
        this.profileManager.bindEvents();

        // Representative Cory click events
        const cory = document.getElementById('representativeCory');
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
    }

    // Getters for representative Cory
    get representativeCory() {
        return this.account.getRepresentativeCory();
    }

    // Cory click handling
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
        this.dialogManager.showTalkDialog();
        this.hideArrow();
    }

    // Alarm handling
    handleAlarmClick() {
        if (this.hasNewAlarm) {
            this.dialogManager.showNewCoryDialog();
        } else {
            this.showToast('새로운 알림이 없습니다.');
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

    // Representative Cory management
    async setRepresentativeCory(coryOrId) {
        const coryId = typeof coryOrId === 'string' ? coryOrId : coryOrId.id;
        const cory = this.account.setRepresentativeCory(coryId);

        if (cory) {
            const coryImage = document.getElementById('representativeCory');
            if (coryImage && cory.imageUrl) {
                try {
                    const actualUrl = await this.geminiService.getImageUrl(cory.imageUrl);
                    coryImage.src = actualUrl;
                } catch (error) {
                    console.error('Failed to load representative Cory image:', error);
                    coryImage.src = 'assets/images/default_cory.png';
                }
                coryImage.alt = cory.name;
            }
        }

        return cory;
    }

    async updateRepresentativeCoryDisplay() {
        const representativeCory = this.representativeCory;
        if (representativeCory) {
            const coryImage = document.getElementById('representativeCory');
            if (coryImage && representativeCory.imageUrl) {
                try {
                    const actualUrl = await this.geminiService.getImageUrl(representativeCory.imageUrl);
                    coryImage.src = actualUrl;
                } catch (error) {
                    console.error('Failed to load representative Cory image on init:', error);
                    coryImage.src = 'assets/images/default_cory.png';
                }
                coryImage.alt = representativeCory.name;
            }
        }
    }

    // Tab switching
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

        // Show/hide header for journey view
        const mainHeader = document.querySelector('.header');
        if (mainHeader) {
            if (tabName === 'journey') {
                mainHeader.style.display = 'none';
            } else {
                mainHeader.style.display = 'flex';
            }
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
            this.pocketManager.renderPocketGrid();
        } else if (tabName === 'journey') {
            this.journeyManager.updateJourneyDisplay();
        } else if (tabName === 'profile') {
            this.profileManager.updateProfileDisplay();
        }

        console.log(`Switched to tab: ${tabName}`);
    }

    // Toast message utility
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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.coryApp = new CoryApp();
});
