import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm, TabsDemo } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4  bg-primary">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md flex flex-col items-center gap-10">
            <Image
              src="/Logo4.svg"
              alt="Logo"
              width={488}
              height={400}
              className="h-[110px] max-sm:h-[88px] w-[360px] max-sm:w-[280px] object-cover"
            />
            {/* <LoginForm /> */}
            <TabsDemo/>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/foto-1.jpeg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
