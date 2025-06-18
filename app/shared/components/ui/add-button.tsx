import { Plus } from "lucide-react";
import { Button } from "./button-old";
import { cn } from "@/shared/utils/cn";

interface AddButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "glowing";
  className?: string;
}

export function AddButton({
  onClick,
  children,
  variant = "default",
  className,
}: AddButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "relative font-medium transition-all duration-300",
        "bg-gradient-to-r from-primary-600 to-primary-700",
        "hover:from-primary-700 hover:to-primary-800",
        "border border-primary-500/50",
        "transform hover:scale-105",
        variant === "glowing" && [
          "before:absolute before:inset-[-4px] before:-z-10",
          "before:rounded-md",
          "before:bg-[linear-gradient(45deg,theme(colors.primary.500),theme(colors.primary.600))]",
          "before:blur-[16px]",
          "before:opacity-30",
        ],
        className
      )}
    >
      <Plus className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );
}
