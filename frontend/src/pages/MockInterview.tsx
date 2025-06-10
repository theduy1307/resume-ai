import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import InterviewQuestion from "@/components/InterviewQuestion";
import InterviewSetupForm from "@/components/InterviewSetupForm";
import { geminiApi, generateInterviewQuestionsFromBackend, submitInterviewAnswers } from "@/services/geminiApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Clock, Home, RotateCcw, Brain } from "lucide-react";

interface InterviewQuestionType {
  question: string;
  hint: string;
}

interface AnswerResult {
  question: string;
  answer: string;
  timeSpent: number;
  evaluation?: string;
  improvementPoints?: string[];
  score?: number;
}

interface BackendEvaluationResult {
  totalScore: number;
  questionScores: Array<{
    questionId: number;
    score: number;
    feedback: string;
  }>;
  generalFeedback: string;
  improvementSuggestions: string;
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
  const [showInterviewSetup, setShowInterviewSetup] = useState(false);
  const [interviewInfo, setInterviewInfo] = useState<{position: string; field: string; level: string} | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [backendEvaluation, setBackendEvaluation] = useState<BackendEvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    // Check if resume data exists in localStorage
    const resumeData = localStorage.getItem("resumeSections");
    const hasResumeData = resumeData && JSON.parse(resumeData).length > 0;
    setHasResume(hasResumeData);
    
    if (hasResumeData) {
      // If resume exists, fetch questions based on resume
      fetchQuestionsFromResume();
    } else {
      // If no resume, show interview setup
      setShowInterviewSetup(true);
    }
  }, []);

  const fetchQuestionsFromResume = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingMessage("Đang phân tích CV của bạn...");

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 200);

      setLoadingMessage("Đang tạo câu hỏi phỏng vấn phù hợp...");

      // Thêm delay tối thiểu để đảm bảo loading screen hiển thị
      const [fetchedQuestions] = await Promise.all([
        geminiApi.getInterviewQuestions("general"),
        new Promise(resolve => setTimeout(resolve, 1500)) // Delay tối thiểu 1.5 giây
      ]);

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingMessage("Hoàn thành!");

      // Delay nhỏ để hiển thị 100%
      await new Promise(resolve => setTimeout(resolve, 300));

      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Đã xảy ra lỗi khi tải câu hỏi phỏng vấn. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
      setLoadingMessage("");
    }
  };

  const fetchQuestionsFromInterviewInfo = async (info: {position: string; field: string; level: string}) => {
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingMessage(`Đang chuẩn bị câu hỏi cho vị trí ${info.position}...`);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 90) return prev + 8;
          return prev;
        });
      }, 250);

      setLoadingMessage(`Đang tạo câu hỏi phù hợp với cấp độ ${info.level}...`);

      // Thêm delay tối thiểu để đảm bảo loading screen hiển thị
      const [fetchedQuestions] = await Promise.all([
        generateInterviewQuestionsFromBackend(info.position, info.field, info.level),
        new Promise(resolve => setTimeout(resolve, 2000)) // Delay tối thiểu 2 giây
      ]);

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingMessage("Hoàn thành!");

      // Delay nhỏ để hiển thị 100%
      await new Promise(resolve => setTimeout(resolve, 300));

      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Đã xảy ra lỗi khi tải câu hỏi phỏng vấn. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
      setLoadingMessage("");
    }
  };

  const handleInterviewSetup = (info: {position: string; field: string; level: string}) => {
    setInterviewInfo(info);
    setShowInterviewSetup(false); // Ẩn form setup ngay lập tức
    fetchQuestionsFromInterviewInfo(info);
  };

  const startInterview = () => {
    setInterviewStarted(true);
  };

  const handleAnswerSubmit = async (answer: string, timeSpent: number) => {
    const currentQuestion = questions[currentQuestionIndex];

    // Chỉ thu thập câu trả lời, không đánh giá ngay
    const result: AnswerResult = {
      question: currentQuestion.question,
      answer,
      timeSpent
    };

    const newAnswerResults = [...answerResults, result];
    setAnswerResults(newAnswerResults);
    setTotalTime(totalTime + timeSpent);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Khi hoàn thành tất cả câu hỏi, bắt đầu đánh giá
      await evaluateAllAnswers(newAnswerResults);
    }
  };

  const evaluateAllAnswers = async (allAnswers: AnswerResult[]) => {
    if (!interviewInfo) {
      toast.error("Thiếu thông tin phỏng vấn");
      return;
    }

    setIsEvaluating(true);
    setLoadingProgress(0);
    setLoadingMessage("Đang phân tích câu trả lời của bạn...");

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 300);

      // Chuẩn bị dữ liệu cho backend
      const answersForBackend = allAnswers.map((answer, index) => ({
        questionId: index + 1,
        questionText: answer.question,
        answerText: answer.answer
      }));

      setLoadingMessage("Đang chấm điểm và đưa ra nhận xét...");

      // Gửi đến backend để đánh giá với delay tối thiểu
      const [evaluation] = await Promise.all([
        submitInterviewAnswers(
          interviewInfo.position,
          interviewInfo.field,
          interviewInfo.level,
          answersForBackend
        ),
        new Promise(resolve => setTimeout(resolve, 2500)) // Delay tối thiểu 2.5 giây
      ]);

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingMessage("Hoàn thành đánh giá!");

      setBackendEvaluation(evaluation);

      // Cập nhật answerResults với kết quả đánh giá từ backend
      const updatedAnswers = allAnswers.map((answer, index) => {
        const questionScore = evaluation.questionScores.find((qs: any) => qs.questionId === index + 1);
        return {
          ...answer,
          evaluation: questionScore?.feedback || "Không có đánh giá",
          score: questionScore?.score || 0,
          improvementPoints: [] // Backend không trả về improvement points riêng cho từng câu
        };
      });

      // Delay nhỏ để hiển thị 100%
      await new Promise(resolve => setTimeout(resolve, 500));

      setAnswerResults(updatedAnswers);
      setInterviewFinished(true);
      toast.success("Đánh giá hoàn thành!");
    } catch (error) {
      console.error("Error evaluating answers:", error);
      toast.error("Đã xảy ra lỗi khi đánh giá câu trả lời. Vui lòng thử lại.");
    } finally {
      setIsEvaluating(false);
      setLoadingProgress(0);
      setLoadingMessage("");
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
    // Tính điểm trung bình từ các câu trả lời (thang 100)
    const total = answerResults.reduce((sum, result) => sum + (result.score || 0), 0);
    return total / answerResults.length;
  };

  const resetInterview = () => {
    setInterviewStarted(false);
    setInterviewFinished(false);
    setCurrentQuestionIndex(0);
    setAnswerResults([]);
    setTotalTime(0);
    setBackendEvaluation(null);
    setIsEvaluating(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Phỏng vấn thử</h1>
        </div>
        
        {showInterviewSetup ? (
          <InterviewSetupForm onSubmit={handleInterviewSetup} />
        ) : isLoading ? (
          <div className="py-20 text-center">
            <div className="max-w-md mx-auto">
              {/* Loading Icon */}
              <div className="mb-6">
                <Brain className="h-16 w-16 mx-auto text-primary animate-pulse" />
              </div>

              {/* Loading Message */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Đang chuẩn bị phỏng vấn</h3>
                <p className="text-lg font-medium text-primary mb-2">
                  {loadingMessage || (hasResume
                    ? "Đang chuẩn bị câu hỏi phỏng vấn dựa trên CV của bạn..."
                    : `Đang chuẩn bị câu hỏi phỏng vấn cho vị trí ${interviewInfo?.position}...`
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  AI đang phân tích và tạo ra những câu hỏi phù hợp nhất cho bạn
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <Progress
                  value={loadingProgress || 70}
                  className="w-full h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>{Math.round(loadingProgress || 70)}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Loading Tips */}
              <div className="text-xs text-muted-foreground">
                <p>💡 Mẹo: Hãy chuẩn bị tinh thần thoải mái và trả lời một cách tự nhiên nhất</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {isEvaluating ? (
              <div className="py-20 text-center">
                <div className="max-w-md mx-auto">
                  {/* Loading Icon */}
                  <div className="mb-6">
                    <Brain className="h-16 w-16 mx-auto text-primary animate-pulse" />
                  </div>

                  {/* Loading Message */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Đang đánh giá kết quả</h3>
                    <p className="text-lg font-medium text-primary mb-2">
                      {loadingMessage || "Đang phân tích câu trả lời của bạn..."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      AI đang chấm điểm và đưa ra nhận xét chi tiết cho từng câu trả lời
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <Progress
                      value={loadingProgress}
                      className="w-full h-3"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>{Math.round(loadingProgress)}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Loading Tips */}
                  <div className="text-xs text-muted-foreground">
                    <p>💡 Mẹo: Kết quả đánh giá sẽ giúp bạn cải thiện kỹ năng phỏng vấn</p>
                  </div>
                </div>
              </div>
            ) : !interviewStarted ? (
              <div className="max-w-3xl mx-auto text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Sẵn sàng cho phỏng vấn?</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Chúng tôi đã chuẩn bị {questions.length} câu hỏi phỏng vấn
                  {hasResume
                    ? " phù hợp với hồ sơ của bạn"
                    : ` cho vị trí ${interviewInfo?.position} trong lĩnh vực ${interviewInfo?.field}`
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
                      onClick={() => setShowInterviewSetup(true)}
                      variant="outline"
                      size="lg"
                    >
                      Thay đổi thông tin
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
                        Điểm trung bình: <span className={getScoreColor(getAverageScore() / 10)}>{getAverageScore().toFixed(1)}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Hiển thị đánh giá tổng quan từ backend */}
                  {backendEvaluation && (
                    <div className="mb-8 space-y-4">
                      <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                          <CardTitle className="text-blue-800">📊 Đánh giá tổng quan</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-blue-700">{backendEvaluation.generalFeedback}</p>
                        </CardContent>
                      </Card>

                      <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                          <CardTitle className="text-green-800">💡 Gợi ý cải thiện</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-green-700">{backendEvaluation.improvementSuggestions}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}



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
                                Điểm: <span className={getScoreColor((result.score || 0) / 10)}>{result.score || 0}/100</span>
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
                          
                          {result.improvementPoints && result.improvementPoints.length > 0 && (
                            <div>
                              <div className="font-medium mb-1">Điểm cần cải thiện:</div>
                              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                                {result.improvementPoints.map((point, i) => (
                                  <li key={i}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          )}
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
