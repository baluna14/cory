// camera.js
// 이 파일은 카메라 화면의 사용자 인터랙션 로직을 담당합니다.
document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 선택
    const takePhotoButton = document.getElementById('takePhotoButton');
    const photoInput = document.getElementById('photoInput');
    const cameraPreview = document.getElementById('cameraPreview');
    const sendToLLMButton = document.getElementById('sendToLLMButton');
    const messageOverlay = document.getElementById('messageOverlay');
    const messageText = document.getElementById('messageText');
    const closeMessageButton = document.getElementById('closeMessageButton');
    
    let capturedImageBase64 = null; // 캡처된 이미지를 저장할 변수

    // '사진 찍기' 버튼 클릭 이벤트 리스너
    takePhotoButton.addEventListener('click', () => {
        // 숨겨진 파일 입력 필드 클릭 (카메라를 엽니다)
        photoInput.click();
    });

    // 파일 입력 필드 변경 이벤트 리스너 (사진이 선택되면 실행)
    photoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // 파일을 읽기 위한 FileReader 생성
            const reader = new FileReader();

            reader.onload = (e) => {
                // 미리보기에 이미지 표시
                cameraPreview.src = e.target.result;
                cameraPreview.classList.remove('hidden');
                // base64 데이터를 변수에 저장
                // "data:image/jpeg;base64," 부분을 제거하여 순수한 base64 데이터만 저장
                capturedImageBase64 = e.target.result.split(',')[1];
                // '사진 전송' 버튼 표시
                sendToLLMButton.classList.remove('hidden');
            };
            // 파일을 Data URL(base64)로 읽기
            reader.readAsDataURL(file);
        }
    });

    // '사진 전송' 버튼 클릭 이벤트 리스너
    sendToLLMButton.addEventListener('click', async () => {
        if (capturedImageBase64) {
            // 로딩 상태 표시 (예: 버튼 텍스트 변경)
            sendToLLMButton.textContent = '전송 중...';
            sendToLLMButton.disabled = true;

            try {
                // llm-api.js의 함수를 호출하여 LLM에 이미지 전송
                // 이 함수가 성공적으로 실행되면, 응답을 처리하는 로직을 추가해야 합니다.
                await sendImageToLLM(capturedImageBase64);
                showMessage("사진이 LLM에 성공적으로 전송되었습니다!");
            } catch (error) {
                console.error("LLM 통신 중 오류 발생:", error);
                showMessage("사진 전송 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
            } finally {
                // 버튼 상태 초기화
                sendToLLMButton.textContent = '사진 전송';
                sendToLLMButton.disabled = false;
            }
        } else {
            showMessage('먼저 사진을 찍어주세요.');
        }
    });

    // 커스텀 메시지 박스를 표시하는 함수
    function showMessage(message) {
        messageText.textContent = message;
        messageOverlay.classList.add('active');
    }

    // 메시지 박스를 닫는 함수
    closeMessageButton.addEventListener('click', () => {
        messageOverlay.classList.remove('active');
    });
});
