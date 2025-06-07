import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import InterviewQuestion from "@/components/InterviewQuestion";
import JobSelectionScreen from "@/components/JobSelectionScreen";
import { geminiApi } from "@/services/geminiApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Clock, Home, RotateCcw } from "lucide-react";

interface InterviewQuestionType {
  question: string;
  hint: string;
}

interface AnswerResult {
  question: string;
  answer: string;
  timeSpent: number;
  evaluation: string;
  improvementPoints: string[];
  score: number;
}

const MockInterview = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<InterviewQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [answerResults, setAnswerResults] = useState<AnswerResult[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [hasResume, setHasResume] = useState(false);
  const [showJobSelection, setShowJobSelection] = useState(false);
  const [selectedJobType, setSelectedJobType] = useState("");

  useEffect(() => {
    // Check if resume data exists in localStorage
    const resumeData = localStorage.getItem("resumeSections");
    const hasResumeData = resumeData && JSON.parse(resumeData).length > 0;
    setHasResume(hasResumeData);
    
    if (hasResumeData) {
      // If resume exists, fetch questions based on resume
      fetchQuestionsFromResume();
    } else {
      // If no resume, show job selection
      setShowJobSelection(true);
    }
  }, []);

  const fetchQuestionsFromResume = async () => {
    setIsLoading(true);
    try {
      const fetchedQuestions = await geminiApi.getInterviewQuestions("general");
      setQuestions(fetchedQuestions);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Đã xảy ra lỗi khi tải câu hỏi phỏng vấn. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  const fetchQuestionsFromJobType = async (jobType: string) => {
    setIsLoading(true);
    try {
      const fetchedQuestions = await geminiApi.getInterviewQuestions(jobType);
      setQuestions(fetchedQuestions);
      setShowJobSelection(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Đã xảy ra lỗi khi tải câu hỏi phỏng vấn. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  const handleJobSelect = (jobType: string) => {
    setSelectedJobType(jobType);
    fetchQuestionsFromJobType(jobType);
  };

  const startInterview = () => {
    setInterviewStarted(true);
  };

  const handleAnswerSubmit = async (answer: string, timeSpent: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    try {
      const evaluation = await geminiApi.evaluateAnswer(currentQuestion.question, answer);

      const result: AnswerResult = {
        question: currentQuestion.question,
        answer,
        timeSpent,
        evaluation: evaluation.evaluation,
        improvementPoints: evaluation.improvementPoints,
        score: evaluation.score
      };
      setAnswerResults([...answerResults, result]);
      setTotalTime(totalTime + timeSpent);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setInterviewFinished(true);
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
      toast.error("Đã xảy ra lỗi khi đánh giá câu trả lời. Vui lòng thử lại.");
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-amber-600";
    return "text-red-600";
  };

  const getAverageScore = () => {
    if (answerResults.length === 0) return 0;
    const total = answerResults.reduce((sum, result) => sum + result.score, 0);
    return total / answerResults.length;
  };

  const resetInterview = () => {
    setInterviewStarted(false);
    setInterviewFinished(false);
    setCurrentQuestionIndex(0);
    setAnswerResults([]);
    setTotalTime(0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Phỏng vấn thử</h1>
        </div>
        
        {showJobSelection ? (
          <JobSelectionScreen onJobSelect={handleJobSelect} />
        ) : isLoading ? (
          <div className="py-20 text-center">
            <div className="mb-4 text-lg font-medium">
              {hasResume 
                ? "Đang chuẩn bị câu hỏi phỏng vấn dựa trên CV của bạn..." 
                : `Đang chuẩn bị câu hỏi phỏng vấn cho ngành ${selectedJobType}...`
              }
            </div>
            <Progress value={70} className="w-full max-w-md mx-auto" />
          </div>
        ) : (
          <>
            {!interviewStarted ? (
              <div className="max-w-3xl mx-auto text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Sẵn sàng cho phỏng vấn?</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Chúng tôi đã chuẩn bị {questions.length} câu hỏi phỏng vấn 
                  {hasResume 
                    ? " phù hợp với hồ sơ của bạn" 
                    : ` cho ngành ${selectedJobType}`
                  }. 
                  Mỗi câu trả lời sẽ được đánh giá và bạn sẽ nhận được phản hồi chi tiết.
                </p>
                
                {!hasResume && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      💡 Mẹo: Tải lên CV để nhận câu hỏi được cá nhân hóa hơn cho hồ sơ của bạn!
                    </p>
                  </div>
                )}
                
                <div className="mb-8 space-y-4">
                  <div className="p-4 bg-accent rounded-lg">
                    <h3 className="font-medium mb-2">Lưu ý:</h3>
                    <ul className="text-sm text-muted-foreground text-left list-disc pl-5 space-y-1">
                      <li>Thời gian sẽ bắt đầu đếm sau 3 giây khi mỗi câu hỏi hiển thị</li>
                      <li>Có thể sử dụng tính năng ghi âm bằng cách nhấn nút microphone</li>
                      <li>Có thể xem gợi ý bằng cách nhấn nút bóng đèn</li>
                      <li>Cố gắng trả lời một cách tự nhiên như trong phỏng vấn thực tế</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!hasResume && (
                    <Button 
                      onClick={() => setShowJobSelection(true)} 
                      variant="outline"
                      size="lg"
                    >
                      Chọn ngành khác
                    </Button>
                  )}
                  <Button onClick={startInterview} size="lg" className="gap-2">
                    <span>Bắt đầu phỏng vấn</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : !interviewFinished ? (
              <div className="py-8">
                <InterviewQuestion 
                  question={questions[currentQuestionIndex].question} 
                  questionNumber={currentQuestionIndex + 1} 
                  totalQuestions={questions.length} 
                  hint={questions[currentQuestionIndex].hint} 
                  onSubmit={handleAnswerSubmit} 
                />
              </div>
            ) : (
              <div className="py-8">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-3">Phỏng vấn hoàn thành!</h2>
                    <p className="text-lg text-muted-foreground">
                      Bạn đã hoàn thành tất cả {questions.length} câu hỏi phỏng vấn.
                    </p>
                    <div className="flex justify-center items-center gap-3 mt-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Tổng thời gian: {formatTime(totalTime)}</span>
                      </div>
                      <div className="h-4 w-px bg-border"></div>
                      <div className="text-sm text-muted-foreground">
                        Điểm trung bình: <span className={getScoreColor(getAverageScore())}>{(getAverageScore() * 10).toFixed(1)}/10</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {answerResults.map((result, index) => (
                      <Card key={index} className="mb-6">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Câu hỏi {index + 1}</CardTitle>
                            <div className="flex items-center gap-3">
                              <div className="text-sm text-muted-foreground">
                                Thời gian: {formatTime(result.timeSpent)}
                              </div>
                              <div className="text-sm">
                                Điểm: <span className={getScoreColor(result.score)}>{(result.score * 10).toFixed(1)}/10</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="font-medium mb-1">Câu hỏi:</div>
                            <div className="text-sm text-muted-foreground">{result.question}</div>
                          </div>
                          
                          <div>
                            <div className="font-medium mb-1">Câu trả lời của bạn:</div>
                            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{result.answer}</div>
                          </div>
                          
                          <div>
                            <div className="font-medium mb-1">Đánh giá:</div>
                            <div className="text-sm text-muted-foreground">{result.evaluation}</div>
                          </div>
                          
                          <div>
                            <div className="font-medium mb-1">Điểm cần cải thiện:</div>
                            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                              {result.improvementPoints.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-center mt-8 gap-4">
                    <Button onClick={resetInterview} variant="outline" className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Thử lại
                    </Button>
                    <Button onClick={() => navigate("/")} className="gap-2">
                      <Home className="h-4 w-4" />
                      Quay lại trang chủ
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MockInterview;
