import { SidebarTrigger } from "./ui/sidebar";

export function HeaderProfessor({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex justify-between items-center h-16 p-5 inset-0 absolute w-full bg-background'>
            <SidebarTrigger className='absolute' />
            {children}
        </div>
    )
}