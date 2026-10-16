import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, onCleanup } from 'solid-js'
import MainGroupPage from '~/components/page/mainGroupPage'
import AccessDetailDialog, { CreateAccessDetailDialog } from '~/components/page/management/acceess/accessDetailDialog'
import { Button } from '~/components/ui/button'
import { createMainGroup, type MainGroupColumn } from '~/hooks/mainGroup'
import { getAccessDetail } from '~/data/supabase/management/access/accessDetail'
import type { AccessDetail } from '~/data/type/access'

export const Route = createFileRoute(
  '/dashboard/management/access/access_detail',
)({
  component: RouteComponent,
})

function RouteComponent() {
  // -- Access Deetail Dialog --
  const dialog = CreateAccessDetailDialog()

  // -- Columns tanstack Table --
  const columns: Array<MainGroupColumn<AccessDetail>> = [
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
        const checkTruncated = (el: HTMLSpanElement) => {
          const ro = new ResizeObserver(() => {
            setIsTruncated(el.scrollWidth > el.clientWidth)
          })
          ro.observe(el)
          onCleanup(() => ro.disconnect())
        }

        return (
          <div class='flex items-center gap-2 min-w-0'>
            <span
              ref={checkTruncated}
              class='truncate min-w-0'
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
      accessorKey: 'pseudo_code',
      header: 'SQL',
      cell: (info) => {
        const row = info.row.original

        return (
          <Button
            variant='default'
            class='h-5 min-h-5 px-1.5 py-0 text-[10px] bg-blue-950 leading-none shrink-0'
            onClick={() => dialog.openViewSql(row)}
          >
            More
          </Button>
        )
      }
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
  ]

  const controller = createMainGroup<AccessDetail>({
    queryKey: 'getAccessDetail',
    queryFn: getAccessDetail,
    columns,
  })

  return (
    <MainGroupPage
      pageName='Access Detail'
      controller={controller}
      columnWidths={{ name: '20%', description: '45%', pseudo_code: '90px', create_at: '150px' }}
      skeletonShapes={{ description: 'long', pseudo_code: 'badge' }}
      alwaysShow={['name', 'description']}
      debug
    >
      <AccessDetailDialog controller={dialog} />
    </MainGroupPage>
  )
}
