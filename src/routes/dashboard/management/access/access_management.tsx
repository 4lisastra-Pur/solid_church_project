import { createFileRoute } from '@tanstack/solid-router'
import MainGroupPage from '~/components/page/mainGroupPage'
import { createMainGroup, type MainGroupColumn } from '~/hooks/mainGroup'
import { getAccessList } from '~/data/supabase/management/access/accessList'
import AccessListDialogs, { CreateAccessListDialog } from '~/components/page/management/acceess/accessListDialog'
import { For, Show } from 'solid-js'
import { Badge } from '~/components/ui/badge'
import { BADGE_LIMIT } from '~/data/type/showData'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { Pencil } from 'lucide-solid'
import type { AccessList } from '~/data/type/access'


export const Route = createFileRoute('/dashboard/management/access/access_management')({
  component: RouteComponent,
})

function RouteComponent() {
  // -- Access List Dialog --
  const dialog = CreateAccessListDialog()

  // -- Columns - for tansatack table
  const columns: Array<MainGroupColumn<AccessList>> = [
    {
      id: 'number',
      header: 'No.',
      cell: (info) => <span>{info.row.index + 1}</span>,
    },
    {
      id: 'access_name',
      header: 'Access',
      cell: (info) => (
        <div class='min-w-0 truncate'>
          <span class='text-xs text-muted-foreground'>[{info.row.original.access_id}]</span>
          <span class='font-semibold'> {info.row.original.access_name}</span>
        </div>
      ),
    },
    {
      id: 'access_list',
      header: 'Access Detail',
      cell: (info) => {
        const row = info.row.original
        const items = row.access_list

        return (
          <div class='flex min-w-0 items-center gap-1 overflow-hidden'>
            <Show
              when={items.length > 0}
              fallback={
                <span class='text-xs text-muted-foreground'>No access detail yet</span>
              }
            >
              <For each={items.slice(0, BADGE_LIMIT)}>
                {(item) => (
                  <Badge
                    variant='secondary'
                    class='shrink-0 whitespace-nowrap px-1.5 py-0 text-[10px] leading-4 bg-green-100 text-green-600'
                  >
                    {item.access_detail_name}
                  </Badge>
                )}
              </For>
              <Show when={items.length > BADGE_LIMIT}>
                <Button
                  variant='default'
                  class='h-5 min-h-5 shrink-0 bg-zinc-600 px-1.5 py-0 text-[10px] leading-none'
                  onClick={() => dialog.openViewDetail(row)}
                >
                  +{items.length - BADGE_LIMIT} more
                </Button>
              </Show>
            </Show>
          </div>
        )
      },
    },
    {
      id: 'access_create_at',
      header: 'Created',
      cell: (info) => {
        const date = new Date(info.row.original.access_create_at)
        return (
          <span>
            {date.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        )
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
              <TooltipTrigger
                as={Button<'button'>}
                size='icon'
                class='rounded-xl bg-yellow-400 text-white hover:bg-yellow-400'
                onClick={() => dialog.openMutate(row)}
              >
                <Pencil size='4' />
              </TooltipTrigger>
              <TooltipContent>Manage access detail of {row.access_name}</TooltipContent>
            </Tooltip>
          </div>
        )
      },
    },
  ]

  // -- Query key for tanstack query --
  const controller = createMainGroup<AccessList>({
    queryKey: 'getAccessList',
    queryFn: getAccessList,
    columns,
    paginated: false, // access_list_get returns every access at once
  })


  return (
    <MainGroupPage
      pageName='Access List'
      controller={controller}
      columnWidths={{
        access_name: '22%',
        access_list: '48%',
        access_create_at: '170px',
      }}
      skeletonShapes={{ access_name: 'text', access_list: 'long' }}
      alwaysShow={['access_name', 'access_list', 'action']}
    >
      <AccessListDialogs controller={dialog} />
    </MainGroupPage>

  )
}
