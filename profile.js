// profile.js

document.addEventListener('DOMContentLoaded', () => {
    // 뒤로가기 버튼 요소 (상단 바)
    const backButton = document.getElementById('backButton');

    // 하단 내비게이션 버튼 요소들을 가져옵니다.
    const homeNavButton = document.getElementById('homeNavButton');
    const collectionNavButton = document.getElementById('collectionNavButton');
    const exploreNavButton = document.getElementById('exploreNavButton'); // 탐험 버튼 추가

    // 뒤로가기 버튼 클릭 시 main_game.html로 이동 (주로 홈으로 돌아가는 역할)
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'main_game.html';
        });
    }

    // 홈 버튼 클릭 시 main_game.html로 이동
    if (homeNavButton) {
        homeNavButton.addEventListener('click', () => {
            window.location.href = 'main_game.html';
        });
    }

    // 컬렉션 버튼 클릭 시 collection.html로 이동
    if (collectionNavButton) {
        collectionNavButton.addEventListener('click', () => {
            window.location.href = 'collection.html';
        });
    }

    // 탐험 버튼 클릭 시 explore.html로 이동
    if (exploreNavButton) {
        exploreNavButton.addEventListener('click', () => {
            window.location.href = 'explore.html'; // 탐험 화면으로 이동
        });
    }
});
