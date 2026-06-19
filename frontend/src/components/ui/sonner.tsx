import { useTheme } from "@/utils/theme-utils"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { isDark } = useTheme()

  return (
    <Sonner
      theme={isDark ? "dark" : "light"}
      className="toaster group"
      position="bottom-center"
      duration={3000}
      closeButton
      swipeDirections={["left", "right"]}
      style={
        {
          "--normal-bg": "hsl(var(--background))",
          "--normal-bg-hover": "hsl(var(--muted))",
          "--normal-border": "hsl(var(--border))",
          "--normal-text": "hsl(var(--foreground))",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster, toast }
