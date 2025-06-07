import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, FileText } from "lucide-react";

interface TextConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
  extractedText: string;
  filename: string;
}

const TextConfirmationDialog: React.FC<TextConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  extractedText,
  filename
}) => {
  const [editedText, setEditedText] = useState(extractedText);

  // Sync state when extractedText prop changes
  useEffect(() => {
    setEditedText(extractedText);
  }, [extractedText]);

  const handleConfirm = () => {
    onConfirm(editedText);
    onClose();
  };

  const handleCancel = () => {
    setEditedText(extractedText); // Reset to original
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Xác nhận nội dung CV đã trích xuất
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>File:</strong> {filename}
              <br />
              Vui lòng kiểm tra và chỉnh sửa nội dung nếu cần thiết. Bạn có thể xóa thông tin nhạy cảm hoặc sửa bố cục trước khi gửi cho AI phân tích.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nội dung CV (có thể chỉnh sửa):
            </label>
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Nội dung CV sẽ hiển thị ở đây..."
            />
            <p className="text-xs text-muted-foreground">
              Độ dài: {editedText.length} ký tự
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!editedText.trim()}
          >
            Xác nhận và tiếp tục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TextConfirmationDialog;