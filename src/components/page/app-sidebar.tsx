import { createSignal, For, Show, type Component } from "solid-js"
import { useLocation, useNavigate } from "@tanstack/solid-router"
import {

    BriefcaseBusiness,
    CalendarCheck,
    ChevronDown,
    Church,
    CircleUserRound,
    ClefTreble,
    FileText,
    KeyRound,
} from "lucide-solid"

import { cn } from "~/lib/utils"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar
} from "~/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { supabase } from "~/lib/supabase"
import type { NavItem } from "~/lib/permissions"
import { SECTIONS } from "~/lib/navConfig"

/* --------------------------------- Component -------------------------------- */
const { data: masterLogo } = supabase
    .storage
    .from('image')
    .getPublicUrl('gpdi.png')

export function AppSidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { state, isMobile, setOpenMobile } = useSidebar()

    const isActive = (href: string) => {
        const pathname = location().pathname
        return href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(href + "/")
    }

    // sidebar is the icon-only rail (desktop only)
    const isRail = () => state() === "collapsed" && !isMobile()

    // navigate, and close the drawer on mobile
    const go = (to: string) => {
        navigate({ to })
        if (isMobile()) setOpenMobile(false)
    }

    const NavLeaf: Component<{ item: NavItem }> = (props) => (
        <SidebarMenuItem>
            <SidebarMenuButton
                tooltip={props.item.title}
                isActive={isActive(props.item.href)}
                onClick={() => go(props.item.href)}
                class="h-11 gap-3 text-[15px] [&>svg]:size-5"
            >
                <props.item.icon />
                <span>{props.item.title}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )

    const NavGroup: Component<{ item: NavItem }> = (props) => {
        const [open, setOpen] = createSignal(isActive(props.item.href))
        const children = () => props.item.children ?? []

        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    tooltip={props.item.title}
                    isActive={isActive(props.item.href)}
                    onClick={() =>
                        // rail: jump to first page; otherwise expand/collapse
                        isRail() ? go(children()[0].href) : setOpen(!open())
                    }
                    class="h-11 gap-3 text-[15px] [&>svg]:size-5"
                >
                    <props.item.icon />
                    <span>{props.item.title}</span>
                    <ChevronDown
                        class={cn(
                            "ml-auto !size-4 transition-transform group-data-[collapsible=icon]:hidden",
                            open() && "rotate-180"
                        )}
                    />
                </SidebarMenuButton>

                <Show when={open()}>
                    <SidebarMenuSub>
                        <For each={children()}>
                            {(sub) => (
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                        isActive={isActive(sub.href)}
                                        onClick={() => go(sub.href)}
                                        class="h-10 cursor-pointer text-[15px]"
                                    >
                                        <span>{sub.title}</span>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            )}
                        </For>
                    </SidebarMenuSub>
                </Show>
            </SidebarMenuItem>
        )
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader class="p-4 group-data-[collapsible=icon]:pl-3">
                <div class="flex flex-col items-center gap-3">
                    <Avatar class="w-28 h-28 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10">
                        <AvatarImage src={masterLogo.publicUrl} />
                        <AvatarFallback>GC</AvatarFallback>
                    </Avatar>
                    <span class="max-w-[9rem] text-center text-base font-semibold leading-tight group-data-[collapsible=icon]:hidden">
                        Sistem Administrasi Gereja
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <For each={SECTIONS}>
                    {(section) => (
                        <SidebarGroup>
                            {/* Title: full text normally, initial in mini sidebar */}
                            <div
                                onClick={() => section.href && go(section.href)}
                                class="mb-1 px-2 text-xl font-light text-zinc-400 cursor-pointer"
                            >
                                <span class="underline underline-offset-8 group-data-[collapsible=icon]:hidden">
                                    {section.label}
                                </span>
                                <span
                                    title={section.label}
                                    class="hidden text-center underline underline-offset-4 group-data-[collapsible=icon]:block"
                                >
                                    {section.short}
                                </span>
                            </div>

                            <SidebarGroupContent>
                                <SidebarMenu class="gap-1">
                                    <For each={section.items}>
                                        {(item) => (
                                            <Show
                                                when={item.children}
                                                fallback={<NavLeaf item={item} />}
                                            >
                                                <NavGroup item={item} />
                                            </Show>
                                        )}
                                    </For>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    )}
                </For>
            </SidebarContent>

            <SidebarFooter />
        </Sidebar>
    )
}