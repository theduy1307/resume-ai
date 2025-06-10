import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Briefcase, GraduationCap, Building2 } from "lucide-react";

interface InterviewSetupFormProps {
  onSubmit: (data: { position: string; field: string; level: string }) => void;
}

const InterviewSetupForm = ({ onSubmit }: InterviewSetupFormProps) => {
  const [position, setPosition] = useState("");
  const [field, setField] = useState("");
  const [level, setLevel] = useState("");

  const predefinedPositions = [
    "Frontend Developer",
    "Backend Developer", 
    "Full Stack Developer",
    "Data Scientist",
    "Product Manager",
    "UX/UI Designer",
    "DevOps Engineer",
    "Mobile Developer",
    "QA Engineer",
    "Business Analyst",
    "Marketing Manager",
    "Sales Representative",
    "Project Manager",
    "Data Analyst",
    "Software Architect"
  ];

  const predefinedFields = [
    "Công nghệ thông tin",
    "Phát triển phần mềm",
    "Khoa học dữ liệu",
    "Thiết kế UX/UI",
    "Marketing",
    "Bán hàng",
    "Quản lý dự án",
    "Tài chính",
    "Nhân sự",
    "Vận hành",
    "Giáo dục",
    "Y tế",
    "Kỹ thuật",
    "Tư vấn"
  ];

  const experienceLevels = [
    { value: "intern", label: "Thực tập sinh" },
    { value: "entry", label: "Mới tốt nghiệp / Entry level" },
    { value: "junior", label: "Junior (1-2 năm kinh nghiệm)" },
    { value: "mid", label: "Mid-level (3-5 năm kinh nghiệm)" },
    { value: "senior", label: "Senior (5+ năm kinh nghiệm)" },
    { value: "lead", label: "Lead / Manager (7+ năm kinh nghiệm)" }
  ];

  const handleSubmit = () => {
    if (position.trim() && field.trim() && level.trim()) {
      onSubmit({
        position: position.trim(),
        field: field.trim(),
        level: level.trim()
      });
    }
  };

  const isFormValid = position.trim() && field.trim() && level.trim();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Thiết lập thông tin phỏng vấn</h2>
        <p className="text-lg text-muted-foreground">
          Vì bạn chưa tải lên CV, hãy cung cấp thông tin để chúng tôi chuẩn bị câu hỏi phù hợp
        </p>
      </div>

      <div className="space-y-6">
        {/* Position Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Vị trí ứng tuyển
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="position">Chọn vị trí từ danh sách có sẵn</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vị trí ứng tuyển..." />
                </SelectTrigger>
                <SelectContent>
                  {predefinedPositions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground text-center">hoặc</div>
            
            <div>
              <Label htmlFor="custom-position">Nhập vị trí khác</Label>
              <Input
                id="custom-position"
                placeholder="Ví dụ: Software Engineer, Product Owner..."
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Field Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lĩnh vực công việc
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="field">Chọn lĩnh vực từ danh sách có sẵn</Label>
              <Select value={field} onValueChange={setField}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lĩnh vực..." />
                </SelectTrigger>
                <SelectContent>
                  {predefinedFields.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground text-center">hoặc</div>
            
            <div>
              <Label htmlFor="custom-field">Nhập lĩnh vực khác</Label>
              <Input
                id="custom-field"
                placeholder="Ví dụ: Fintech, E-commerce, Gaming..."
                value={field}
                onChange={(e) => setField(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Experience Level Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Cấp độ kinh nghiệm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="level">Chọn cấp độ kinh nghiệm của bạn</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp độ kinh nghiệm..." />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((lvl) => (
                    <SelectItem key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="text-center">
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid}
            size="lg"
            className="gap-2"
          >
            <span>Tiếp tục</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetupForm;