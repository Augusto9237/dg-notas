import { SidebarTrigger } from "./ui/sidebar";

export function HeaderProfessor({ children }: { children: React.ReactNode }) {
    return (
        <div className='h-16 px-5 py-2.5 inset-0 absolute w-full bg-background'>
            <div className="flex gap-4 w-full items-center">
                <SidebarTrigger />
                {children}
            </div>
        </div>
    )
}