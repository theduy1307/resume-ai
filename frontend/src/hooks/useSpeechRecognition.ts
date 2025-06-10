import { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Extend Window interface for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const useSpeechRecognition = (
  options: SpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
  const {
    language = 'vi-VN', // Tiếng Việt
    continuous = true,
    interimResults = true,
    maxAlternatives = 1
  } = options;

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if Speech Recognition is supported
  const isSupported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) {
      setError('Trình duyệt không hỗ trợ nhận diện giọng nói');
      return;
    }

    // Initialize Speech Recognition
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    // Configure Speech Recognition
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;

    // Handle speech recognition events
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      let errorMessage = 'Lỗi nhận diện giọng nói';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'Không phát hiện giọng nói. Vui lòng thử lại.';
          break;
        case 'audio-capture':
          errorMessage = 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.';
          break;
        case 'not-allowed':
          errorMessage = 'Quyền truy cập microphone bị từ chối. Vui lòng cấp quyền trong trình duyệt.';
          break;
        case 'network':
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
          break;
        case 'language-not-supported':
          errorMessage = 'Ngôn ngữ không được hỗ trợ.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Dịch vụ nhận diện giọng nói không khả dụng.';
          break;
        default:
          errorMessage = `Lỗi nhận diện giọng nói: ${event.error}`;
      }
      
      setError(errorMessage);
    };

    recognition.onresult = (event) => {
      let interimTranscriptText = '';
      let finalTranscriptText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPart = result[0].transcript;

        if (result.isFinal) {
          finalTranscriptText += transcriptPart + ' ';
        } else {
          interimTranscriptText += transcriptPart;
        }
      }

      setInterimTranscript(interimTranscriptText);
      
      if (finalTranscriptText) {
        setFinalTranscript(prev => prev + finalTranscriptText);
        setTranscript(prev => prev + finalTranscriptText);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, interimResults, maxAlternatives, isSupported]);

  const startListening = () => {
    if (!isSupported) {
      setError('Trình duyệt không hỗ trợ nhận diện giọng nói');
      return;
    }

    if (recognitionRef.current && !isListening) {
      setError(null);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
  };

  return {
    transcript: transcript + interimTranscript,
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  };
};

export default useSpeechRecognition;