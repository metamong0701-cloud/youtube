// DOM 요소 선택
const characterFileInput = document.getElementById('characterFile');
const previewArea = document.getElementById('previewArea');
const previewImage = document.getElementById('previewImage');
const saveDefaultBtn = document.getElementById('saveDefaultBtn');
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const initialState = document.getElementById('initialState');
const loadingState = document.getElementById('loadingState');
const resultState = document.getElementById('resultState');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const toggleApiKeyBtn = document.getElementById('toggleApiKeyBtn');
const apiStatus = document.getElementById('apiStatus');
const deleteCharacterBtn = document.getElementById('deleteCharacterBtn');
const savedStatus = document.getElementById('savedStatus');

// 전역 변수
let currentCharacterImage = null;
let generatedImageData = null;

// LocalStorage 키
const STORAGE_KEY = 'bananaStudio_defaultCharacter';
const API_KEY_STORAGE = 'bananaStudio_apiKey';

// Gemini API 설정
let GEMINI_API_KEY = localStorage.getItem(API_KEY_STORAGE) || '';

// 페이지 로드 시 기본 캐릭터 불러오기
window.addEventListener('DOMContentLoaded', () => {
    loadDefaultCharacter();
    updateApiStatus();
    
    // 저장된 API 키가 있으면 입력창에 표시
    if (GEMINI_API_KEY) {
        apiKeyInput.value = GEMINI_API_KEY;
    }
});

// API 키 상태 업데이트
function updateApiStatus() {
    const statusText = apiStatus.querySelector('.status-text');
    if (GEMINI_API_KEY) {
        statusText.textContent = '설정됨 ✓';
        statusText.classList.add('active');
    } else {
        statusText.textContent = '미설정';
        statusText.classList.remove('active');
    }
}

// 저장 상태 UI 업데이트
function updateSavedStatus() {
    const savedCharacter = localStorage.getItem(STORAGE_KEY);
    if (savedCharacter && currentCharacterImage === savedCharacter) {
        savedStatus.style.display = 'block';
        saveDefaultBtn.classList.add('saved');
        saveDefaultBtn.innerHTML = '✅ 저장됨 (기본 캐릭터)';
    } else {
        savedStatus.style.display = 'none';
        saveDefaultBtn.classList.remove('saved');
        saveDefaultBtn.innerHTML = '⭐ 기본 캐릭터로 저장';
    }
}

// API 키 저장 버튼
saveApiKeyBtn.addEventListener('click', () => {
    const newKey = apiKeyInput.value.trim();
    
    if (newKey === '') {
        // API 키 삭제
        if (confirm('API 키를 삭제하시겠습니까?')) {
            localStorage.removeItem(API_KEY_STORAGE);
            GEMINI_API_KEY = '';
            apiKeyInput.value = '';
            updateApiStatus();
            alert('✅ API 키가 삭제되었습니다.');
        }
    } else {
        // API 키 저장
        GEMINI_API_KEY = newKey;
        localStorage.setItem(API_KEY_STORAGE, GEMINI_API_KEY);
        updateApiStatus();
        alert('✅ API 키가 저장되었습니다.');
    }
});

// API 키 표시/숨김 토글
toggleApiKeyBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleApiKeyBtn.textContent = '🔒';
    } else {
        apiKeyInput.type = 'password';
        toggleApiKeyBtn.textContent = '👁️';
    }
});

// Enter 키로 API 키 저장
apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveApiKeyBtn.click();
    }
});

// 파일 선택 이벤트
characterFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImageFile(file);
    } else {
        alert('이미지 파일을 선택해주세요.');
    }
});

// 이미지 파일 로드 및 미리보기
function loadImageFile(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        currentCharacterImage = e.target.result;
        previewImage.src = currentCharacterImage;
        previewArea.style.display = 'block';
        updateSavedStatus();
    };
    
    reader.readAsDataURL(file);
}

// 기본 캐릭터로 저장
saveDefaultBtn.addEventListener('click', () => {
    if (currentCharacterImage) {
        try {
            localStorage.setItem(STORAGE_KEY, currentCharacterImage);
            updateSavedStatus();
            alert('✅ 기본 캐릭터로 저장되었습니다!\n페이지를 새로고침해도 자동으로 불러옵니다.');
        } catch (e) {
            alert('❌ 저장에 실패했습니다. 이미지 크기가 너무 클 수 있습니다.');
        }
    }
});

// 캐릭터 삭제 버튼
deleteCharacterBtn.addEventListener('click', () => {
    if (confirm('현재 캐릭터를 삭제하시겠습니까?\n(기본 캐릭터로 저장된 것도 함께 삭제됩니다)')) {
        // LocalStorage에서 삭제
        localStorage.removeItem(STORAGE_KEY);
        
        // UI 초기화
        currentCharacterImage = null;
        previewImage.src = '';
        previewArea.style.display = 'none';
        characterFileInput.value = '';
        
        alert('✅ 캐릭터가 삭제되었습니다.');
    }
});

// 기본 캐릭터 불러오기
function loadDefaultCharacter() {
    const savedCharacter = localStorage.getItem(STORAGE_KEY);
    if (savedCharacter) {
        currentCharacterImage = savedCharacter;
        previewImage.src = currentCharacterImage;
        previewArea.style.display = 'block';
        updateSavedStatus();
    }
}

// 이미지 생성 버튼 클릭
generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    
    // 입력 검증
    if (!currentCharacterImage) {
        alert('❌ 캐릭터 이미지를 먼저 업로드해주세요.');
        return;
    }
    
    if (!prompt) {
        alert('❌ 프롬프트를 입력해주세요.');
        return;
    }
    
    // UI 상태 변경: 로딩 시작
    showLoadingState();
    
    try {
        // Gemini API 호출
        const result = await generateImageWithGemini(currentCharacterImage, prompt);
        
        // 생성 성공
        if (result.success) {
            generatedImageData = result.imageData;
            resultImage.src = generatedImageData;
            showResultState();
        } else {
            throw new Error(result.error || '이미지 생성에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`❌ 오류가 발생했습니다: ${error.message}`);
        showInitialState();
    }
});

// Gemini API를 통한 이미지 생성
async function generateImageWithGemini(characterImage, prompt) {
    // API 키 확인
    if (!GEMINI_API_KEY) {
        alert('❌ API 키를 먼저 입력해주세요.');
        return {
            success: false,
            error: 'API 키가 필요합니다.'
        };
    }

    try {
        // Base64 이미지 데이터 추출
        const base64Data = characterImage.split(',')[1];
        const mimeType = characterImage.split(';')[0].split(':')[1];

        // Gemini API 호출 (v1 API 사용)
        const model = 'gemini-1.5-pro';
        
        console.log(`[DEBUG] ${model} 모델로 API 호출 시도...`);
        console.log(`[DEBUG] API 엔드포인트: v1/models/${model}:generateContent`);
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: `이 캐릭터의 스타일과 특징을 유지하면서 다음 상황을 그려주세요: ${prompt}\n\n중요: 캐릭터의 외형, 색상, 스타일을 정확히 유지하고, 요청된 상황에 맞는 새로운 포즈와 배경을 만들어주세요.`
                            },
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: base64Data
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[ERROR] API 응답 실패 (${response.status}):`, errorData);
            throw new Error(errorData.error?.message || `API 호출 실패 (상태: ${response.status})`);
        }

        const data = await response.json();
        console.log(`[DEBUG] ${model} 모델 응답 성공:`, data);
        
        // 텍스트 응답 확인
        const textDescription = data.candidates?.[0]?.content?.parts?.[0]?.text || '생성 실패';
        console.log(`[DEBUG] AI 생성 텍스트:`, textDescription);
        
        // Canvas를 사용하여 원본 이미지 위에 프롬프트 결과 표시
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        return new Promise((resolve) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // 원본 이미지 그리기
                ctx.drawImage(img, 0, 0);
                
                // 반투명 오버레이
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(0, canvas.height - 150, canvas.width, 150);
                
                // 텍스트 추가
                ctx.fillStyle = '#FFD93D';
                ctx.font = 'bold 20px Arial';
                ctx.fillText('AI 생성 설명:', 20, canvas.height - 120);
                
                ctx.fillStyle = 'white';
                ctx.font = '16px Arial';
                const words = textDescription.split(' ');
                let line = '';
                let y = canvas.height - 90;
                
                for (let word of words) {
                    const testLine = line + word + ' ';
                    if (ctx.measureText(testLine).width > canvas.width - 40 && line !== '') {
                        ctx.fillText(line, 20, y);
                        line = word + ' ';
                        y += 25;
                        if (y > canvas.height - 20) break;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, 20, y);
                
                resolve({
                    success: true,
                    imageData: canvas.toDataURL('image/png')
                });
            };
            
            img.onerror = () => {
                resolve({
                    success: false,
                    error: '이미지 로드 실패'
                });
            };
            
            img.src = characterImage;
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        
        // API 키가 잘못된 경우 초기화
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key')) {
            localStorage.removeItem(API_KEY_STORAGE);
            GEMINI_API_KEY = '';
            return {
                success: false,
                error: 'API 키가 유효하지 않습니다. 새 API 키를 입력해주세요.'
            };
        }
        
        return {
            success: false,
            error: error.message
        };
    }
}

// UI 상태 관리 함수들
function showInitialState() {
    initialState.style.display = 'block';
    loadingState.style.display = 'none';
    resultState.style.display = 'none';
    generateBtn.disabled = false;
}

function showLoadingState() {
    initialState.style.display = 'none';
    loadingState.style.display = 'block';
    resultState.style.display = 'none';
    generateBtn.disabled = true;
}

function showResultState() {
    initialState.style.display = 'none';
    loadingState.style.display = 'none';
    resultState.style.display = 'block';
    generateBtn.disabled = false;
}

// 다운로드 버튼 클릭
downloadBtn.addEventListener('click', () => {
    if (generatedImageData) {
        downloadImage(generatedImageData, 'character_result.png');
    }
});

// 이미지 다운로드 함수
function downloadImage(imageData, filename) {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 프롬프트 입력창 엔터키 처리 (Shift+Enter는 줄바꿈, Enter만 누르면 생성)
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateBtn.click();
    }
});
