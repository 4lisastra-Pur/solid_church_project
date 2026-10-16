// src/components/mainGroup/MainGroupPage.tsx
import { For, Match, Show, splitProps, Switch } from 'solid-js'
import type { ComponentProps, JSX } from 'solid-js'
import { FlexRender } from '@tanstack/solid-table'
import type { RowData } from '@tanstack/solid-table'
import { Plus, Search } from 'lucide-solid'

import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { TextField, TextFieldInput } from '~/components/ui/text-field'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'

import { cn } from '~/lib/utils'
import { ROW_HEIGHT } from '~/hooks/mainGroup'
import type { MainGroupController } from '~/hooks/mainGroup'

// Shape of the skeleton for one column. Pick the one closest to the real cell content.
export type SkeletonShape =
    | 'short' // e.g. "No."
    | 'text' // default: a name, a date...
    | 'long' // e.g. a description
    | 'badge' // e.g. a status pill
    | 'actions' // the row of icon buttons

// "No." and "Action" exist on every table, so they work without any config.
// Every other column falls back to 'text' unless the page says otherwise.
const DEFAULT_SKELETON_SHAPE: Record<string, SkeletonShape> = {
    number: 'short',
    action: 'actions',
}
const DEFAULT_COLUMN_WIDTH: Record<string, string> = {
    number: '50px',
    action: '145px',
}

// Used until the real height is measured (server render / first frame).
const FALLBACK_TABLE_HEIGHT = 'calc(100dvh - 13rem)'

interface MainGroupPageProps<TData extends RowData> {
    pageName: string // shown in tooltips, empty state and error text
    controller: MainGroupController<TData> // from createMainGroup()
    // Widths by column id, e.g. { name: '200px', active: '120px' }.
    // Columns without a width share the remaining space equally.
    columnWidths?: Record<string, string>
    // Skeleton shape by column id, e.g. { description: 'long', active: 'badge' }
    skeletonShapes?: Record<string, SkeletonShape>
    alwaysShow?: string[]
    openAdd?: () => void // the "+" button only shows up when this is given
    activeStatus?: boolean // toggle active status want to have or not the filter status
    debug?: boolean // small status line above the table
    children?: JSX.Element // dialogs and other extras
}

// solid-ui's <Table> wraps in its own overflow-auto div, which breaks
// sticky headers when we already provide our own scroll container.
// This is the same markup minus that wrapper.
function VirtualTableRoot(props: ComponentProps<'table'>) {
    const [local, others] = splitProps(props, ['class'])
    return <table class={cn('w-full caption-bottom text-sm', local.class)} {...others} />
}

// Widths vary a little per row so the loading state doesn't look like a stamped grid.
const pick = (widths: number[], i: number) => widths[i % widths.length]

function skeletonCell(shape: SkeletonShape, i: number) {
    switch (shape) {
        case 'short':
            return <Skeleton height={16} width={20} radius={10} />
        case 'long':
            // wrapper clips the bar on narrow screens instead of overflowing into the next column
            return (
                <div class='min-w-0 overflow-hidden'>
                    <Skeleton height={16} width={pick([420, 300, 360, 260, 340], i)} radius={10} />
                </div>
            )
        case 'badge':
            return <Skeleton height={22} width={64} radius={8} />
        case 'actions':
            return (
                <div class='flex items-center gap-1'>
                    <Skeleton height={40} width={40} radius={12} />
                    <Skeleton height={40} width={40} radius={12} />
                </div>
            )
        case 'text':
        default:
            return <Skeleton height={16} width={pick([100, 80, 120, 90, 110], i)} radius={10} />
    }
}

const HIDE_BREAKPOINTS = ['hidden sm:table-cell', 'hidden md:table-cell', 'hidden lg:table-cell', 'hidden xl:table-cell']
function buildVisibilityMap(columnIds: string[], alwaysShow: string[] = []) {
    const hideable = columnIds.filter((id) => !alwaysShow.includes(id))
    const map: Record<string, string> = {}

    columnIds.forEach((id) => {
        if (alwaysShow.includes(id)) {
            map[id] = '' // never hidden
        }
    })

    // Reverse priority: last hideable column hides first (lowest breakpoint),
    // columns closer to the "important" ones hide last.
    hideable
        .slice()
        .reverse()
        .forEach((id, i) => {
            map[id] = HIDE_BREAKPOINTS[i] ?? HIDE_BREAKPOINTS[HIDE_BREAKPOINTS.length - 1]
        })

    return map
}

export default function MainGroupPage<TData extends RowData>(props: MainGroupPageProps<TData>) {
    const c = props.controller

    const columnIds = () => c.table.getHeaderGroups()[0]?.headers.map((h) => h.column.id) ?? []
    const visibilityMap = () => buildVisibilityMap(columnIds(), props.alwaysShow ?? [])

    const widthOf = (columnId: string) =>
        props.columnWidths?.[columnId] ?? DEFAULT_COLUMN_WIDTH[columnId]
    const shapeOf = (columnId: string): SkeletonShape =>
        props.skeletonShapes?.[columnId] ?? DEFAULT_SKELETON_SHAPE[columnId] ?? 'text'
    const visibilityOf = (columnId: string) => visibilityMap()[columnId] ?? ''

    return (
        <div class='flex flex-col w-full items-start'>

            {/* Toolbar — stays fixed at top */}
            <div class='flex flex-row items-center shadow-xl rounded-xl w-full bg-muted p-2 mb-4 justify-between'>

                {/* Search */}
                <TextField
                    value={c.searchInput()}
                    onChange={c.onSearchInput}
                    class='w-2/4'
                >
                    <div class='relative'>
                        <Search class='absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                        <TextFieldInput
                            type='search'
                            placeholder='Search'
                            class='pl-8 rounded-2xl'
                        />
                    </div>
                </TextField>

                {/* Add / All / Active / Disable */}
                <div class='flex items-center space-x-3'>
                    {/* not every page can add data */}
                    <Show when={props.openAdd}>
                        <Tooltip placement='top'>
                            <TooltipTrigger as={Button<'button'>}
                                variant={'outline'}
                                class='gap-1 rounded-2xl border-green-400 bg-green-100 text-green-400 hover:bg-green-200 hover:text-green-500'
                                onClick={() => props.openAdd?.()}
                            >
                                <Plus size={4} />
                            </TooltipTrigger>
                            <TooltipContent>Add {props.pageName}</TooltipContent>
                        </Tooltip>
                    </Show>

                    <Show when={props.activeStatus}>
                        <Tooltip placement='top'>
                            <TooltipTrigger as={Button<'button'>}
                                variant={'secondary'}
                                class={`gap-1 rounded-2xl ${c.activeFilter() === 'all'
                                    ? 'bg-blue-500 text-blue-100 hover:bg-blue-600 hover:text-blue-200'
                                    : 'bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600'
                                    }`}
                                onClick={() => c.setAccessFilter('all')}
                            >
                                All
                            </TooltipTrigger>
                            <TooltipContent>Show All {props.pageName} Data</TooltipContent>
                        </Tooltip>

                        <Tooltip placement='top'>
                            <TooltipTrigger as={Button<'button'>}
                                variant={'secondary'}
                                class={`gap-1 rounded-2xl ${c.activeFilter() === true
                                    ? 'bg-green-500 text-green-100 hover:bg-green-600 hover:text-green-200'
                                    : 'bg-green-100 text-green-500 hover:bg-green-200 hover:text-green-600'
                                    }`}
                                onClick={() => c.setAccessFilter(true)}
                            >
                                Active
                            </TooltipTrigger>
                            <TooltipContent>Show Just Active {props.pageName} Data</TooltipContent>
                        </Tooltip>

                        <Tooltip placement='top'>
                            <TooltipTrigger as={Button<'button'>}
                                variant={'secondary'}
                                class={`gap-1 rounded-2xl ${c.activeFilter() === false
                                    ? 'bg-rose-500 text-rose-100 hover:bg-rose-600 hover:text-rose-200'
                                    : 'bg-rose-100 text-rose-500 hover:bg-rose-200 hover:text-rose-600'
                                    }`}
                                onClick={() => c.setAccessFilter(false)}
                            >
                                Disable
                            </TooltipTrigger>
                            <TooltipContent>Show Just Disable {props.pageName} Data</TooltipContent>
                        </Tooltip>
                    </Show>
                </div>
            </div>

            <Show when={props.debug}>
                <div class='text-xs text-muted-foreground p-1'>
                    status: {c.Data.status} | fetchStatus: {c.Data.fetchStatus} | pages: {c.Data.data?.pages.length ?? 0} | rows: {c.rows().length} | rendered: {c.virtualRows().length} | hasNext: {String(c.Data.hasNextPage)} | height: {c.containerHeight() ?? 'not measured'}
                </div>
            </Show>

            {/* Table area — explicit pixel height (measured in the hook), scrolls internally.
          This div is the virtualizer's scroll element, so it must always be mounted.
          No flex-1 here: flex-basis would override the height.
          While the first page is loading it is overflow-hidden (no scrollbar,
          just a full-height skeleton). */}
            <div
                ref={c.setScrollRef}
                class={cn(
                    'w-full shrink-0 rounded-lg border border-border bg-background',
                    c.Data.isPending ? 'overflow-hidden' : 'overflow-auto',
                )}
                style={{
                    height: c.containerHeight() === null ? FALLBACK_TABLE_HEIGHT : `${c.containerHeight()}px`,
                }}
            >
                <Switch
                    fallback={
                        <>
                            <VirtualTableRoot class='table-fixed'>
                                {/* The header is always rendered, also while loading, so nothing
                    jumps when the data arrives. Sticky lives on the <th> cells
                    (not the <tr>/<thead>) and the bottom line is a pseudo-element,
                    because a normal border on a sticky cell is left behind when
                    the table uses border-collapse. */}
                                <TableHeader>
                                    <For each={c.table.getHeaderGroups()}>
                                        {(headerGroup) => (
                                            <TableRow>
                                                <For each={headerGroup.headers}>
                                                    {(header) => (
                                                        // <TableHead
                                                        //     class='sticky top-0 z-10 bg-background text-left font-medium p-2 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border'
                                                        //     style={{ width: widthOf(header.column.id) }}
                                                        // >
                                                        //     <FlexRender header={header} />
                                                        // </TableHead>
                                                        <TableHead
                                                            class={cn(
                                                                'sticky top-0 z-10 bg-background text-left font-medium p-2 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border',
                                                                visibilityOf(header.column.id),
                                                            )}
                                                            style={{ width: widthOf(header.column.id) }}
                                                        >
                                                            <FlexRender header={header} />
                                                        </TableHead>
                                                    )}
                                                </For>
                                            </TableRow>
                                        )}
                                    </For>
                                </TableHeader>

                                <TableBody>
                                    <Show
                                        when={!c.Data.isPending}
                                        fallback={
                                            // First load (and every new search/filter): same rows and cells as the
                                            // real table, filled with skeletons down to the bottom of the box.
                                            // The shape of each cell follows the columns of THIS table.
                                            <For each={Array.from({ length: c.skeletonRowCount() })}>
                                                {(_, rowIndex) => (
                                                    <TableRow
                                                        class='hover:bg-transparent'
                                                        style={{ height: `${ROW_HEIGHT}px` }}
                                                    >
                                                        <For each={c.table.getHeaderGroups()[0]?.headers ?? []}>
                                                            {(header) => (
                                                                // <TableCell class='p-2'>
                                                                //     {skeletonCell(shapeOf(header.column.id), rowIndex())}
                                                                // </TableCell>
                                                                <TableCell class={cn('p-2', visibilityOf(header.column.id))}>
                                                                    {skeletonCell(shapeOf(header.column.id), rowIndex())}
                                                                </TableCell>
                                                            )}
                                                        </For>
                                                    </TableRow>
                                                )}
                                            </For>
                                        }
                                    >
                                        <Show when={c.paddingTop() > 0}>
                                            <tr aria-hidden='true'>
                                                <td
                                                    colSpan={c.columnCount}
                                                    style={{ height: `${c.paddingTop()}px`, padding: '0', border: '0' }}
                                                />
                                            </tr>
                                        </Show>

                                        <For each={c.virtualRows()}>
                                            {(virtualRow) => {
                                                const row = () => c.rows()[virtualRow.index]
                                                return (
                                                    <Show when={row()}>
                                                        {(r) => (
                                                            <TableRow style={{ height: `${ROW_HEIGHT}px` }}>
                                                                <For each={r().getAllCells()}>
                                                                    {(cell) => (
                                                                        // <TableCell class='p-2'>
                                                                        //     <FlexRender cell={cell} />
                                                                        // </TableCell>
                                                                        <TableCell class={cn('p-2 min-w-0', visibilityOf(cell.column.id))}>
                                                                            <FlexRender cell={cell} />
                                                                        </TableCell>
                                                                    )}
                                                                </For>
                                                            </TableRow>
                                                        )}
                                                    </Show>
                                                )
                                            }}
                                        </For>

                                        <Show when={c.paddingBottom() > 0}>
                                            <tr aria-hidden='true'>
                                                <td
                                                    colSpan={c.columnCount}
                                                    style={{ height: `${c.paddingBottom()}px`, padding: '0', border: '0' }}
                                                />
                                            </tr>
                                        </Show>

                                        <Show when={c.rows().length === 0}>
                                            <tr>
                                                <td
                                                    colSpan={c.columnCount}
                                                    class='p-6 text-center text-sm text-muted-foreground'
                                                >
                                                    No {props.pageName} data found.
                                                </td>
                                            </tr>
                                        </Show>
                                    </Show>
                                </TableBody>
                            </VirtualTableRoot>

                            {/* Footer — loading more / failed / all loaded */}
                            <Show when={!c.Data.isPending}>
                                <div class='flex items-center justify-center gap-2 p-3 text-xs text-muted-foreground'>
                                    <Switch>
                                        <Match when={c.Data.isFetchingNextPage}>
                                            <Skeleton height={16} width={200} radius={10} />
                                        </Match>
                                        <Match when={c.Data.isFetchNextPageError}>
                                            <span>Failed to load more data.</span>
                                            <Button variant='ghost' size='sm' onClick={() => c.Data.fetchNextPage()}>
                                                Retry
                                            </Button>
                                        </Match>
                                        <Match when={!c.Data.hasNextPage && c.rows().length > 0}>
                                            <span>All data loaded ({c.rows().length})</span>
                                        </Match>
                                    </Switch>
                                </div>
                            </Show>
                        </>
                    }
                >
                    {/* First load failed (a failed "load more" is handled in the footer) */}
                    <Match when={c.Data.isError && !c.Data.data}>
                        <Alert variant='destructive' class='m-4'>
                            <AlertDescription>
                                {c.Data.error instanceof Error
                                    ? c.Data.error.message
                                    : `Failed to load ${props.pageName} data.`}
                            </AlertDescription>
                        </Alert>
                    </Match>
                </Switch>
            </div>

            {props.children}
        </div>
    )
}