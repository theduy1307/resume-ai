
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Briefcase } from "lucide-react";

interface JobSelectionScreenProps {
  onJobSelect: (jobType: string) => void;
}

const JobSelectionScreen = ({ onJobSelect }: JobSelectionScreenProps) => {
  const [customJob, setCustomJob] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  const predefinedJobs = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Scientist",
    "Product Manager",
    "UX/UI Designer",
    "DevOps Engineer",
    "Marketing Manager",
    "Sales Representative",
    "Business Analyst"
  ];

  const handleJobSelect = (job: string) => {
    setSelectedJob(job);
    onJobSelect(job);
  };

  const handleCustomJobSubmit = () => {
    if (customJob.trim()) {
      handleJobSelect(customJob.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Chọn ngành nghề để phỏng vấn</h2>
        <p className="text-lg text-muted-foreground">
          Vì bạn chưa tải lên CV, hãy chọn ngành nghề để chúng tôi chuẩn bị câu hỏi phù hợp
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Ngành nghề phổ biến
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {predefinedJobs.map((job) => (
              <Button
                key={job}
                variant="outline"
                className="h-auto p-4 text-left justify-start"
                onClick={() => handleJobSelect(job)}
              >
                {job}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ngành nghề khác</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom-job">Nhập tên ngành nghề của bạn</Label>
            <Input
              id="custom-job"
              placeholder="Ví dụ: Kỹ sư cơ khí, Nhà thiết kế đồ họa..."
              value={customJob}
              onChange={(e) => setCustomJob(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomJobSubmit()}
            />
          </div>
          <Button 
            onClick={handleCustomJobSubmit}
            disabled={!customJob.trim()}
            className="gap-2"
          >
            <span>Tiếp tục</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobSelectionScreen;
