const sourceLanguage = document.getElementById('sourceLanguage');
const targetLanguage = document.getElementById('targetLanguage');
const swapBtn = document.getElementById('swapBtn');
const sourceText = document.getElementById('sourceText');
const targetText = document.getElementById('targetText');
const translateBtn = document.getElementById('translateBtn');
const errorMsg = document.getElementById('errorMsg');

function checkDirection() {
  sourceText.classList.toggle('rtl', sourceLanguage.value === 'ar');
  targetText.classList.toggle('rtl', targetLanguage.value === 'ar');
}

swapBtn.addEventListener('click', function() {
  const tempLang = sourceLanguage.value;
  sourceLanguage.value = targetLanguage.value;
  targetLanguage.value = tempLang;

  const tempText = sourceText.value;
  sourceText.value = targetText.value;
  targetText.value = tempText;

  checkDirection();
});

sourceLanguage.addEventListener('change', checkDirection);
targetLanguage.addEventListener('change', checkDirection);

async function translateText() {
  const text = sourceText.value.trim();

  if (!text) {
    targetText.value = '';
    return;
  }

  translateBtn.disabled = true;
  translateBtn.textContent = 'Translating...';
  errorMsg.style.display = 'none';

  try {
    const source = sourceLanguage.value;
    const target = targetLanguage.value;

    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`);
    const data = await response.json();

    if (data.responseData && data.responseData.translatedText) {
      targetText.value = data.responseData.translatedText;
    } else {
      throw new Error('Translation failed');
    }
  } catch (error) {
    errorMsg.textContent = 'Translation error. Please try again.';
    errorMsg.style.display = 'block';
  } finally {
    translateBtn.disabled = false;
    translateBtn.textContent = 'Translate';
  }
}

translateBtn.addEventListener('click', translateText);

let typingTimer;
sourceText.addEventListener('input', function() {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(translateText, 800);
});

checkDirection();