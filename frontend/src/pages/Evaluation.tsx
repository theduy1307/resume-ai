import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import ImprovedTextSection from "@/components/ImprovedTextSection";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AnalysisSection {
  title: string;
  content: string;
  improvedContent: string;
  reason: string;
}
const Evaluation = () => {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<AnalysisSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Check if analyzed data exists in localStorage
    const analyzedData = localStorage.getItem("resumeSectionsForEval");
    if (!analyzedData) {
      toast.error("Không tìm thấy dữ liệu phân tích. Vui lòng quay lại trang tải lên và thực hiện đánh giá.");
      navigate("/upload");
      return;
    }

    try {
      const sections = JSON.parse(analyzedData);
      // Convert to the format expected by the component
      const analysisData = sections.map((section: any) => ({
        title: section.title,
        content: section.content,
        improvedContent: section.improvements, // This comes from the analyzed data
        reason: section.reason
      }));

      setAnalysisData(analysisData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error parsing analyzed data:", error);
      toast.error("Lỗi khi đọc dữ liệu phân tích. Vui lòng thử lại.");
      navigate("/upload");
    }
  }, [navigate]);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center mb-8 gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/upload")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Kết quả đánh giá CV</h1>
          <div className="flex-grow"></div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="mb-4 text-lg font-medium">Đang phân tích hồ sơ của bạn...</div>
            <Progress value={45} className="w-full max-w-md mx-auto" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Original Resume Content */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Nội dung gốc</h2>

                <div className="space-y-6">
                  {analysisData.map((section, index) => (
                    <Card key={index} className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="whitespace-pre-line bg-muted p-3 rounded-md text-sm">
                          {section.content}
                        </div>
                        <div className="border-t pt-3">
                          <h4 className="font-medium text-sm mb-2 text-orange-700">Lý do cần cải thiện:</h4>
                          <p className="text-sm text-muted-foreground">{section.reason}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Improved Resume Content */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Nội dung đã cải thiện</h2>

                <div className="space-y-6">
                  {analysisData.map((section, index) => (
                    <ImprovedTextSection
                      key={index}
                      title={section.title}
                      content={section.improvedContent}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <Button onClick={() => navigate("/")} className="gap-2">
                <Home className="h-4 w-4" />
                Quay lại trang chủ
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
export default Evaluation;
