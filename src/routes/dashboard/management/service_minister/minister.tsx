import { createFileRoute } from '@tanstack/solid-router'
import { Circle, CircleSlash2, Pencil, Trash2 } from 'lucide-solid'
import { createSignal } from 'solid-js'
import MainGroupPage from '~/components/page/mainGroupPage'
import { CreateMinisterDialog } from '~/components/page/management/service_minister/ministerDialog'
import MinisterDialog from '~/components/page/management/service_minister/ministerDialog'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { getMinister } from '~/data/supabase/management/service_minister/minister'
import type { Minister } from '~/data/type/service_minister'
import { createMainGroup, type MainGroupColumn } from '~/hooks/mainGroup'

export const Route = createFileRoute(
    '/dashboard/management/service_minister/minister',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const dialog = CreateMinisterDialog()

    const columns: Array<MainGroupColumn<Minister>> = [
        {
            id: 'number',
            header: 'No.',
            cell: (info) => <span>{info.row.index + 1}</span>,
        },
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: (info) => {
                const row = info.row.original
                const value = (info.getValue() as string) ?? ''
                const [isTruncated, setIsTruncated] = createSignal(false)
                const checkTruncated = (hsel: HTMLSpanElement) => {
                    queueMicrotask(() => {
                        // `truncate` clips horizontally, so compare widths (not heights)
                        setIsTruncated(hsel.scrollWidth > hsel.clientWidth)
                    })
                }

                return (
                    <div class='flex items-center gap-2 min-w-0'>
                        <span
                            ref={checkTruncated}
                            class='truncate'
                            title={isTruncated() ? value : undefined}
                        >
                            {value || '-'}
                        </span>
                        {isTruncated() && (
                            <Button
                                variant='default'
                                class='h-5 min-h-5 px-1.5 py-0 text-[10px] bg-zinc-600 leading-none shrink-0'
                                onClick={() => dialog.openViewDesc(row)}
                            >More</Button>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'active',
            header: 'Status',
            cell: (info) => (
                <Badge
                    variant='secondary'
                    class={info.getValue() ? 'bg-green-100 text-green-400' : 'bg-rose-100 text-rose-400'}
                >
                    {info.getValue() ? 'Active' : 'Disabled'}
                </Badge>
            ),
        },
        {
            accessorKey: 'create_at',
            header: 'Created',
            cell: (info) => {
                const date = new Date(info.getValue() as string)
                const formatDate = date.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })
                return <span>{formatDate}</span>
            },
        },
        {
            id: 'action',
            header: 'Action',
            cell: (info) => {
                const row = info.row.original

                return (
                    <div class='flex items-center gap-1'>
                        <Tooltip placement='top'>
                            <TooltipTrigger as={Button<'button'>}
                                size='icon'
                                class='rounded-xl bg-yellow-400 text-white hover:bg-yellow-400'
                                onClick={() => dialog.openPatch(row)}
                            >
                                <Pencil size='4' />
                            </TooltipTrigger>
                            <TooltipContent>Edit {row.name}</TooltipContent>
                        </Tooltip>

                        <Tooltip placement='top'>
                            <TooltipTrigger as={Button<'button'>}
                                size='icon'
                                class={`rounded-xl text-white ${row.active ? 'bg-rose-400 hover:bg-rose-500' : 'bg-green-400 hover:bg-green-500'}`}
                                onClick={() => dialog.openDiActive(row)}
                            >
                                {row.active ? <CircleSlash2 size='4' /> : <Circle size='4' />}
                            </TooltipTrigger>
                            <TooltipContent>
                                {row.active ? 'Disable' : 'Active'} {row.name}
                            </TooltipContent>
                        </Tooltip>

                        {!row.active && (
                            <Tooltip placement='top'>
                                <TooltipTrigger as={Button<'button'>}
                                    size='icon'
                                    class='rounded-xl bg-red-400 text-white hover:bg-red-400'
                                    onClick={() => dialog.openDelete(row)}
                                >
                                    <Trash2 size='4' />
                                </TooltipTrigger>
                                <TooltipContent>Permanent Delete {row.name}</TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                )
            },
        },
    ]

    const controller = createMainGroup<Minister>({
        queryKey: 'getMinister',
        queryFn: getMinister,
        columns
    })
    return (
        <MainGroupPage
            pageName='Minister'
            controller={controller}
            columnWidths={{
                name: '20%',
                description: '45%',
                active: '90px',
                create_at: '150px',
            }}
            skeletonShapes={{ description: 'long', active: 'badge' }}
            alwaysShow={['name', 'description', 'action']}
            openAdd={dialog.openAdd}
            activeStatus
            debug
        >
            <MinisterDialog controller={dialog} />
        </MainGroupPage>
    )
}
