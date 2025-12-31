"use client";

import { School, User, Users, Book, LayoutDashboard, FileText, BookOpen, FileSpreadsheet, FolderPlus, Calendar } from "lucide-react"
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarInset,
    SidebarHeader,
    SidebarTrigger,
} from "@/shadcn/ui/sidebar"
import Link from "next/link"

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
        title: "Term",
        url: "/settings/term",
        icon: Calendar,
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

    // get the current pathname
    const pathname = usePathname();
    const isActive = (url) => pathname === url;



    return (
        <Sidebar side="left" variant="floating" collapsible="icon">
            <SidebarInset>
                <SidebarHeader>
                    <SidebarTrigger />
                </SidebarHeader>
                <SidebarContent>

                    {/* Settings group */}
                    <SidebarGroup>
                        <SidebarGroupLabel>Settings</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {settingsItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild className={isActive(item.url) ? 'bg-[#1e293b] text-primary-foreground rounded-md shadow-sm' : ''}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Views group */}
                    <SidebarGroup>
                        <SidebarGroupLabel>Views</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {viewsItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild className={isActive(item.url) ? 'bg-[#1e293b] text-primary-foreground rounded-md shadow-sm' : ''}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Templates group */}
                    <SidebarGroup>
                        <SidebarGroupLabel>Templates</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {templateItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild className={isActive(item.url) ? 'bg-[#1e293b] text-primary-foreground rounded-md shadow-sm' : ''}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </SidebarInset>
        </Sidebar>
    )
}