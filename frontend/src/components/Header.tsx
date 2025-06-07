
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, MessageSquare, Menu, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const checkResumeDataAndNavigate = (path: string) => {
    const resumeData = localStorage.getItem("resumeSections");
    
    if (!resumeData || JSON.parse(resumeData).length === 0) {
      toast.error("Vui lòng tải lên hồ sơ trước khi truy cập tính năng này");
      navigate("/upload");
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };
  
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between border-b">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => navigate("/")}
      >
        <div className="flex gap-1 items-center">
          <span className="font-bold text-2xl text-resume-primary">Resume</span>
          <span className="font-bold text-2xl">AI</span>
        </div>
      </div>
      
      <nav className="hidden md:flex items-center gap-6">
        <Button 
          onClick={() => navigate("/upload")}
          variant={location.pathname === "/upload" ? "default" : "ghost"} 
          className="gap-2"
        >
          <FileText size={18} />
          <span>Hồ sơ</span>
        </Button>
        <Button 
          onClick={() => checkResumeDataAndNavigate("/evaluation")}
          variant={location.pathname === "/evaluation" ? "default" : "ghost"} 
          className="gap-2"
        >
          <CheckCircle size={18} />
          <span>Đánh giá</span>
        </Button>
        <Button 
          onClick={() => navigate("/mock-interview")}
          variant={location.pathname === "/mock-interview" ? "default" : "ghost"} 
          className="gap-2"
        >
          <MessageSquare size={18} />
          <span>Phỏng vấn</span>
        </Button>
      </nav>
      
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-6">
              <Button 
                onClick={() => handleNavigation("/upload")}
                variant={location.pathname === "/upload" ? "default" : "ghost"} 
                className="w-full justify-start gap-2"
              >
                <FileText size={18} />
                <span>Hồ sơ</span>
              </Button>
              <Button 
                onClick={() => checkResumeDataAndNavigate("/evaluation")}
                variant={location.pathname === "/evaluation" ? "default" : "ghost"} 
                className="w-full justify-start gap-2"
              >
                <CheckCircle size={18} />
                <span>Đánh giá</span>
              </Button>
              <Button 
                onClick={() => handleNavigation("/mock-interview")}
                variant={location.pathname === "/mock-interview" ? "default" : "ghost"} 
                className="w-full justify-start gap-2"
              >
                <MessageSquare size={18} />
                <span>Phỏng vấn</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default Header;
