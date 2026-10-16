import type { Tables, TablesInsert } from "~/lib/types/database.types"

// -- Minister --
export type Minister = Tables<'church_minister'>
export type MinisterInsert = TablesInsert<'church_minister'>
export type MinisterPost = Pick<MinisterInsert, 'name' | 'description'>
export type MinisterUpdate = Partial<Pick<Minister, 'name' | 'description'>>

// -- Service --
export type Service = Tables<'church_service'>
export type ServiceInsert = TablesInsert<'church_service'>
export type ServicePost = Pick<ServiceInsert, 'name' | 'description' | 'worship_scedule_day' | 'worship_scedule_time'>
export type ServiceUpdate = Partial<Pick<Service, 'name' | 'description' | 'worship_scedule_day' | 'worship_scedule_time'>>

export type cbOptionService = {
    id: number
    name: string
    worship_scedule_day: string
    worship_scedule_time: string
}
// -- Service Minister --


// -- Service Schedule --


// -- Minister --
