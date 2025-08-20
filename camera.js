// camera.js

document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('backButton');
    const takePhotoButton = document.getElementById('takePhotoButton');

    // 뒤로가기 버튼 클릭 시 탐험 화면으로 이동
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'explore.html';
        });
    }

    // 사진 찍기 버튼 클릭 시
    if (takePhotoButton) {
        takePhotoButton.addEventListener('click', () => {
            // 사진을 찍는 시뮬레이션 후 explore.html로 이동하며 파라미터 전달
            // 실제 앱에서는 여기에 사진 저장 또는 처리 로직이 들어갑니다.
            window.location.href = 'explore.html?photo=taken'; // 탐험 화면으로 이동
        });
    }
});
