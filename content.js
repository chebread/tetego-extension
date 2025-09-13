let searchButton;
let resultModal;
let loadingSpinner;

document.addEventListener('mouseup', handleTextSelection);

function handleTextSelection(event) {
    if (event.target.id.startsWith('tetego-')) {
        return;
    }

    const selectedText = window.getSelection().toString().trim();

    cleanupUI();

    if (selectedText.length > 0) {
        createSearchButton(event.pageX, event.pageY, selectedText);
    }
}

function createSearchButton(x, y, text) {
    searchButton = document.createElement('div');
    searchButton.id = 'tetego-search-button';
    searchButton.textContent = 'tetego로 검색';
    document.body.appendChild(searchButton);

    searchButton.style.left = `${x}px`;
    searchButton.style.top = `${y + 15}px`;

    searchButton.addEventListener('click', () => {
        fetchTranslation(x, y, text);
    });
}

async function fetchTranslation(x, y, text) {
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
        
        cleanupUI(); 
        createResultModal(x, y, data);

    } catch (error) {
        console.error('Tetego 번역 오류:', error);
        cleanupUI();
        alert(`번역에 실패했습니다. 로컬 서버(main.py)가 실행 중인지 확인해주세요.\n오류: ${error.message}`);
    }
}

function createResultModal(x, y, data) {
    resultModal = document.createElement('div');
    resultModal.id = 'tetego-result-modal';

    resultModal.innerHTML = `
        <button id="tetego-modal-close-btn">&times;</button>
        <strong>${data.term}</strong>
        <p>${data.translation.replace(/\n/g, '<br>')}</p> 
    `;

    document.body.appendChild(resultModal);
    
    resultModal.style.left = `${x}px`;
    resultModal.style.top = `${y + 15}px`;

    document.getElementById('tetego-modal-close-btn').addEventListener('click', cleanupUI);
}

function createLoadingSpinner(x, y) {
    loadingSpinner = document.createElement('div');
    loadingSpinner.id = 'tetego-loading-spinner';
    document.body.appendChild(loadingSpinner);

    loadingSpinner.style.left = `${x}px`;
    loadingSpinner.style.top = `${y + 15}px`;
}

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

document.addEventListener('mousedown', function(event) {
    if (!event.target.closest('#tetego-search-button, #tetego-result-modal')) {
        cleanupUI();
    }
});
