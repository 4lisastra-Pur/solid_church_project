import { createFileRoute } from '@tanstack/solid-router'
import { Phone, UserStar } from 'lucide-solid'


export const Route = createFileRoute('/dashboard/management/access/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (<div>Hello "/dashboard/management/access/"!


    </div>)
}
