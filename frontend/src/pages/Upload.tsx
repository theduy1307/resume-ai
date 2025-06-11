
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, MessageSquare, Trash2, Loader2, Brain } from "lucide-react";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import useLocalStorage from "@/hooks/useLocalStorage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { extractTextFromFile, analyzeResume } from "@/services/geminiApi";
import TextConfirmationDialog from "@/components/TextConfirmationDialog";

interface ResumeSection {
  id: string;
  title: string;
  content: string;
}

const Upload = () => {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [resumeSections, setResumeSections] = useLocalStorage<ResumeSection[]>("resumeSections", []);

  const [uploading, setUploading] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [currentFilename, setCurrentFilename] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load job description from localStorage
    const savedJobDescription = localStorage.getItem("jobDescription");
    if (savedJobDescription) {
      setJobDescriptionText(savedJobDescription);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      setResumeFile(file);
      
      // Only extract text, don't analyze with Gemini yet
      const result = await extractTextFromFile(file);
      
      setExtractedText(result.extractedText);
      setCurrentFilename(result.filename);
      setShowTextDialog(true);
      
      toast.success("Đã trích xuất text từ file thành công");
    } catch (error) {
      console.error("Error extracting text:", error);
      toast.error(error instanceof Error ? error.message : "Lỗi khi trích xuất text từ file");
      setResumeFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleTextConfirm = async (confirmedText: string) => {
    try {
      // Store confirmed text for later use
      localStorage.setItem("extractedText", confirmedText);
      
      // Create mock sections for display (actual analysis will happen when user clicks evaluate)
      const mockSections = [
        {
          id: "extracted-content",
          title: "Nội dung CV",
          content: confirmedText.substring(0, 200) + (confirmedText.length > 200 ? "..." : "")
        }
      ];
      
      setResumeSections(mockSections);
      toast.success("Đã xác nhận nội dung CV thành công");
    } catch (error) {
      toast.error("Lỗi khi lưu nội dung CV");
    }
  };

  const handleDialogClose = () => {
    setShowTextDialog(false);
    // Reset extracted text state khi đóng dialog
    setExtractedText("");
    setCurrentFilename("");
    // Reset file state nếu user hủy
    setResumeFile(null);
  };

  const handleJobDescriptionFileUpload = async (file: File) => {
    try {
      setJobDescriptionFile(file);

      // Extract text from JD file
      const result = await extractTextFromFile(file);
      const jdText = result.extractedText;

      setJobDescriptionText(jdText);
      localStorage.setItem("jobDescription", jdText);

      toast.success("Mô tả công việc đã được tải lên thành công");
    } catch (error) {
      console.error("Error extracting JD text:", error);
      toast.error("Lỗi khi trích xuất text từ file JD");
      setJobDescriptionFile(null);
    }
  };

  const handleClearResume = () => {
    setResumeFile(null);
    setResumeSections([]);
    localStorage.removeItem("resumeSections");
    localStorage.removeItem("resumeSectionsForEval");
    localStorage.removeItem("resumeSectionsForInterview");
    localStorage.removeItem("extractedText");
    toast.success("Đã xóa CV thành công");
  };

  const handleClearJobDescription = () => {
    setJobDescriptionFile(null);
    setJobDescriptionText("");
    localStorage.removeItem("jobDescription");
    toast.success("Đã xóa mô tả công việc thành công");
  };

  const handleEvaluate = async () => {
    // Check if extracted text exists
    const savedText = localStorage.getItem("extractedText");
    if (!savedText && resumeSections.length === 0) {
      toast.error("Vui lòng tải lên CV trước");
      return;
    }

    setIsAnalyzing(true);
    setLoadingProgress(0);
    setLoadingMessage("Đang phân tích nội dung CV...");

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 300);

      // If we have extracted text, analyze it with Gemini
      if (savedText) {
        setLoadingMessage(jobDescriptionText
          ? "Đang so sánh CV với mô tả công việc..."
          : "Đang tạo nội dung cải thiện cho CV...");

        // Add minimum delay to ensure loading screen is visible
        const [analysis] = await Promise.all([
          analyzeResume(savedText, jobDescriptionText || undefined),
          new Promise(resolve => setTimeout(resolve, 2000)) // Minimum 2 seconds delay
        ]);

        clearInterval(progressInterval);
        setLoadingProgress(100);
        setLoadingMessage("Hoàn thành phân tích!");

        // Convert to sections format
        const analyzedSections = analysis.sections.map((section, index) => ({
          id: `section-${index}`,
          title: section.title,
          content: section.content,
          improvements: section.improvedContent,
          reason: section.reason,
        }));

        // Save analyzed data
        localStorage.setItem("resumeSectionsForEval", JSON.stringify(analyzedSections));

        if (analysis.personalInfo) {
          localStorage.setItem("personalInfo", JSON.stringify(analysis.personalInfo));
        }
      } else {
        // Use existing sections
        localStorage.setItem("resumeSectionsForEval", JSON.stringify(resumeSections));
        clearInterval(progressInterval);
        setLoadingProgress(100);
        setLoadingMessage("Hoàn thành!");
      }

      localStorage.setItem("jobDescription", jobDescriptionText);

      // Small delay to show 100%
      await new Promise(resolve => setTimeout(resolve, 300));

      // Navigate to evaluation page
      navigate("/evaluation");
    } catch (error) {
      console.error("Error analyzing resume:", error);

      // Provide more specific error messages
      let errorMessage = "Lỗi khi phân tích CV";
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Quá thời gian chờ. Vui lòng thử lại.";
        } else if (error.message.includes("API key")) {
          errorMessage = "Lỗi cấu hình hệ thống. Vui lòng liên hệ quản trị viên.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
      setLoadingProgress(0);
      setLoadingMessage("");
    }
  };

  const handleStartMockInterview = () => {
    // Save to localStorage for use in mock interview if resume exists
    if (resumeSections.length > 0) {
      localStorage.setItem("resumeSectionsForInterview", JSON.stringify(resumeSections));
    }
    
    // Navigate to mock interview page
    navigate("/mock-interview");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {isAnalyzing ? (
        <main className="flex-1 flex items-center justify-center px-4 py-8 pt-24">
          <div className="py-20 text-center">
            <div className="max-w-md mx-auto">
              {/* Loading Icon */}
              <div className="mb-6">
                <Brain className="h-16 w-16 mx-auto text-primary animate-pulse" />
              </div>

              {/* Loading Message */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Đang đánh giá CV</h3>
                <p className="text-lg font-medium text-primary mb-2">
                  {loadingMessage || "Đang phân tích nội dung CV của bạn..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  AI đang phân tích và tạo nội dung cải thiện cho từng phần của CV
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
                <p>💡 Mẹo: Kết quả sẽ hiển thị nội dung gốc và phiên bản đã được cải thiện</p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 pt-24">
          <h1 className="text-3xl font-bold mb-8 text-center">Tải lên hồ sơ của bạn</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Resume Upload Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Hồ sơ của bạn</h2>
              {resumeSections.length > 0 && (
                <Button 
                  onClick={handleClearResume}
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa CV
                </Button>
              )}
            </div>
            
            {uploading ? (
              <div className="upload-container flex flex-col items-center justify-center py-12">
                <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
                <div className="mt-4 text-xl font-medium">Đang phân tích CV...</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Vui lòng chờ trong giây lát
                </p>
              </div>
            ) : (
              <FileUpload
                acceptedTypes=".pdf,.doc,.docx"
                onFileUpload={handleFileUpload}
                label="Tải lên CV của bạn"
              />
            )}
            
            {resumeSections.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✓ CV đã được tải lên thành công</p>
                <p className="text-green-600 text-sm mt-1">
                  Đã phân tích {resumeSections.length} phần từ CV của bạn
                </p>
              </div>
            )}
          </div>
          
          {/* Job Description Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Mô tả công việc (tùy chọn)</h2>
              {(jobDescriptionFile || jobDescriptionText) && (
                <Button 
                  onClick={handleClearJobDescription}
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa JD
                </Button>
              )}
            </div>
            
            <Tabs defaultValue="upload">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Tải lên JD</TabsTrigger>
                <TabsTrigger value="paste">Dán văn bản</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="mt-4">
                <FileUpload
                  acceptedTypes=".pdf,.doc,.docx"
                  onFileUpload={handleJobDescriptionFileUpload}
                  label="Tải lên mô tả công việc"
                />
              </TabsContent>
              
              <TabsContent value="paste" className="mt-4">
                <Textarea
                  placeholder="Dán mô tả công việc vào đây..."
                  className="min-h-[300px]"
                  value={jobDescriptionText}
                  onChange={(e) => {
                    setJobDescriptionText(e.target.value);
                    // Save to localStorage immediately
                    localStorage.setItem("jobDescription", e.target.value);
                  }}
                />
              </TabsContent>
            </Tabs>

            {jobDescriptionText && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">✓ Mô tả công việc đã được lưu</p>
                <p className="text-blue-600 text-sm mt-1">
                  Độ dài: {jobDescriptionText.length} ký tự
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button
            onClick={handleEvaluate}
            size="lg"
            className="gap-2"
            disabled={isAnalyzing || uploading}
          >
            <span>Đánh giá hồ sơ</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleStartMockInterview}
            variant="outline"
            size="lg"
            className="gap-2"
            disabled={isAnalyzing || uploading}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Bắt đầu phỏng vấn thử</span>
          </Button>
        </div>

          {resumeSections.length === 0 && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-center">
                💡 Mẹo: Bạn có thể bắt đầu phỏng vấn thử ngay cả khi chưa tải CV.
                Hệ thống sẽ cho phép bạn chọn ngành nghề để tạo câu hỏi phù hợp!
              </p>
            </div>
          )}
        </main>
      )}

      <TextConfirmationDialog
        isOpen={showTextDialog}
        onClose={handleDialogClose}
        onConfirm={handleTextConfirm}
        extractedText={extractedText}
        filename={currentFilename}
      />
    </div>
  );
};

export default Upload;
