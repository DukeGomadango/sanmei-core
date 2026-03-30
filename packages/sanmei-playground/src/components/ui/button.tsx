import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "default" | "secondary" | "destructive" | "ghost";

const variantClass: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
};

export function Button({
  children,
  className,
  variant = "default",
  type = "button",
  disabled,
  onClick,
}: PropsWithChildren<{
  className?: string;
  variant?: ButtonVariant;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}>) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantClass[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

