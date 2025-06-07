import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import HighlightedText from "@/components/HighlightedText";
import ImprovedTextSection from "@/components/ImprovedTextSection";
import { geminiApi } from "@/services/geminiApi";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ResumeSection {
  id: string;
  title: string;
  content: string;
}
interface Improvement {
  section: string;
  original: string;
  suggestion: string;
  reason: string;
}
const Evaluation = () => {
  const navigate = useNavigate();
  const [resumeSections, setResumeSections] = useState<ResumeSection[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [improvedContent, setImprovedContent] = useState<Record<string, string>>({});
  useEffect(() => {
    // Check if resume data exists in localStorage
    const resumeData = localStorage.getItem("resumeSections");
    if (!resumeData || JSON.parse(resumeData).length === 0) {
      toast.error("Không tìm thấy dữ liệu hồ sơ. Vui lòng quay lại trang tải lên.");
      navigate("/upload");
      return;
    }
    setResumeSections(JSON.parse(resumeData));

    // Get job description if available
    const jdData = localStorage.getItem("jobDescription");
    if (jdData) {
      setJobDescription(jdData);
    }

    // Convert resume sections to the format expected by the API
    const resumeContent: Record<string, string> = {};
    JSON.parse(resumeData).forEach((section: ResumeSection) => {
      resumeContent[section.title] = section.content;
    });

    // Analyze resume with API
    const analyzeResume = async () => {
      try {
        const resumeAnalysis = await geminiApi.analyzeResume(resumeContent);
        setImprovements(resumeAnalysis.improvements);
        setImprovedContent(resumeAnalysis.improvedContent);
        setIsLoading(false);
      } catch (error) {
        console.error("Error analyzing resume:", error);
        toast.error("Đã xảy ra lỗi khi phân tích hồ sơ. Vui lòng thử lại.");
        setIsLoading(false);
      }
    };
    analyzeResume();
  }, [navigate]);
  return <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8 gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/upload")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Kết quả đánh giá</h1>
          <div className="flex-grow"></div>
          
        </div>
        
        {isLoading ? <div className="py-20 text-center">
            <div className="mb-4 text-lg font-medium">Đang phân tích hồ sơ của bạn...</div>
            <Progress value={45} className="w-full max-w-md mx-auto" />
          </div> : <>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Original Resume Content */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Hồ sơ gốc</h2>
                
                <div className="space-y-6 p-6 border rounded-lg resume-container">
                  {resumeSections.map(section => <div key={section.id} className="mb-6">
                      <h3 className="text-lg font-medium mb-2">{section.title}</h3>
                      <div className="text-sm text-muted-foreground">
                        <HighlightedText originalText={section.content} improvements={improvements.filter(improvement => improvement.section === section.title).map(improvement => ({
                    original: improvement.original,
                    suggestion: improvement.suggestion,
                    reason: improvement.reason
                  }))} />
                      </div>
                    </div>)}
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>* Di chuột qua văn bản được đánh dấu để xem các đề xuất cải thiện</p>
                </div>
              </div>
              
              {/* Improved Resume Content */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Hồ sơ được cải thiện</h2>
                
                <div className="space-y-4 resume-container">
                  {Object.entries(improvedContent).map(([title, content]) => <ImprovedTextSection key={title} title={title} content={content} />)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button onClick={() => navigate("/")} className="gap-2">
                <Home className="h-4 w-4" />
                Quay lại trang chủ
              </Button>
            </div>
          </>}
      </main>
    </div>;
};
export default Evaluation;
