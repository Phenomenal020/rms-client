"use client";

import { School, User, Users, Book, BookOpen, FileSpreadsheet, LayoutDashboard, GitMerge, Settings, MessageCircle } from "lucide-react"
import { usePathname } from "next/navigation";
import Link from "next/link"
import { useSidebar } from "@/contexts/sidebar-context"
import { useUser } from "@/contexts/user-context";

// Admin sidebar items
const adminSidebarItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
]

// Organisation
const orgAdminOrganisationItems = [
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
    {
        title: "Subjects",
        url: "/subjects",
        icon: Book,
    },
    {
        title: 'Students',
        url: '/students',
        icon: User,
    },
]

// Term-scoped
const orgAdminTermItems = [
    {
        title: "Term Setup",
        url: "/term",
        icon: BookOpen,
    },
    {
        title: "Classes",
        url: "/classes",
        icon: School,
    },
    {
        title: "Enrollment",
        url: "/enrollment",
        icon: Users,
    },
    {
        title: "Promotions",
        url: "/promotions",
        icon: GitMerge,
    }
]

// Result sheets
const viewsItems = [
    {
        title: 'Result',
        url: '/students-view',
        icon: BookOpen,
    },
    {
        title: 'Subject',
        url: '/subject-view',
        icon: Book,
    },
    // {
    //     title: 'Spreadsheet',
    //     url: '/spreadsheet',
    //     icon: FileSpreadsheet,
    // }
]

// Internal communication
const communicationItems = [
    {
        title: "Chats",
        url: "/chats",
        icon: MessageCircle,
    },
]

// User sidebar items
const userSidebarItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
]

export default function AppSidebar() {

    // Sidebar context: url path and toggle function
    const { isOpen, toggle } = useSidebar()
    const pathname = usePathname();
    const isActive = (url: string) => pathname === url;

    // Get user from User context
    const { user } = useUser();

    // Check if the user is an admin
    const isAdmin = user?.role === "admin";

    // Check if the user is an organisation admin
    const isOrgAdmin = user?.role === "orgadmin";

    // Check if the user is a regular user
    const isUser = user?.role === "user";

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

                        <li className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Profile
                        </li>
                        {/* <li className="absolute bottom-0 left-0 w-full"> */}
                            <SidebarItem
                                key="profile"
                                icon={<Settings size={20} />}
                                text="Profile"
                                active={isActive("/profile")}
                                url="/profile"
                                onNavigate={toggle}
                            />
                        {/* </li> */}

                        {/* Admin sidebar items */}
                        {isAdmin && (
                            <>
                                <li className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Admin
                                </li>
                                {adminSidebarItems.map((item) => (
                                    <SidebarItem
                                        key={item.title}
                                        icon={<item.icon size={20} />}
                                        text={item.title}
                                        active={isActive(item.url)}
                                        url={item.url}
                                        onNavigate={toggle}
                                    />
                                ))}
                            </>
                        )}

                        {/* User sidebar items */}
                        {isUser && <>
                            <li className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                User
                            </li>
                            {userSidebarItems.map((item) => (
                                <SidebarItem key={item.title} icon={<item.icon size={20} />} text={item.title} active={isActive(item.url)} url={item.url} onNavigate={toggle} />
                            ))}
                        </>}

                        {/* Organisation admin sidebar items */}
                        {isOrgAdmin && <>
                            {/* Organisation group */}
                            <li className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Organisation
                            </li>
                            {orgAdminOrganisationItems.map((item) => (
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
                            {orgAdminTermItems.map((item) => (
                                <SidebarItem
                                    key={item.title}
                                    icon={<item.icon size={20} />}
                                    text={item.title}
                                    active={isActive(item.url)}
                                    url={item.url}
                                    onNavigate={toggle}
                                />
                            ))}
                        </>}


                        {/* Communication — teachers and org admins */}
                        {(isOrgAdmin || isUser) && <>
                            <li className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Communication
                            </li>
                            {communicationItems.map((item) => (
                                <SidebarItem
                                    key={item.title}
                                    icon={<item.icon size={20} />}
                                    text={item.title}
                                    active={isActive(item.url)}
                                    url={item.url}
                                    onNavigate={toggle}
                                />
                            ))}
                        </>}

                        {/* Result sheets group */}
                        {(isOrgAdmin || isUser) && <>
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
                        </>}


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