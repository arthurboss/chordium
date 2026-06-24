import { useTheme } from "@/utils/theme-utils"
import { Toaster as Sonner, toast } from "sonner"
import { X } from "lucide-react"

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
      icons={{
        success: null,
        close: <X className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
