import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCcw, FileText, Fullscreen, AlignJustify } from "lucide-react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
export default function CodeToolsGroup() {
  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlignJustify />
          </TooltipTrigger>
          <TooltipContent>
            <p>代码格式化</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <RefreshCcw />
          </TooltipTrigger>
          <TooltipContent>
            <p>清空代码</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Fullscreen />
          </TooltipTrigger>
          <TooltipContent>
            <p>全屏</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
