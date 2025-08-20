// explore.js

document.addEventListener('DOMContentLoaded', () => {
    // 뒤로가기 버튼 요소 (상단 바)
    const backButton = document.getElementById('backButton');

    // 하단 내비게이션 버튼 요소들을 가져옵니다.
    const homeNavButton = document.getElementById('homeNavButton');
    const collectionNavButton = document.getElementById('collectionNavButton');
    const profileNavButton = document.getElementById('profileNavButton');

    // 코리 알 아이콘 요소들을 가져옵니다.
    const eggIcon1 = document.getElementById('eggIcon1');
    const eggIcon2 = document.getElementById('eggIcon2');

    // 메시지 오버레이 요소들을 가져옵니다.
    const messageOverlay = document.getElementById('messageOverlay');
    const closeMessageButton = document.getElementById('closeMessageButton'); // 이 버튼이 '확인' 버튼입니다.

    // 폴라로이드 사진 관련 요소
    const polaroidPhotoContainer1 = document.getElementById('polaroidPhotoContainer1');
    const mapOverlay = document.getElementById('mapOverlay');
    const explorationStatus = document.getElementById('explorationStatus'); // "탐험 중입니다." 텍스트 컨테이너
    const endExplorationButton = document.getElementById('endExplorationButton'); // 탐험 종료 버튼

    // 뒤로가기 버튼 클릭 시 main_game.html로 이동
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

    // 프로필 버튼 클릭 시 profile.html로 이동
    if (profileNavButton) {
        profileNavButton.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }

    // 코리 알 아이콘 1 클릭 이벤트 리스너
    if (eggIcon1) {
        eggIcon1.addEventListener('click', () => {
            console.log('Egg Icon 1 clicked!'); // 이벤트 발생 확인용 로그
            showMessage(); // 메시지 박스 표시 함수 호출
        });
    }

    // 코리 알 아이콘 2 클릭 이벤트 리스너
    if (eggIcon2) {
        eggIcon2.addEventListener('click', () => {
            console.log('Egg Icon 2 clicked!'); // 이벤트 발생 확인용 로그
            showMessage(); // 메시지 박스 표시 함수 호출
        });
    }

    // 메시지 박스 '확인' 버튼 클릭 시 이벤트 리스너
    if (closeMessageButton) {
        closeMessageButton.addEventListener('click', () => {
            window.location.href = 'camera.html'; // 카메라 화면으로 이동합니다.
        });
    }

    // 오버레이 외부 클릭 시 메시지 박스 닫기
    if (messageOverlay) {
        messageOverlay.addEventListener('click', (event) => {
            // 클릭된 요소가 메시지 박스 자체가 아닐 경우에만 닫기
            if (event.target === messageOverlay) {
                hideMessage(); // 외부 클릭 시에는 메시지 박스만 닫습니다.
            }
        });
    }

    // '탐험 종료' 버튼 클릭 시 이벤트 리스너
    if (endExplorationButton) {
        endExplorationButton.addEventListener('click', () => {
            console.log('Exploration ended. Resetting map overlay and polaroid.');
            if (mapOverlay) {
                mapOverlay.classList.remove('active'); // 지도 오버레이 숨김 (opacity/visibility)
                mapOverlay.classList.add('hidden'); // 지도 오버레이 숨김 (display: none)
            }
            if (polaroidPhotoContainer1) {
                polaroidPhotoContainer1.classList.add('hidden'); // 폴라로이드 사진 숨김
            }
            if (explorationStatus) {
                explorationStatus.classList.add('hidden'); // "탐험 중입니다." 텍스트 숨김
            }
            if (eggIcon1) { // 탐험 종료 시 eggIcon1 다시 표시
                eggIcon1.classList.remove('hidden');
            }
            // 필요한 경우 탐험 상태를 초기화하는 추가 로직을 여기에 넣을 수 있습니다.
        });
    }

    // 메시지 박스를 표시하는 함수
    function showMessage() {
        if (messageOverlay) {
            messageOverlay.classList.remove('hidden'); // 메시지 오버레이 표시 (display: flex)
            messageOverlay.classList.add('active'); // 'active' 클래스를 추가하여 표시 (opacity/visibility)
        }
    }

    // 메시지 박스를 숨기는 함수 (외부 클릭 시 사용)
    function hideMessage() {
        if (messageOverlay) {
            messageOverlay.classList.remove('active'); // 'active' 클래스를 제거하여 숨기기 (opacity/visibility)
            // 트랜지션 완료 후 hidden 클래스 추가 (선택 사항, 즉시 숨겨도 무방)
            setTimeout(() => {
                messageOverlay.classList.add('hidden'); // 메시지 오버레이 숨김 (display: none)
            }, 300); // CSS transition 시간과 맞춰주세요 (0.3s)
        }
    }

    // URL 파라미터를 가져오는 함수
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // 페이지 로드 시 'photo=taken' 파라미터 확인
    const photoTaken = getUrlParameter('photo');

    if (photoTaken === 'taken') {
        // 폴라로이드 사진 표시
        if (polaroidPhotoContainer1) {
            polaroidPhotoContainer1.classList.remove('hidden');
        }

        // 지도 오버레이 표시
        if (mapOverlay) {
            mapOverlay.classList.remove('hidden'); // 지도 오버레이 표시 (display: flex)
            mapOverlay.classList.add('active'); // active 클래스를 추가하여 표시 (opacity/visibility)
        }

        // "탐험 중입니다." 텍스트 표시
        if (explorationStatus) {
            explorationStatus.classList.remove('hidden');
        }

        // eggIcon1 숨김
        if (eggIcon1) {
            eggIcon1.classList.add('hidden');
        }
    } else {
        // 'photo=taken' 파라미터가 없으면 폴라로이드와 오버레이, 텍스트 숨김
        if (polaroidPhotoContainer1) {
            polaroidPhotoContainer1.classList.add('hidden');
        }
        if (mapOverlay) {
            mapOverlay.classList.remove('active'); // active 클래스 제거하여 숨김 (opacity/visibility)
            mapOverlay.classList.add('hidden'); // 지도 오버레이 숨김 (display: none)
        }
        if (explorationStatus) {
            explorationStatus.classList.add('hidden');
        }
        // eggIcon1 다시 표시
        if (eggIcon1) {
            eggIcon1.classList.remove('hidden');
        }
    }
});
