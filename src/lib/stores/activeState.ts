import { Store } from "@tanstack/store"

// -- Status State --
export type ActiveFilter = 'all' | true | false
export const accessFilterStore = new Store<ActiveFilter>('all')
export const setAccessFilter = (value: ActiveFilter) => {
    accessFilterStore.setState(() => value)
}
