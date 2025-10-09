// Dialog Management System
class DialogManager {
    constructor(app) {
        this.app = app;
        this.pendingNewCory = null;
        this.selectedCoryForRepresentative = null;
        this.selectedPhoto = null;
    }

    bindEvents() {
        // Talk Dialog
        this.bindTalkDialog();

        // Representative Dialog
        this.bindRepresentativeDialog();

        // Exploration Dialog
        this.bindExplorationDialog();

        // Photo Upload Dialog
        this.bindPhotoUploadDialog();

        // Cancel Exploration Dialog
        this.bindCancelExplorationDialog();

        // New Cory Dialog
        this.bindNewCoryDialog();

        // Cory Name Edit Dialog
        this.bindCoryNameEditDialog();
    }

    // Talk Dialog
    bindTalkDialog() {
        const dialogNoBtn = document.getElementById('dialogNoBtn');
        const dialogYesBtn = document.getElementById('dialogYesBtn');
        const dialogOverlay = document.getElementById('talkDialogOverlay');

        if (dialogNoBtn) {
            dialogNoBtn.addEventListener('click', () => this.closeTalkDialog());
        }
        if (dialogYesBtn) {
            dialogYesBtn.addEventListener('click', () => this.acceptTalkDialog());
        }
        if (dialogOverlay) {
            dialogOverlay.addEventListener('click', (e) => {
                if (e.target === dialogOverlay) {
                    this.closeTalkDialog();
                }
            });
        }
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
        this.app.talkManager.openTalkScreen();
    }

    // Representative Dialog
    bindRepresentativeDialog() {
        const representativeNoBtn = document.getElementById('representativeNoBtn');
        const representativeYesBtn = document.getElementById('representativeYesBtn');
        const representativeDialogOverlay = document.getElementById('representativeDialogOverlay');

        if (representativeNoBtn) {
            representativeNoBtn.addEventListener('click', () => this.closeRepresentativeDialog());
        }
        if (representativeYesBtn) {
            representativeYesBtn.addEventListener('click', () => this.confirmRepresentativeChange());
        }
        if (representativeDialogOverlay) {
            representativeDialogOverlay.addEventListener('click', (e) => {
                if (e.target === representativeDialogOverlay) {
                    this.closeRepresentativeDialog();
                }
            });
        }
    }

    showRepresentativeDialog(cory) {
        const dialogOverlay = document.getElementById('representativeDialogOverlay');
        const dialogText = document.getElementById('representativeDialogText');

        if (dialogOverlay && dialogText) {
            this.selectedCoryForRepresentative = cory;
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
            this.app.setRepresentativeCory(this.selectedCoryForRepresentative.id);
            this.app.showToast(`${this.selectedCoryForRepresentative.name}이(가) 대표 코리로 설정되었습니다!`);
            this.app.pocketManager.renderPocketGrid();
        }
        this.closeRepresentativeDialog();
    }

    // Exploration Dialog
    bindExplorationDialog() {
        const explorationNoBtn = document.getElementById('explorationNoBtn');
        const explorationYesBtn = document.getElementById('explorationYesBtn');
        const explorationDialogOverlay = document.getElementById('explorationDialogOverlay');

        if (explorationNoBtn) {
            explorationNoBtn.addEventListener('click', () => this.closeExplorationDialog());
        }
        if (explorationYesBtn) {
            explorationYesBtn.addEventListener('click', () => this.confirmExploration());
        }
        if (explorationDialogOverlay) {
            explorationDialogOverlay.addEventListener('click', (e) => {
                if (e.target === explorationDialogOverlay) {
                    this.closeExplorationDialog();
                }
            });
        }
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
        this.app.journeyManager.startPhotoSelection();
    }

    // Photo Upload Dialog
    bindPhotoUploadDialog() {
        const photoUploadNoBtn = document.getElementById('photoUploadNoBtn');
        const photoUploadYesBtn = document.getElementById('photoUploadYesBtn');
        const photoUploadDialogOverlay = document.getElementById('photoUploadDialogOverlay');

        if (photoUploadNoBtn) {
            photoUploadNoBtn.addEventListener('click', () => this.closePhotoUploadDialog());
        }
        if (photoUploadYesBtn) {
            photoUploadYesBtn.addEventListener('click', () => this.confirmPhotoUpload());
        }
        if (photoUploadDialogOverlay) {
            photoUploadDialogOverlay.addEventListener('click', (e) => {
                if (e.target === photoUploadDialogOverlay) {
                    this.closePhotoUploadDialog();
                }
            });
        }
    }

    showPhotoUploadDialog() {
        const dialogOverlay = document.getElementById('photoUploadDialogOverlay');
        const photoPreview = document.getElementById('photoPreviewImage');

        if (dialogOverlay) {
            if (photoPreview && this.selectedPhoto && this.selectedPhoto.dataUrl) {
                photoPreview.src = this.selectedPhoto.dataUrl;
            }
            dialogOverlay.classList.remove('hidden');
        }
    }

    closePhotoUploadDialog() {
        const dialogOverlay = document.getElementById('photoUploadDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }
        const photoPreview = document.getElementById('photoPreviewImage');
        if (photoPreview) {
            photoPreview.src = '';
        }
        this.selectedPhoto = null;
    }

    confirmPhotoUpload() {
        this.app.journeyManager.startExploration(this.selectedPhoto);
    }

    // Cancel Exploration Dialog
    bindCancelExplorationDialog() {
        const cancelExplorationNoBtn = document.getElementById('cancelExplorationNoBtn');
        const cancelExplorationYesBtn = document.getElementById('cancelExplorationYesBtn');
        const cancelExplorationDialogOverlay = document.getElementById('cancelExplorationDialogOverlay');

        if (cancelExplorationNoBtn) {
            cancelExplorationNoBtn.addEventListener('click', () => this.closeCancelExplorationDialog());
        }
        if (cancelExplorationYesBtn) {
            cancelExplorationYesBtn.addEventListener('click', () => this.confirmCancelExploration());
        }
        if (cancelExplorationDialogOverlay) {
            cancelExplorationDialogOverlay.addEventListener('click', (e) => {
                if (e.target === cancelExplorationDialogOverlay) {
                    this.closeCancelExplorationDialog();
                }
            });
        }
    }

    showCancelExplorationDialog() {
        const dialogOverlay = document.getElementById('cancelExplorationDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.remove('hidden');
        }
    }

    closeCancelExplorationDialog() {
        const dialogOverlay = document.getElementById('cancelExplorationDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }
    }

    confirmCancelExploration() {
        this.closeCancelExplorationDialog();
        this.app.journeyManager.cancelExploration();
    }

    // New Cory Dialog
    bindNewCoryDialog() {
        const newCoryNoBtn = document.getElementById('newCoryNoBtn');
        const newCoryYesBtn = document.getElementById('newCoryYesBtn');
        const newCoryDialogOverlay = document.getElementById('newCoryDialogOverlay');

        if (newCoryNoBtn) {
            newCoryNoBtn.addEventListener('click', () => this.closeNewCoryDialog());
        }
        if (newCoryYesBtn) {
            newCoryYesBtn.addEventListener('click', () => this.confirmNewCoryAsRepresentative());
        }
        if (newCoryDialogOverlay) {
            newCoryDialogOverlay.addEventListener('click', (e) => {
                if (e.target === newCoryDialogOverlay) {
                    this.closeNewCoryDialog();
                }
            });
        }
    }

    showNewCoryDialog() {
        const allCorys = this.app.account.getAllCorys();
        const newCory = allCorys[allCorys.length - 1];

        if (!newCory) {
            this.app.showToast('새로운 코리를 찾을 수 없습니다.');
            return;
        }

        this.pendingNewCory = newCory;

        const newCoryImage = document.getElementById('newCoryImage');
        const newCoryStoryText = document.getElementById('newCoryStoryText');

        if (newCoryImage) {
            newCoryImage.src = newCory.imageUrl;
        }

        if (newCoryStoryText && newCory.story && newCory.story.lines) {
            newCoryStoryText.textContent = newCory.story.lines.join(' ');
        }

        const dialogOverlay = document.getElementById('newCoryDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.remove('hidden');
        }
    }

    closeNewCoryDialog() {
        const dialogOverlay = document.getElementById('newCoryDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }

        this.app.hasNewAlarm = false;
        this.app.updateAlarmDisplay();
        this.pendingNewCory = null;

        this.app.showToast('코리가 포켓에 추가되었습니다.');
    }

    confirmNewCoryAsRepresentative() {
        const dialogOverlay = document.getElementById('newCoryDialogOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }

        this.app.hasNewAlarm = false;
        this.app.updateAlarmDisplay();

        this.showCoryNameEditDialog();
    }

    // Cory Name Edit Dialog
    bindCoryNameEditDialog() {
        const coryNameSkipBtn = document.getElementById('coryNameSkipBtn');
        const coryNameConfirmBtn = document.getElementById('coryNameConfirmBtn');
        const coryNameEditOverlay = document.getElementById('coryNameEditOverlay');
        const coryNameInput = document.getElementById('coryNameInput');

        if (coryNameSkipBtn) {
            coryNameSkipBtn.addEventListener('click', () => this.skipCoryNameEdit());
        }
        if (coryNameConfirmBtn) {
            coryNameConfirmBtn.addEventListener('click', () => this.confirmCoryNameEdit());
        }
        if (coryNameEditOverlay) {
            coryNameEditOverlay.addEventListener('click', (e) => {
                if (e.target === coryNameEditOverlay) {
                    this.skipCoryNameEdit();
                }
            });
        }
        if (coryNameInput) {
            coryNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.confirmCoryNameEdit();
                }
            });
        }
    }

    showCoryNameEditDialog() {
        if (!this.pendingNewCory) return;

        const nameInput = document.getElementById('coryNameInput');
        if (nameInput) {
            nameInput.value = this.pendingNewCory.name;
            setTimeout(() => {
                nameInput.focus();
                nameInput.select();
            }, 100);
        }

        const dialogOverlay = document.getElementById('coryNameEditOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.remove('hidden');
        }
    }

    skipCoryNameEdit() {
        const dialogOverlay = document.getElementById('coryNameEditOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }

        if (this.pendingNewCory) {
            this.app.setRepresentativeCory(this.pendingNewCory.id);
            this.app.showToast(`${this.pendingNewCory.name}이(가) 대표 코리로 설정되었습니다!`);
            this.pendingNewCory = null;
        }
    }

    confirmCoryNameEdit() {
        const nameInput = document.getElementById('coryNameInput');
        const newName = nameInput ? nameInput.value.trim() : '';

        if (!newName) {
            this.app.showToast('이름을 입력해주세요.');
            return;
        }

        if (this.pendingNewCory) {
            this.pendingNewCory.name = newName;
            const cory = this.app.account.getCory(this.pendingNewCory.id);
            if (cory) {
                cory.name = newName;
                this.app.account.saveToStorage();
            }

            this.app.setRepresentativeCory(this.pendingNewCory.id);
            this.app.showToast(`${newName}이(가) 대표 코리로 설정되었습니다!`);
            this.pendingNewCory = null;
        }

        const dialogOverlay = document.getElementById('coryNameEditOverlay');
        if (dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }
    }
}

// Export for use in app.js
if (typeof window !== 'undefined') {
    window.DialogManager = DialogManager;
}
