"use client";

import { School, User, Users, Book, BookOpen, FileSpreadsheet, LayoutDashboard,  GitMerge, Settings } from "lucide-react"
import { usePathname } from "next/navigation";
import Link from "next/link"
import { useSidebar } from "@/contexts/sidebar-context"


// Organisation
const organisationItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "School",
        url: "/school",
        icon: School,
    },
    {
        title: "Teachers",
        url: "/teachers",
        icon: Users,
    },
]

// Term-scoped
const termItems = [
    {
        title: "Term Setup",
        url: "/term",
        icon: BookOpen,
    },
    {
        title: "Subjects",
        url: "/subjects",
        icon: Book,
    },
    {
        title: "Classes",
        url: "/classes",
        icon: School,
    },
    {
        title: 'Students',
        url: '/students',
        icon: User,
    },
    {
        title: "Pull Request",
        url: "/merge-requests",
        icon: GitMerge,
    },
]

// Result sheets
const viewsItems = [
    {
        title: 'Result',
        url: '/results',
        icon: BookOpen,
    },
    {
        title: 'Subject',
        url: '/subject-view',
        icon: Book,
    },
    {
        title: 'Spreadsheet',
        url: '/spreadsheet',
        icon: FileSpreadsheet,
    }
]

export default function AppSidebar() {

    // Sidebar context: url path and toggle function
    const { isOpen, toggle } = useSidebar()
    const pathname = usePathname();
    const isActive = (url: string) => pathname === url;

    // Render the sidebar
    return (
        <>
            {/* Backdrop overlay — click to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 top-16 bg-black/30 z-40"
                    onClick={toggle}
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={`
                    fixed top-16 left-0 bottom-0 z-40 w-64 bg-background border-r border-border shadow-lg transition-transform duration-200 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <nav className="h-full flex flex-col overflow-y-auto">
                    <ul className="flex-1 px-3 py-2 relative">

                         {/* Organisation group */}
                         <li className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Organisation
                        </li>
                        {organisationItems.map((item) => (
                            <SidebarItem
                                key={item.title}
                                icon={<item.icon size={20} />}
                                text={item.title}
                                active={isActive(item.url)}
                                url={item.url}
                                onNavigate={toggle}
                            />
                        ))}

                        {/* Term group */}
                        <li className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Term entities
                        </li>
                        {termItems.map((item) => (
                            <SidebarItem
                                key={item.title}
                                icon={<item.icon size={20} />}
                                text={item.title}
                                active={isActive(item.url)}
                                url={item.url}
                                onNavigate={toggle}
                            />
                        ))}

                        {/* Result sheets group */}
                        <li className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Result sheets
                        </li>
                        {viewsItems.map((item) => (
                            <SidebarItem
                                key={item.title}
                                icon={<item.icon size={20} />}
                                text={item.title}
                                active={isActive(item.url)}
                                url={item.url}
                                onNavigate={toggle}
                            />
                        ))}

                        <li className="absolute bottom-0 left-0 w-full">
                            <SidebarItem
                                key="settings"
                                icon={<Settings size={20} />}
                                text="Settings"
                                active={isActive("/profile")}
                                url="/profile"
                                onNavigate={toggle}
                            />
                        </li>


                    </ul>
                </nav>
            </aside>
        </>
    )
}

type SidebarItemProps = {
    icon: React.ReactNode
    text: string
    active: boolean
    url: string
    onNavigate: () => void
}

function SidebarItem({ icon, text, active, url, onNavigate }: SidebarItemProps) {
    return (
        <li>
            <Link
                href={url}
                onClick={onNavigate}
                className={`
                    relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group
                    ${active
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted text-muted-foreground"
                    }
                `}
            >
                {icon}
                <span className="ml-3 text-base">{text}</span>
            </Link>
        </li>
    )
}