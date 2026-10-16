import { createFileRoute } from '@tanstack/solid-router'
import { Pencil, Phone, UserStar } from 'lucide-solid'
import { For, Show } from 'solid-js'
import MainGroupPage from '~/components/page/mainGroupPage'
import AccessUserDialogs, { CreateAccessUserDialog } from '~/components/page/management/acceess/accessUserDialog'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { getAccessUser } from '~/data/supabase/management/access/accessUser'
import type { AccessUser } from '~/data/type/access'
import { BADGE_LIMIT } from '~/data/type/showData'
import { createMainGroup, type MainGroupColumn } from '~/hooks/mainGroup'


export const Route = createFileRoute(
  '/dashboard/management/access/access_user',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dialog = CreateAccessUserDialog()

  const columns: Array<MainGroupColumn<AccessUser>> = [
    {
      id: 'number',
      header: 'No.',
      cell: (info) => <span>{info.row.index + 1}</span>,
    },
    {
      id: 'user_name',
      header: 'User',
      cell: (info) => (
        <div class='min-w-0 truncate'>
          <Show when={info.row.original.user_call_sign}>
            <span class='text-xs text-muted-foreground'>[{info.row.original.user_call_sign}]</span>
          </Show>
          <span class='font-semibold'> {info.row.original.user_full_name}</span>
        </div>
      ),
    },
    {
      id: 'user_detail',
      header: 'Detail',
      cell: (info) => {
        const row = info.row.original
        return (
          <div class='flex flex-row space-x-1 items-center min-h-14  min-w-0 truncate'>
            <Show when={info.row.original.user_phone_number}>
              <span>{info.row.original.user_phone_number}</span>
            </Show>
            <Show when={info.row.original.user_wa}>
              <Tooltip placement='top'>
                <TooltipTrigger class="flex size-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-lg">
                  <Phone class="size-3" />
                </TooltipTrigger>
                <TooltipContent>
                  has Whatsapp
                </TooltipContent>
              </Tooltip>

            </Show>
            <Show when={info.row.original.user_guest}>
              <Tooltip placement='top'>
                <TooltipTrigger

                  class="flex size-6 items-center justify-center rounded-full border-2 border-white bg-pink-500 text-white shadow-lg"
                  onClick={() => dialog.openViewGuest(row)}
                >
                  <UserStar class="size-3" />
                </TooltipTrigger>
                <TooltipContent>User Guest from {info.row.original.user_guest_from}</TooltipContent>
              </Tooltip>
            </Show>
          </div>
        )

      },
    },
    {
      id: 'user_access',
      header: 'Access',
      cell: (info) => {
        const row = info.row.original
        const items = row.user_access

        return (
          <div class='flex min-w-0 items-center gap-1 overflow-hidden'>
            <Show
              when={items.length > 0}
              fallback={
                <span class='text-xs text-muted-foreground'>No access yet</span>
              }
            >
              <For each={items.slice(0, BADGE_LIMIT)}>
                {(item) => (
                  <Badge
                    variant='secondary'
                    class='shrink-0 whitespace-nowrap px-1.5 py-0 text-[10px] leading-4 bg-green-100 text-green-600'
                  >
                    {item.access_name}
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
      id: 'create_at',
      header: 'Created',
      cell: (info) => {
        const date = new Date(info.row.original.user_create_at)
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
              <TooltipContent>Manage access of {row.user_call_sign ? row.user_call_sign : row.user_full_name}</TooltipContent>
            </Tooltip>
          </div>
        )
      }
    }

  ]

  const controller = createMainGroup<AccessUser>({
    queryKey: 'getAccessUser',
    queryFn: getAccessUser,
    columns,
    paginated: false, // access_list_get returns every access at once
  })

  return (
    <MainGroupPage
      pageName='Access User'
      controller={controller}
      columnWidths={{
        user_name: '22%',
        user_detail: '170px',
        user_access: '48%',
        create_at: '170px'
      }}
      skeletonShapes={{
        user_name: 'text',
        user_detail: 'text',
        user_access: 'long',
      }}
      alwaysShow={[
        'user_name',
        'user_access',
        'action'
      ]}
    >
      <AccessUserDialogs controller={dialog} />
    </MainGroupPage>
  )
}
