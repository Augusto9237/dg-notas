import { SidebarTrigger } from "./ui/sidebar";

export function HeaderProfessor({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex justify-between items-center h-14 p-5 fixed top-0 right-0 left-0 bg-background'>
            <SidebarTrigger className='absolute' />
            {children}
        </div>
    )
}