
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Lightbulb, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";

interface InterviewQuestionProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  hint?: string;
  onSubmit: (answer: string, timeSpent: number) => void;
}

const InterviewQuestion = ({
  question,
  questionNumber,
  totalQuestions,
  hint,
  onSubmit
}: InterviewQuestionProps) => {
  const [answer, setAnswer] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Speech Recognition
  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    language: 'vi-VN',
    continuous: true,
    interimResults: true
  });

  // Reset all state when question changes
  useEffect(() => {
    setAnswer("");
    setStartTime(null);
    setTimeSpent(0);
    setTimerRunning(false);
    setShowHint(false);

    // Stop listening and reset transcript
    if (isListening) {
      stopListening();
    }
    resetTranscript();
  }, [question]); // Simplified dependencies

  // Update answer when speech recognition provides new transcript
  useEffect(() => {
    if (transcript && transcript.trim()) {
      setAnswer(prev => {
        // Nếu đang ghi âm, thay thế toàn bộ nội dung
        // Nếu không, thêm vào cuối
        if (isListening) {
          return transcript;
        } else {
          // Chỉ thêm nếu transcript mới khác với phần cuối của answer hiện tại
          if (!prev.includes(transcript)) {
            return prev ? prev + ' ' + transcript : transcript;
          }
          return prev;
        }
      });
    }
  }, [transcript, isListening]);

  useEffect(() => {
    // Start timer after 3 seconds delay when question changes
    const timerDelay = setTimeout(() => {
      setStartTime(Date.now());
      setTimerRunning(true);
    }, 3000);

    return () => {
      clearTimeout(timerDelay);
    };
  }, [question]); // Dependency on question to restart timer for each new question

  useEffect(() => {
    let interval: number;

    if (timerRunning && startTime) {
      interval = window.setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        setTimeSpent(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, startTime]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleMicrophoneClick = () => {
    if (!isSupported) {
      toast.error("Trình duyệt không hỗ trợ nhận diện giọng nói");
      return;
    }

    if (isListening) {
      stopListening();
      toast.success("Đã dừng ghi âm");
    } else {
      // Reset transcript trước khi bắt đầu ghi âm mới
      resetTranscript();
      startListening();
      toast.info("Đang ghi âm... Hãy nói tiếng Việt");
    }
  };

  const handleSubmit = () => {
    if (!answer.trim()) {
      toast.error("Vui lòng nhập câu trả lời trước khi tiếp tục");
      return;
    }
    
    setTimerRunning(false);
    onSubmit(answer, timeSpent);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            Câu hỏi {questionNumber}/{totalQuestions}
          </CardTitle>
          <div className="px-3 py-1 bg-resume-light text-resume-primary rounded-full text-sm font-medium">
            {formatTime(timeSpent)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-medium p-4 bg-muted rounded-md">
          {question}
        </div>
        
        {showHint && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm transition-all duration-300">
            <div className="font-medium mb-1 text-yellow-800">💡 Gợi ý:</div>
            <div className="text-yellow-700">
              {hint || "Hãy trả lời một cách tự tin và cụ thể. Sử dụng ví dụ thực tế để minh họa cho câu trả lời của bạn."}
            </div>
          </div>
        )}

        {speechError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {speechError}
            </AlertDescription>
          </Alert>
        )}

        {isListening && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
            <div className="font-medium mb-1 text-blue-800 flex items-center gap-2">
              <Mic className="h-4 w-4 animate-pulse" />
              Đang nghe...
            </div>
            {interimTranscript && (
              <div className="text-gray-600 italic">"{interimTranscript}"</div>
            )}
          </div>
        )}
        
        <Textarea
          placeholder="Nhập câu trả lời của bạn ở đây hoặc sử dụng microphone..."
          className="min-h-[150px]"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleMicrophoneClick}
            disabled={!isSupported}
            className={isListening ? 'bg-red-50 border-red-200' : ''}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 text-red-500" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowHint(!showHint)}
          >
            <Lightbulb className="h-4 w-4" />
          </Button>
        </div>
        
        <Button onClick={handleSubmit} className="gap-2">
          <span>Tiếp theo</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterviewQuestion;
