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

// 전역 변수
let currentCharacterImage = null;
let generatedImageData = null;

// LocalStorage 키
const STORAGE_KEY = 'bananaStudio_defaultCharacter';

// 페이지 로드 시 기본 캐릭터 불러오기
window.addEventListener('DOMContentLoaded', () => {
    loadDefaultCharacter();
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
    };
    
    reader.readAsDataURL(file);
}

// 기본 캐릭터로 저장
saveDefaultBtn.addEventListener('click', () => {
    if (currentCharacterImage) {
        try {
            localStorage.setItem(STORAGE_KEY, currentCharacterImage);
            alert('✅ 기본 캐릭터로 저장되었습니다!');
        } catch (e) {
            alert('❌ 저장에 실패했습니다. 이미지 크기가 너무 클 수 있습니다.');
        }
    }
});

// 기본 캐릭터 불러오기
function loadDefaultCharacter() {
    const savedCharacter = localStorage.getItem(STORAGE_KEY);
    if (savedCharacter) {
        currentCharacterImage = savedCharacter;
        previewImage.src = currentCharacterImage;
        previewArea.style.display = 'block';
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
    // TODO: 실제 Gemini API 연동 구현
    // 현재는 시뮬레이션 버전
    
    return new Promise((resolve) => {
        // 시뮬레이션: 3초 후 원본 이미지 반환
        setTimeout(() => {
            resolve({
                success: true,
                imageData: characterImage // 실제로는 Gemini API에서 받은 새 이미지
            });
        }, 3000);
    });
    
    /* 실제 API 연동 예시 코드:
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                characterImage: characterImage,
                prompt: prompt
            })
        });
        
        if (!response.ok) {
            throw new Error('API 호출 실패');
        }
        
        const data = await response.json();
        return {
            success: true,
            imageData: data.imageUrl
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
    */
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
