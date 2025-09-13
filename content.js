// 전역 변수로 UI 요소들을 관리하여 중복 생성을 방지합니다.
let searchButton;
let resultModal;
let loadingSpinner;

// 1. 사용자가 마우스 버튼을 놓을 때 텍스트 선택을 감지합니다.
document.addEventListener('mouseup', handleTextSelection);

function handleTextSelection(event) {
    // 만약 클릭한 곳이 우리가 만든 UI(버튼, 모달)라면 아무것도 하지 않습니다.
    if (event.target.id.startsWith('tetego-')) {
        return;
    }

    const selectedText = window.getSelection().toString().trim();

    // 이전에 생성된 UI가 있다면 모두 깨끗하게 지웁니다.
    cleanupUI();

    if (selectedText.length > 0) {
        // 선택된 텍스트가 있다면, 커서 위치에 검색 버튼을 생성합니다.
        createSearchButton(event.pageX, event.pageY, selectedText);
    }
}

// 2. 'tetego로 검색' 버튼을 생성하는 함수
function createSearchButton(x, y, text) {
    searchButton = document.createElement('div');
    searchButton.id = 'tetego-search-button';
    searchButton.textContent = 'tetego로 검색';
    document.body.appendChild(searchButton);

    // 버튼 위치를 마우스 커서 바로 아래로 조정합니다.
    searchButton.style.left = `${x}px`;
    searchButton.style.top = `${y + 15}px`;

    // 버튼을 클릭하면 API 서버로 번역을 요청합니다.
    searchButton.addEventListener('click', () => {
        fetchTranslation(x, y, text);
    });
}

// 3. FastAPI 서버로 API를 호출하고 결과를 처리하는 함수
async function fetchTranslation(x, y, text) {
    // 버튼을 숨기고 그 자리에 로딩 스피너를 보여줍니다.
    if (searchButton) searchButton.style.display = 'none';
    createLoadingSpinner(x, y);

    try {
        const response = await fetch('http://127.0.0.1:8000/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ term: text }),
        });

        if (!response.ok) {
            throw new Error(`서버 오류: ${response.status}`);
        }

        const data = await response.json();
        
        // 로딩 스피너를 제거하고, 결과 모달을 띄웁니다.
        cleanupUI(); 
        createResultModal(x, y, data);

    } catch (error) {
        console.error('Tetego 번역 오류:', error);
        cleanupUI();
        // 사용자에게 서버가 켜져 있는지 확인하라는 알림을 줍니다.
        alert(`번역에 실패했습니다. 로컬 서버(main.py)가 실행 중인지 확인해주세요.\n오류: ${error.message}`);
    }
}

// 4. 번역 결과를 보여줄 모달 창을 생성하는 함수
function createResultModal(x, y, data) {
    resultModal = document.createElement('div');
    resultModal.id = 'tetego-result-modal';

    // 모달의 HTML 구조를 만듭니다.
    resultModal.innerHTML = `
        <button id="tetego-modal-close-btn">&times;</button>
        <strong>${data.term}</strong>
        <p>${data.translation.replace(/\n/g, '<br>')}</p> 
    `;

    document.body.appendChild(resultModal);
    
    // 모달 위치를 조정합니다.
    resultModal.style.left = `${x}px`;
    resultModal.style.top = `${y + 15}px`;

    // 모달의 'x' 버튼을 누르면 모달이 닫히도록 합니다.
    document.getElementById('tetego-modal-close-btn').addEventListener('click', cleanupUI);
}

// 5. 로딩 중임을 알려주는 스피너를 생성하는 함수
function createLoadingSpinner(x, y) {
    loadingSpinner = document.createElement('div');
    loadingSpinner.id = 'tetego-loading-spinner';
    document.body.appendChild(loadingSpinner);

    loadingSpinner.style.left = `${x}px`;
    loadingSpinner.style.top = `${y + 15}px`;
}

// 6. 화면에 생성된 모든 UI(버튼, 모달, 스피너)를 지우는 함수
function cleanupUI() {
    if (searchButton) {
        searchButton.remove();
        searchButton = null;
    }
    if (resultModal) {
        resultModal.remove();
        resultModal = null;
    }
    if (loadingSpinner) {
        loadingSpinner.remove();
        loadingSpinner = null;
    }
}

// 7. 사용자가 웹페이지의 다른 곳을 클릭하면 UI를 모두 지웁니다.
document.addEventListener('mousedown', function(event) {
    // 클릭된 곳이 우리가 만든 UI의 일부가 아닐 경우에만 정리합니다.
    if (!event.target.closest('#tetego-search-button, #tetego-result-modal')) {
        cleanupUI();
    }
});
