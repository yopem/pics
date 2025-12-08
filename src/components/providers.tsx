import ThemeProvider from "@/components/theme/theme-provider"
import { TRPCReactProvider } from "@/lib/trpc/client"
import { ToastProvider } from "@/lib/utils/toast"

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <TRPCReactProvider>
        <ToastProvider>{children}</ToastProvider>
      </TRPCReactProvider>
    </ThemeProvider>
  )
}

export default Providers
