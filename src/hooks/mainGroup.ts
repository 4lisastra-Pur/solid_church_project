// src/hooks/mainGroup.ts
import { isServer, useInfiniteQuery } from '@tanstack/solid-query'
import { useStore } from '@tanstack/solid-store'
import { createTable, tableFeatures } from '@tanstack/solid-table'
import type { ColumnDef, RowData } from '@tanstack/solid-table'
import { createVirtualizer } from '@tanstack/solid-virtual'
import { createEffect, createMemo, createSignal, on, onCleanup, onMount } from 'solid-js'

import { accessFilterStore, setAccessFilter } from '~/lib/stores/activeState'
import { limit_getDataFromDatabase } from '~/data/type/showData'

// One shared feature set, so every page types its columns the same way:
//   const columns: Array<MainGroupColumn<ChurchAccess>> = [...]
export const features = tableFeatures({})
export type MainGroupColumn<TData extends RowData> = ColumnDef<typeof features, TData>

// Every body row is forced to this height so the virtualizer can do exact math
// (and the skeleton rows match the real rows).
export const ROW_HEIGHT = 57

const MIN_TABLE_HEIGHT = 240

export function createMainGroup<TData extends RowData>(opts: {
    // key for tanstack query, e.g. 'getAccess'. Search text and active filter are added automatically.
    queryKey: string
    // one page of data. Same params as your getAccess: { search, pageParam, active }
    queryFn: (params: {
        search: string
        pageParam: number
        active: boolean | null // null = "All"
    }) => Promise<TData[]>
    // columns for tanstack table
    columns: Array<MainGroupColumn<TData>>
    // space (px) kept free under the table. Raise it if the page itself starts scrolling.
    bottomGap?: number
    // false = the query returns every row in one response (no p_from / p_to paging).
    // Default true.
    paginated?: boolean
}) {
    const bottomGap = opts.bottomGap ?? 16
    const paginated = opts.paginated ?? true

    // -- Search State --
    const [searchInput, setSearchInput] = createSignal('')
    const [search, setSearch] = createSignal('')

    let debounceTimer: ReturnType<typeof setTimeout>
    const onSearchInput = (value: string) => {
        setSearchInput(value)
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => setSearch(value), 500) // wait 500ms after the user stops typing
    }
    onCleanup(() => clearTimeout(debounceTimer))

    // -- Status State --
    const activeFilter = useStore(accessFilterStore)

    // -- Query (infinite: page 0, 1, 2, ... until a short page comes back) --
    const Data = useInfiniteQuery(() => ({
        queryKey: [opts.queryKey, search(), activeFilter()],
        queryFn: ({ pageParam }) => {
            const filter = activeFilter()
            return opts.queryFn({
                search: search(),
                pageParam,
                active: filter === 'all' ? null : filter,
            })
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: TData[], _allPages: TData[][], lastPageParam: number) => {
            if (!paginated) return undefined // everything came back in page 0
            return lastPage.length < limit_getDataFromDatabase ? undefined : lastPageParam + 1
        },
        enabled: !isServer,
    }))

    const flatData = createMemo(() => Data.data?.pages.flat() ?? [])

    // -- Table --
    const table = createTable({
        features,
        columns: opts.columns,
        get data() {
            return flatData()
        },
    })

    const rows = () => table.getRowModel().rows

    // -- Height of the scroll box --
    // It needs a real height from the very first render. Without one it grows with
    // its rows, every row counts as "visible", and all pages load at once.
    // null = not measured yet (the component uses a CSS fallback until then).
    let scrollRef: HTMLDivElement | undefined
    const [scrollEl, setScrollEl] = createSignal<HTMLDivElement | null>(null)
    const [containerHeight, setContainerHeight] = createSignal<number | null>(null)

    const measureHeight = () => {
        if (!scrollRef) return
        const top = scrollRef.getBoundingClientRect().top
        setContainerHeight(Math.max(MIN_TABLE_HEIGHT, Math.floor(window.innerHeight - top - bottomGap)))
    }
    onMount(() => {
        measureHeight()
        requestAnimationFrame(measureHeight) // once more after the layout has settled
        window.addEventListener('resize', measureHeight)
        onCleanup(() => window.removeEventListener('resize', measureHeight))
    })

    // Enough skeleton rows to cover the whole box. May overshoot by one row;
    // the box is overflow-hidden while loading, so it's clipped.
    const skeletonRowCount = () => Math.ceil((containerHeight() ?? 720) / ROW_HEIGHT)

    // -- Virtualizer --
    const virtualizer = createVirtualizer<HTMLDivElement, HTMLTableRowElement>({
        get count() {
            return rows().length
        },
        getScrollElement: () => scrollEl(),
        estimateSize: () => ROW_HEIGHT,
        overscan: 2, // small overscan so we only fetch when the page is really running out of rows
        // used until the first real measurement, so the first render is never 0 rows
        get initialRect() {
            return { width: 0, height: containerHeight() ?? 600 }
        },
    })

    const virtualRows = () => virtualizer.getVirtualItems()

    // Spacer rows keep native <table> layout (and the sticky header) working:
    // instead of positioning rows absolutely, we pad above and below the rendered slice.
    const paddingTop = () => {
        const items = virtualRows()
        return items.length > 0 ? items[0].start : 0
    }
    const paddingBottom = () => {
        const items = virtualRows()
        return items.length > 0 ? virtualizer.getTotalSize() - items[items.length - 1].end : 0
    }

    // -- Fetch more --
    // Whenever the last rendered row reaches the end of the loaded data, get the next page.
    // This also covers "fill until the bottom": if the pages loaded so far don't fill the
    // box, the last row stays visible, so the next page is requested right away.
    createEffect(() => {
        const items = virtualRows()
        const last = items[items.length - 1]
        if (!last) return

        if (
            last.index >= rows().length - 1 &&
            Data.hasNextPage &&
            !Data.isFetching &&
            !Data.isError // don't auto-retry in a loop after a failed page
        ) {
            Data.fetchNextPage()
        }
    })

    // New search / filter -> back to the top
    createEffect(
        on(
            [search, activeFilter],
            () => {
                scrollRef?.scrollTo({ top: 0 })
            },
            { defer: true },
        ),
    )

    return {
        // search
        searchInput,
        onSearchInput,

        // active filter
        activeFilter,
        setAccessFilter,

        // tanstack query
        Data,

        // tanstack table
        table,
        rows,
        columnCount: opts.columns.length,

        // virtualizer + layout
        virtualRows,
        paddingTop,
        paddingBottom,
        containerHeight,
        skeletonRowCount,
        setScrollRef: (el: HTMLDivElement) => {
            scrollRef = el
            setScrollEl(el)
        },
    }
}

export type MainGroupController<TData extends RowData> = ReturnType<typeof createMainGroup<TData>>