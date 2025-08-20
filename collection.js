// collection.js (이제 컬렉션 화면의 로직을 담당합니다)

document.addEventListener('DOMContentLoaded', () => {
    // 하단 내비게이션 버튼 요소들을 가져옵니다.
    const homeNavButton = document.getElementById('homeNavButton');
    const exploreNavButton = document.getElementById('exploreNavButton');
    const profileNavButton = document.getElementById('profileNavButton');

    // 코리 카드 요소들을 모두 가져옵니다.
    const coryCards = document.querySelectorAll('.terrarium-card');

    // 메시지 오버레이 요소들을 가져옵니다.
    const conversationMessageOverlay = document.getElementById('conversationMessageOverlay');
    const coryConversationMessage = document.getElementById('coryConversationMessage');
    const confirmConversationButton = document.getElementById('confirmConversationButton');
    const cancelConversationButton = document.getElementById('cancelConversationButton');

    // 홈 버튼 클릭 시 main_game.html로 이동
    if (homeNavButton) {
        homeNavButton.addEventListener('click', () => {
            window.location.href = 'main_game.html';
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

    // 각 코리 카드에 클릭 이벤트 리스너 추가
    coryCards.forEach(card => {
        card.addEventListener('click', () => {
            const coryName = card.dataset.coryName; // data-cory-name 속성에서 코리 이름 가져오기
            showConversationMessage(coryName);
        });
    });

    // 대화 메시지 박스를 표시하는 함수
    function showConversationMessage(coryName) {
        if (coryConversationMessage && conversationMessageOverlay) {
            coryConversationMessage.textContent = `이 ${coryName}와(과) 홈에서 대화할래요?`;
            conversationMessageOverlay.classList.add('active');
        }
    }

    // 대화 메시지 박스를 숨기는 함수
    function hideConversationMessage() {
        if (conversationMessageOverlay) {
            conversationMessageOverlay.classList.remove('active');
        }
    }

    // '확인' 버튼 클릭 시 홈 화면으로 이동
    if (confirmConversationButton) {
        confirmConversationButton.addEventListener('click', () => {
            // 실제 앱에서는 선택된 코리 정보를 main_game.html로 전달할 수 있습니다.
            // 예: window.location.href = `main_game.html?cory=${encodeURIComponent(coryName)}`;
            window.location.href = 'main_game.html';
        });
    }

    // '취소' 버튼 클릭 시 메시지 박스 숨김
    if (cancelConversationButton) {
        cancelConversationButton.addEventListener('click', () => {
            hideConversationMessage();
        });
    }

    // 오버레이 외부 클릭 시 메시지 박스 닫기
    if (conversationMessageOverlay) {
        conversationMessageOverlay.addEventListener('click', (event) => {
            if (event.target === conversationMessageOverlay) {
                hideConversationMessage();
            }
        });
    }
});
