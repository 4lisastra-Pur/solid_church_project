import {
    CalendarCheck,
    Church,
    CircleUserRound,
    ClefTreble,
    FileText,
    KeyRound,
} from 'lucide-solid'
import type { NavChild, NavItem } from '~/lib/permissions'


const MANAGEMENT: NavItem[] = [
    {
        title: 'Minister Service Management',
        href: '/audience',
        icon: Church,
        children: [
            { title: 'Service List', href: '/audience/segments' },
            { title: 'Minister List', href: '/audience/segments' },
            { title: 'Minister Service', href: '/audience/followers' },
            { title: 'Service Schedule', href: '/audience/followers' },
            { title: 'Calendar Management', href: '/audience/followers' },
        ],
    },
    {
        title: 'Song Management',
        href: '/audience',
        icon: ClefTreble,
        children: [
            { title: 'Song List', href: '/audience/followers' },
            { title: 'Song Catagory', href: '/audience/segments' },
        ],
    },
    {
        title: 'User Management',
        href: '/audience',
        icon: CircleUserRound,
    },
    {
        title: 'Access Control Management',
        href: '/dashboard/management/access',
        icon: KeyRound,
        children: [
            // TODO: set fn to each page's real fn_name using fn make it protedted so if user don't have this it ca't access it
            // { title: 'Access User', href: '/dashboard/management/access/access_user' },
            // {
            //     title: 'Access Management',
            //     href: '/dashboard/management/access/access_management',
            //     fn: 'access_list_get',
            // },
            // { title: 'Access', href: '/dashboard/management/access/access', fn: 'access_get' },
            // { title: 'Access Detail', href: '/dashboard/management/access/access_detail' },

            // TODO: i using old one with no Fn
            { title: "Access User", href: "/dashboard/management/access/access_user" },
            { title: "Access Management", href: "/dashboard/management/access/access_management" },
            { title: "Access", href: "/dashboard/management/access/access" },
            { title: "Access Detail", href: "/dashboard/management/access/access_detail" }
        ],
    },
]

const OPERATIONAL: NavItem[] = [
    {
        title: 'Service Operations',
        href: '/posts',
        icon: FileText,
        children: [
            { title: 'Praise and Worship', href: '/audience/followers' },
            { title: 'Service Teaching', href: '/audience/followers' },
            { title: 'Service Detail', href: '/audience/followers' },
        ],
    },
    {
        title: 'Minister Operations',
        href: '/schedules',
        icon: CalendarCheck,
        children: [{ title: 'Minister Schedule', href: '/audience/followers' }],
    },
]

// `short` is what shows in the mini (icon-only) sidebar
export const SECTIONS = [
    { label: 'MANAGEMENT', short: 'M', href: '/audience', items: MANAGEMENT },
    { label: 'OPERATIONAL', short: 'O', href: '/audience', items: OPERATIONAL },
]

// Which group + child does this URL belong to? (null = not a child page, e.g. /dashboard)
export function findByPath(pathname: string): { group: NavItem; child: NavChild } | null {
    for (const section of SECTIONS) {
        for (const group of section.items) {
            const child = group.children?.find(
                (c) => pathname === c.href || pathname.startsWith(c.href + '/'),
            )
            if (child) return { group, child }
        }
    }
    return null
}
