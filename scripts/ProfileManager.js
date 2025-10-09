// Profile Management System
class ProfileManager {
    constructor(app) {
        this.app = app;
        this.userProfile = {
            nickname: '주인',
            profileImage: 'assets/images/profile.png'
        };
    }

    bindEvents() {
        // Profile image click
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
            profileImage.addEventListener('click', () => this.handleProfileImageClick());
        }

        // Nickname click
        const userNickname = document.getElementById('userNickname');
        if (userNickname) {
            userNickname.addEventListener('click', () => this.handleNicknameEdit());
        }
    }

    updateProfileDisplay() {
        // Update cory count
        const coryCountElement = document.getElementById('coryCount');
        if (coryCountElement) {
            coryCountElement.textContent = this.app.account.getCoryCount().toString();
        }

        // Update play time
        const playTimeElement = document.getElementById('playTime');
        if (playTimeElement) {
            playTimeElement.textContent = this.app.account.getTotalPlayTime().toString();
        }

        // Update user nickname
        const nicknameElement = document.getElementById('userNickname');
        if (nicknameElement) {
            nicknameElement.textContent = this.userProfile.nickname;
        }

        // Update player ID
        const playerIdElement = document.getElementById('playerId');
        if (playerIdElement) {
            playerIdElement.textContent = `PlayerID: ${this.app.account.accountId}`;
        }

        // Update profile image
        const profileImageElement = document.getElementById('profileImage');
        if (profileImageElement) {
            profileImageElement.src = this.userProfile.profileImage;
        }
    }

    handleProfileImageClick() {
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
            this.app.showToast('프로필 이미지가 변경되었습니다!');
        };
        reader.readAsDataURL(file);
    }

    handleNicknameEdit() {
        const currentNickname = this.userProfile.nickname;
        const newNickname = prompt('닉네임을 입력하세요:', currentNickname);

        if (newNickname !== null && newNickname.trim() !== '') {
            this.userProfile.nickname = newNickname.trim();
            this.updateProfileDisplay();
            this.app.showToast(`닉네임이 "${this.userProfile.nickname}"으로 변경되었습니다!`);
        }
    }
}

// Export for use in app.js
if (typeof window !== 'undefined') {
    window.ProfileManager = ProfileManager;
}
