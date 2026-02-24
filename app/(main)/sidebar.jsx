"use client";

import { School, User, Users, Book, FileText, BookOpen, FileSpreadsheet, FolderPlus } from "lucide-react"
import { usePathname } from "next/navigation";
import Link from "next/link"
import { useSidebar } from "@/contexts/sidebar-context"

// Settings menu items.
const settingsItems = [
    {
        title: "Profile",
        url: "/settings/profile",
        icon: User,
    },
    {
        title: "School",
        url: "/settings/school",
        icon: School,
    },
    {
        title: "Subjects",
        url: "/settings/subjects",
        icon: Book,
    },
    {
        title: 'Students',
        url: '/settings/students',
        icon: Users,
    },
]

// Views menu items.
const viewsItems = [
    {
        title: 'Result',
        url: '/view/results',
        icon: BookOpen,
    },
    {
        title: 'Subject',
        url: '/view/subjects',
        icon: Book,
    },
    {
        title: 'Spreadsheet',
        url: '/view/spreadsheet',
        icon: FileSpreadsheet,
    }
]

// Templates menu items.
const templateItems = [
    {
        title: 'Built-in',
        url: '/templates/builtin',
        icon: FileText,
    },
    {
        title: 'Custom',
        url: '/templates/custom',
        icon: FolderPlus,
    }
]

export default function AppSidebar() {
    const { isOpen, toggle } = useSidebar()
    const pathname = usePathname();
    const isActive = (url) => pathname === url;

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
                    fixed top-16 left-0 bottom-0 z-40 w-56
                    bg-background border-r border-border shadow-lg
                    transition-transform duration-200 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <nav className="h-full flex flex-col overflow-y-auto">
                    <ul className="flex-1 px-3 py-2">
                        {/* Settings group */}
                        <li className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Settings
                        </li>
                        {settingsItems.map((item) => (
                            <SidebarItem
                                key={item.title}
                                icon={<item.icon size={20} />}
                                text={item.title}
                                active={isActive(item.url)}
                                url={item.url}
                                onNavigate={toggle}
                            />
                        ))}

                        {/* Views group */}
                        <li className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Views
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

                        {/* Templates group */}
                        <li className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Templates
                        </li>
                        {templateItems.map((item) => (
                            <SidebarItem
                                key={item.title}
                                icon={<item.icon size={20} />}
                                text={item.title}
                                active={isActive(item.url)}
                                url={item.url}
                                onNavigate={toggle}
                            />
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    )
}

function SidebarItem({ icon, text, active, url, onNavigate }) {
    return (
        <li>
            <Link
                href={url}
                onClick={onNavigate}
                className={`
                    relative flex items-center py-2 px-3 my-1
                    font-medium rounded-md cursor-pointer
                    transition-colors group
                    ${active
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted text-muted-foreground"
                    }
                `}
            >
                {icon}
                <span className="ml-2 text-base">{text}</span>
            </Link>
        </li>
    )
}
