
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SectionInputProps {
  id: string;
  onChange: (id: string, title: string, content: string) => void;
  onRemove: (id: string) => void;
  initialTitle?: string;
  initialContent?: string;
}

const SectionInput = ({ 
  id, 
  onChange, 
  onRemove, 
  initialTitle = "", 
  initialContent = "" 
}: SectionInputProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onChange(id, e.target.value, content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onChange(id, title, e.target.value);
  };

  return (
    <div className="p-4 border rounded-md mb-4 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() => onRemove(id)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="mb-3">
        <label htmlFor={`title-${id}`} className="block text-sm font-medium mb-1">
          Tiêu đề phần
        </label>
        <Input
          id={`title-${id}`}
          placeholder="Ví dụ: Kinh nghiệm làm việc, Học vấn, Kỹ năng..."
          value={title}
          onChange={handleTitleChange}
        />
      </div>
      
      <div>
        <label htmlFor={`content-${id}`} className="block text-sm font-medium mb-1">
          Nội dung
        </label>
        <Textarea
          id={`content-${id}`}
          placeholder="Nhập nội dung chi tiết cho phần này..."
          className="min-h-[120px]"
          value={content}
          onChange={handleContentChange}
        />
      </div>
    </div>
  );
};

export default SectionInput;
