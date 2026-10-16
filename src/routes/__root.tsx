import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/solid-router'
import type { QueryClient } from '@tanstack/solid-query'

import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'

import '@fontsource/inter/400.css'

import { HydrationScript } from 'solid-js/web'
import { Suspense } from 'solid-js'

import styleCss from '../styles.css?url'
import { Provider as QueryClientProvider } from '../integrations/tanstack-query/provider'
import { NotFound } from '~/components/page/notFound'

// import { ColorModeProvider, ColorModeScript } from "@kobalte/core"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    links: [{ rel: 'stylesheet', href: styleCss }],
  }),
  shellComponent: RootComponent,
  notFoundComponent: NotFound
})

function RootComponent() {
  const context = Route.useRouteContext()

  return (
    <html class="h-full">
      <head>
        <HydrationScript />
        <HeadContent />
        {/* <ColorModeScript /> */}
      </head>
      <body class="h-screen overflow-hidden flex flex-col">
        <QueryClientProvider queryClient={context().queryClient}>

          {/* <ColorModeProvider> */}
          <Outlet />
          {/* </ColorModeProvider> */}
          <TanStackRouterDevtools />

        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}