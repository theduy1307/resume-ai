
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, CheckCircle, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import FeatureCard from "@/components/FeatureCard";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <section className="py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Cải thiện hồ sơ xin việc với
            <span className="text-resume-primary"> AI</span>
          </h1>
          <p className="text-muted-foreground max-w-[650px] mb-8 text-center text-2xl">Tối ưu hóa hồ sơ của bạn để phù hợp với mô tả công việc mong muốn và sẵn sàng cho phỏng vấn.</p>
          <Button onClick={() => navigate('/upload')} size="lg" className="gap-2">
            <span>Bắt đầu ngay</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </section>
        
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Tính năng chính</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="animate-fade-in" style={{
            animationDelay: '0ms'
          }}>
              <FeatureCard title="Phân tích CV" description="Tải lên CV của bạn để nhận phản hồi chi tiết và đề xuất cải thiện nội dung cho từng phần." icon={<FileText className="h-5 w-5" />} />
            </div>
            
            <div className="animate-fade-in" style={{
            animationDelay: '150ms'
          }}>
              <FeatureCard title="Đánh giá hồ sơ" description="Nhận đánh giá chi tiết về hồ sơ của bạn và gợi ý cải thiện để tăng cơ hội thành công khi ứng tuyển." icon={<CheckCircle className="h-5 w-5" />} />
            </div>
            
            <div className="animate-fade-in" style={{
            animationDelay: '300ms'
          }}>
              <FeatureCard title="Phỏng vấn thử" description="Rèn luyện kỹ năng phỏng vấn với các câu hỏi được cá nhân hóa và nhận phản hồi chi tiết về câu trả lời của bạn." icon={<MessageSquare className="h-5 w-5" />} />
            </div>
          </div>
        </section>
        
        <section className="py-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Tăng cơ hội thành công khi xin việc</h2>
          <p className="text-lg text-muted-foreground max-w-[800px] mx-auto mb-8">
            Ứng dụng của chúng tôi sử dụng công nghệ AI tiên tiến để phân tích và cải thiện hồ sơ xin việc của bạn, giúp bạn nổi bật trong mắt nhà tuyển dụng.
          </p>
          <Button onClick={() => navigate('/upload')} variant="default" size="lg">
            Cải thiện hồ sơ của bạn
          </Button>
        </section>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Resume AI.</p>
        </div>
      </footer>
    </div>;
};

export default Index;
