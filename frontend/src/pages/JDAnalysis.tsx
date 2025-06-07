
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const JDAnalysis = () => {
  const navigate = useNavigate();
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState("");

  const handleJobDescriptionFileUpload = (file: File) => {
    setJobDescriptionFile(file);
    
    // Simulate reading the file content
    setJobDescriptionText("Position: Senior Frontend Developer\n\nResponsibilities:\n• Develop and maintain web applications using React, TypeScript, and GraphQL\n• Collaborate with designers and backend developers\n• Create reusable UI components\n\nRequirements:\n• 3+ years of experience with React\n• Strong knowledge of JavaScript and TypeScript\n• Experience with GraphQL and RESTful APIs\n• Experience with version control systems like Git\n• Knowledge of Docker is a plus");
    
    toast.success("Mô tả công việc đã được tải lên thành công");
  };

  const handleAnalyze = () => {
    if (!jobDescriptionText.trim()) {
      toast.error("Vui lòng nhập hoặc tải lên mô tả công việc");
      return;
    }
    
    // Save to localStorage for use in evaluation page
    localStorage.setItem("jobDescription", jobDescriptionText);
    
    // Navigate to upload page to add resume for comparison
    navigate("/upload");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Phân tích mô tả công việc</h1>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tải lên mô tả công việc</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              acceptedTypes=".pdf,.doc,.docx"
              onFileUpload={handleJobDescriptionFileUpload}
              label="Tải lên mô tả công việc"
            />
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Hoặc nhập mô tả công việc</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Dán mô tả công việc vào đây..."
              className="min-h-[300px]"
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleAnalyze} 
            size="lg"
            className="gap-2"
          >
            <span>Tiếp tục</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Tiếp theo, bạn sẽ cần tải lên CV hoặc hồ sơ của mình để so sánh với mô tả công việc này.
          </p>
        </div>
      </main>
    </div>
  );
};

export default JDAnalysis;
