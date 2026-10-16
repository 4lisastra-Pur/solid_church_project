import { Link, useLocation, useNavigate } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "../ui/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { findByPath } from '~/lib/navConfig'
import { can } from '~/lib/permissions'
import { Check, ChevronDown } from "lucide-solid";


function formatSegment(segment: string) {
    return segment
        .replace(/[_-]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function DynamicBreadcrump() {
    const location = useLocation()
    const navigate = useNavigate()
    const pathNames = () => location().pathname.split('/').filter(Boolean)

    // where are we in the nav tree?
    const found = () => findByPath(location().pathname)
    const currentChild = () => found()?.child

    // sibling pages of the current page, minus the ones the user can't open
    const siblings = () => (found()?.group.children ?? []).filter((c) => can(c.fn))

    return (
        <Breadcrumb class=" capitalize">
            <BreadcrumbList>
                <For each={pathNames()}>
                    {(segment, index) => {
                        const href = () => '/' + pathNames().slice(0, index() + 1).join('/')
                        const isLast = () => index() === pathNames().length - 1
                        const label = () => formatSegment(segment)
                        // on the last segment prefer the nav title ("Access Management")
                        const lastLabel = () => currentChild()?.title.trim() ?? label()

                        return (
                            <>
                                {/* Add a separator before every item except the first one */}
                                <Show when={index() > 0}>
                                    <BreadcrumbSeparator />
                                </Show>

                                <BreadcrumbItem>
                                    <Show
                                        when={!isLast()}
                                        fallback={
                                            <Show
                                                when={siblings().length > 1}
                                                fallback={
                                                    <BreadcrumbLink current>{lastLabel()}</BreadcrumbLink>
                                                }
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger class='flex items-center gap-1 rounded-md px-2 py-1 font-medium text-foreground hover:bg-muted'>
                                                        {lastLabel()}
                                                        <ChevronDown size={14} />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent class='min-w-52'>
                                                        <For each={siblings()}>
                                                            {(item) => {
                                                                const isCurrent = () =>
                                                                    item.href === currentChild()?.href
                                                                return (
                                                                    <DropdownMenuItem
                                                                        class='justify-between'
                                                                        onSelect={() => navigate({ to: item.href })}
                                                                    >
                                                                        <span class={isCurrent() ? 'font-semibold' : ''}>
                                                                            {item.title.trim()}
                                                                        </span>
                                                                        <Show when={isCurrent()}>
                                                                            <Check size={14} />
                                                                        </Show>
                                                                    </DropdownMenuItem>
                                                                )
                                                            }}
                                                        </For>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </Show>
                                        }
                                    >
                                        {/* Use TanStack Link to handle client-side routing safely */}
                                        <BreadcrumbLink as={Link} to={href()}>
                                            {label()}
                                        </BreadcrumbLink>
                                    </Show>
                                </BreadcrumbItem>
                            </>
                        )
                    }}
                </For>
            </BreadcrumbList>
        </Breadcrumb>
    )
}