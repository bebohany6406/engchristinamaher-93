
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Determine if this is a success, destructive, or regular toast
        const isSuccess = String(title).includes("✓") || String(title).includes("✅");
        const isError = props.variant === "destructive" || String(title).includes("❌");
        
        // Apply custom styling based on toast type
        const customClasses = isSuccess 
          ? "bg-green-900/95 border-green-500 text-white" 
          : isError
            ? "bg-red-900/95 border-red-500 text-white"
            : "bg-physics-dark border-physics-gold text-white";
            
        return (
          <Toast 
            key={id} 
            {...props}
            className={`${customClasses} shadow-lg border-2 backdrop-blur-sm`}
          >
            <div className="grid gap-1">
              {title && <ToastTitle className="text-lg font-bold">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-sm opacity-90">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
