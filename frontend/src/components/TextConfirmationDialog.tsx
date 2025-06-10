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
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Xác nhận nội dung CV đã trích xuất</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 px-6 overflow-hidden flex flex-col min-h-0">
          <Alert className="mb-4 flex-shrink-0">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <AlertDescription className="text-sm">
              <strong>File:</strong> <span className="break-all">{filename}</span>
              <br />
              <span className="text-xs">
                Vui lòng kiểm tra và chỉnh sửa nội dung nếu cần thiết. Bạn có thể xóa thông tin nhạy cảm hoặc sửa bố cục trước khi gửi cho AI phân tích.
              </span>
            </AlertDescription>
          </Alert>

          <div className="flex-1 flex flex-col min-h-0">
            <label className="text-sm font-medium mb-2 flex-shrink-0">
              Nội dung CV (có thể chỉnh sửa):
            </label>
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="flex-1 font-mono text-xs sm:text-sm resize-none min-h-[200px]"
              placeholder="Nội dung CV sẽ hiển thị ở đây..."
            />
            <p className="text-xs text-muted-foreground mt-2 flex-shrink-0">
              Độ dài: {editedText.length} ký tự
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 flex-shrink-0 gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!editedText.trim()}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Xác nhận và tiếp tục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TextConfirmationDialog;