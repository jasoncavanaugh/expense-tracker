import { cn } from "src/utils/cn";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        className,
        "animate-spin rounded-full border-t-transparent dark:border-t-transparent"
      )}
    />
  );
}
