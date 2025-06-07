
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface ImprovedTextSectionProps {
  title: string;
  content: string;
}

const ImprovedTextSection = ({ title, content }: ImprovedTextSectionProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Đã sao chép vào clipboard!");
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4" />
          <span>Sao chép</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line bg-muted p-3 rounded-md text-sm">
          {content}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImprovedTextSection;
