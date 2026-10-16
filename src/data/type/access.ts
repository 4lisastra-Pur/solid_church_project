import type { Tables, TablesInsert } from "~/lib/types/database.types"

// - access detail
export type AccessDetail = Tables<'church_access_detail'>

// - access
export type Access = Tables<'church_access'>
export type AccessInsert = TablesInsert<'church_access'>
export type AccessPost = Pick<AccessInsert, 'name' | 'description' | 'active'>
export type AccessUpdate = Partial<Pick<Access, 'name' | 'description' | 'active'>>

// - access list
export type AccessListItem = {
    access_list_id: number
    access_list_create_at: string
    access_detail_id: number
    access_detail_name: string
}

export type AccessList = {
    access_id: number
    access_name: string
    access_create_at: string
    access_list: AccessListItem[]
}

export type AccessListMutate = {
    idAccess: number
    idAccessDetail: number[]
}

// - access User

export type AccessUserAccess = {
    access_user_id: number
    access_user_create_at: string
    access_id: number
    access_name: string
}

export type AccessUser = {
    user_id: number
    user_full_name: string
    user_call_sign: string
    user_wa: boolean
    user_phone_number: string
    user_guest: boolean
    user_guest_from: string
    user_guest_description: string
    user_create_at: string
    user_access: AccessUserAccess[]
}

export type AccessUserMutate = {
    idUser: number
    idAccess: number[]
}