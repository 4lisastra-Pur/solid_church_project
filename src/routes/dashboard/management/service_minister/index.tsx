import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/dashboard/management/service_minister/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <div>Hello "/dashboard/management/service_minister/"!</div>
}
