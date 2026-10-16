export const limit_getDataFromDatabase = 5

export const BADGE_LIMIT = 3

// -- For get data group
export type GetSearchParams = {
    search?: string
    pageParam?: number   // page index, not row offset
    active?: boolean | null
}

// for data type on Combo Box
export type cbOption = {
    id: number
    name: string
}

