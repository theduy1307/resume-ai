
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HighlightedTextProps {
  originalText: string;
  improvements: Array<{
    original: string;
    suggestion: string;
    reason: string;
  }>;
}

const HighlightedText = ({ originalText, improvements }: HighlightedTextProps) => {
  const [hoveredText, setHoveredText] = useState<string | null>(null);

  // Replace highlighted sections in the original text
  const renderText = () => {
    let renderedText = originalText;
    
    // Sort improvements by position in text to avoid replacing issues
    const sortedImprovements = [...improvements].sort((a, b) => {
      return originalText.indexOf(a.original) - originalText.indexOf(b.original);
    });
    
    // Create an array to build the JSX elements
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    
    sortedImprovements.forEach((improvement, index) => {
      const currentIndex = originalText.indexOf(improvement.original, lastIndex);
      
      if (currentIndex !== -1) {
        // Add text before the highlight
        if (currentIndex > lastIndex) {
          parts.push(
            <span key={`text-${index}-before`}>
              {originalText.substring(lastIndex, currentIndex)}
            </span>
          );
        }
        
        // Add the highlighted text
        parts.push(
          <TooltipProvider key={`highlight-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span 
                  className="text-highlight"
                  onMouseEnter={() => setHoveredText(improvement.original)}
                  onMouseLeave={() => setHoveredText(null)}
                >
                  {improvement.original}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div>
                  <div className="font-medium mb-1">Đề xuất:</div>
                  <div className="text-sm italic mb-2">{improvement.suggestion}</div>
                  <div className="font-medium mb-1">Lý do:</div>
                  <div className="text-sm">{improvement.reason}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
        
        lastIndex = currentIndex + improvement.original.length;
      }
    });
    
    // Add any remaining text
    if (lastIndex < originalText.length) {
      parts.push(
        <span key="text-end">{originalText.substring(lastIndex)}</span>
      );
    }
    
    return parts;
  };

  return <div className="whitespace-pre-line">{renderText()}</div>;
};

export default HighlightedText;
