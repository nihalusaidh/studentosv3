const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export function isSpeechSupported() {
  return !!SpeechRecognition
}

export function createRecognizer(lang = 'en-US') {
  if (!SpeechRecognition) return null
  const recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = lang
  recognition.maxAlternatives = 1
  return recognition
}

export function getSupportedLanguages() {
  return [
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'en-IN', label: 'English (India)' },
    { code: 'hi-IN', label: 'Hindi' },
    { code: 'es-ES', label: 'Spanish' },
    { code: 'fr-FR', label: 'French' },
    { code: 'de-DE', label: 'German' },
    { code: 'ja-JP', label: 'Japanese' },
    { code: 'ko-KR', label: 'Korean' },
    { code: 'zh-CN', label: 'Chinese (Simplified)' },
    { code: 'ar-SA', label: 'Arabic' },
    { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  ]
}
