"use client";

import { School, User, Users, Book, LayoutDashboard, FileText, BookOpen, FileSpreadsheet, FolderPlus, MoreVertical, ChevronLast, ChevronFirst } from "lucide-react"
import { usePathname } from "next/navigation";
import { useContext, createContext, useState } from "react"
import Link from "next/link"

const SidebarContext = createContext()

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
    const [expanded, setExpanded] = useState(true)
    const pathname = usePathname();
    const isActive = (url) => pathname === url;

    return (
        <SidebarContext.Provider value={{ expanded }}>
            <aside className="h-screen">
                <nav className="h-full flex flex-col bg-white border-r shadow-sm">
                    <div className="p-4 pb-2 flex justify-between items-center">
                        <div
                            className={`overflow-hidden transition-all ${
                                expanded ? "w-16" : "w-0"
                            }`}
                        >
                            <span className="font-bold text-xl text-indigo-600">RMS</span>
                        </div>
                        <button
                            onClick={() => setExpanded((curr) => !curr)}
                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
                        >
                            {expanded ? <ChevronFirst /> : <ChevronLast />}
                        </button>
                    </div>

                    <ul className="flex-1 px-3">
                        {/* Settings group */}
                        {expanded && (
                            <li className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Settings
                            </li>
                        )}
                        {settingsItems.map((item) => (
                            <SidebarItem
                                key={item.title}
                                icon={<item.icon size={20} />}
                                text={item.title}
                                active={isActive(item.url)}
                                url={item.url}
                            />
                        ))}

                        {/* Views group */}
                        {expanded && (
                            <li className="px-3 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Views
                            </li>
                        )}
                        {viewsItems.map((item) => (
                            <SidebarItem
                                key={item.title}
                                icon={<item.icon size={20} />}
                                text={item.title}
                                active={isActive(item.url)}
                                url={item.url}
                            />
                        ))}

                        {/* Templates group */}
                        {expanded && (
                            <li className="px-3 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Templates
                            </li>
                        )}
                        {templateItems.map((item) => (
                            <SidebarItem
                                key={item.title}
                                icon={<item.icon size={20} />}
                                text={item.title}
                                active={isActive(item.url)}
                                url={item.url}
                            />
                        ))}
                    </ul>

                    <div className="border-t flex p-3">
                        <img
                            src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
                            alt=""
                            className="w-10 h-10 rounded-md"
                        />
                        <div
                            className={`
                                flex justify-between items-center
                                overflow-hidden transition-all ${expanded ? "w-24 ml-3" : "w-0"}
                            `}
                        >
                            <div className="leading-4">
                                <h4 className="font-semibold">User</h4>
                                <span className="text-xs text-gray-600">user@example.com</span>
                            </div>
                            <MoreVertical size={20} />
                        </div>
                    </div>
                </nav>
            </aside>
        </SidebarContext.Provider>
    )
}

function SidebarItem({ icon, text, active, url }) {
    const { expanded } = useContext(SidebarContext)

    return (
        <li>
            <Link
                href={url}
                className={`
                    relative flex items-center py-2 px-3 my-1
                    font-medium rounded-md cursor-pointer
                    transition-colors group
                    ${
                        active
                            ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
                            : "hover:bg-indigo-50 text-gray-600"
                    }
                `}
            >
                {icon}
                <span
                    className={`overflow-hidden transition-all ${
                        expanded ? "w-24 ml-3" : "w-0"
                    }`}
                >
                    {text}
                </span>

                {!expanded && (
                    <div
                        className={`
                            absolute left-full rounded-md px-2 py-1 ml-6
                            bg-indigo-100 text-indigo-800 text-sm
                            invisible opacity-20 -translate-x-3 transition-all
                            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                        `}
                    >
                        {text}
                    </div>
                )}
            </Link>
        </li>
    )
}









