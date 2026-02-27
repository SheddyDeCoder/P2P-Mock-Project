// components/LoadingSpinner.tsx
import { Loader2 } from "lucide-react"; // Install if missing: npm install lucide-react

export function LoadingSpinner({
  message = "Loading dashboard...",
  size = "default",
}: {
  message?: string;
  size?: "sm" | "default" | "lg";
}) {
  const sizeClasses = {
    sm: "h-6 w-6",
    default: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2
            className={`${sizeClasses[size]} text-yellow-500 animate-spin`}
          />
          {/* Optional pulsing ring effect */}
          <div className="absolute inset-0 rounded-full border-2 border-yellow-500/30 animate-ping" />
        </div>

        {message && (
          <p className="text-slate-300 text-lg font-medium tracking-wide animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}