// main_game.js

document.addEventListener('DOMContentLoaded', () => {
    // 하단 내비게이션 버튼 요소들을 가져옵니다.
    const collectionNavButton = document.getElementById('collectionNavButton');
    const exploreNavButton = document.getElementById('exploreNavButton');
    const profileNavButton = document.getElementById('profileNavButton');

    // 알림 관련 요소
    const alarmButton = document.getElementById('alarmButton');
    const newKoryMessageOverlay = document.getElementById('newKoryMessageOverlay');
    const confirmNewKoryButton = document.getElementById('confirmNewKoryButton');

    // 새로운 코리 레이아웃 관련 요소
    const newKoryLayout = document.getElementById('newKoryLayout');
    const addToHomeButton = document.getElementById('addToHomeButton');

    // 컬렉션 버튼 클릭 시 collection.html로 이동
    if (collectionNavButton) {
        collectionNavButton.addEventListener('click', () => {
            window.location.href = 'collection.html';
        });
    }

    // 탐험 버튼 클릭 시 explore.html로 이동
    if (exploreNavButton) {
        exploreNavButton.addEventListener('click', () => {
            window.location.href = 'explore.html';
        });
    }

    // 프로필 버튼 클릭 시 profile.html로 이동
    if (profileNavButton) {
        profileNavButton.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }

    // 알림 버튼 클릭 시 새로운 코리 발견 메시지 표시
    if (alarmButton) {
        alarmButton.addEventListener('click', () => {
            if (newKoryMessageOverlay) {
                newKoryMessageOverlay.classList.add('active');
            }
        });
    }

    // 새로운 코리 발견 메시지 '확인' 버튼 클릭 시
    if (confirmNewKoryButton) {
        confirmNewKoryButton.addEventListener('click', () => {
            if (newKoryMessageOverlay) {
                newKoryMessageOverlay.classList.remove('active'); // 메시지 오버레이 숨김
            }
            if (newKoryLayout) {
                newKoryLayout.classList.remove('hidden'); // 새로운 코리 레이아웃 표시
            }
        });
    }

    // '홈에 추가하기' 버튼 클릭 시 새로운 코리 레이아웃 숨김
    if (addToHomeButton) {
        addToHomeButton.addEventListener('click', () => {
            if (newKoryLayout) {
                newKoryLayout.classList.add('hidden'); // 새로운 코리 레이아웃 숨김
            }
        });
    }

    // 오버레이 외부 클릭 시 메시지 박스 닫기 (새로운 코리 발견 알림)
    if (newKoryMessageOverlay) {
        newKoryMessageOverlay.addEventListener('click', (event) => {
            if (event.target === newKoryMessageOverlay) {
                newKoryMessageOverlay.classList.remove('active');
            }
        });
    }
});
