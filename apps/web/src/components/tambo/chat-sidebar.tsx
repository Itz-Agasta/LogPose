"use client";

import * as React from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    useTamboThread,
    useTamboThreadList,
    type TamboThread,
} from "@tambo-ai/react";
import {
    IconHome,
    IconMessage,
    IconPlus,
    IconSearch,
    IconTrash,
    IconDots,
    IconBrandTelegram,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function ChatSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: threads, isLoading, refetch } = useTamboThreadList();
    const {
        thread: currentThread,
        switchCurrentThread,
        startNewThread,
    } = useTamboThread();
    const router = useRouter();
    const { setOpenMobile, isMobile } = useSidebar();
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredThreads = React.useMemo(() => {
        if (!threads?.items) return [];
        if (!searchQuery) return threads.items;
        const query = searchQuery.toLowerCase();
        return threads.items.filter((thread) =>
            (thread.name || thread.id).toLowerCase().includes(query)
        );
    }, [threads, searchQuery]);

    const handleThreadClick = async (threadId: string) => {
        switchCurrentThread(threadId);
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const handleNewThread = async () => {
        await startNewThread();
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            render={<Link href="/home" />}
                            className="hover:bg-transparent hover:text-sidebar-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <IconHome className="size-5" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold text-base">LogPose</span>
                                <span className="text-sm text-muted-foreground">Home</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleNewThread}
                            className="bg-transparent h-10 mt-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <IconPlus className="mr-2 size-5" />
                            <span className="font-medium text-sm">New Thread</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="px-2 py-2 mt-2 group-data-[collapsible=icon]:hidden">
                    <div className="relative">
                        <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search threads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-9 text-sm rounded-lg"
                        />
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sm font-medium">History</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <SidebarMenuItem key={i}>
                                        <SidebarMenuSkeleton showIcon />
                                    </SidebarMenuItem>
                                ))
                            ) : filteredThreads.length === 0 ? (
                                <div className="px-4 py-2 text-sm text-muted-foreground">
                                    No threads found.
                                </div>
                            ) : (
                                filteredThreads.map((thread) => (
                                    <SidebarMenuItem key={thread.id}>
                                        <SidebarMenuButton
                                            onClick={() => handleThreadClick(thread.id)}
                                            isActive={currentThread?.id === thread.id}
                                            className="group/item h-9 rounded-lg"
                                        >
                                            <IconMessage className="mr-2 size-4" />
                                            <span className="truncate text-sm font-medium">
                                                {thread.name || `Thread ${thread.id.slice(0, 8)}`}
                                            </span>
                                            {/* Delete functionality removed as it is not supported by context yet */}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
