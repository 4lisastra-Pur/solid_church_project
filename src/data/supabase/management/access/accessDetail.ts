import { supabase } from "~/lib/supabase"
import { limit_getDataFromDatabase } from "~/data/type/showData"
import type { cbOption, GetSearchParams } from "~/data/type/showData"
import type { AccessDetail } from "~/data/type/access"


// TODO: replace with real auth identity once login exists (e.g. supabase.auth.getUser())
const getCreateIdentity = async (): Promise<number> => {
    return 0
}
const ACTION_FAIL = new Error('Action Fail')

export const getAccessDetail = async ({
    search = '',
    pageParam = 0,
}: GetSearchParams): Promise<AccessDetail[]> => {
    const identity = await getCreateIdentity()
    const limit = limit_getDataFromDatabase
    const from = pageParam * limit
    const to = from + limit - 1

    const { data, error } = await supabase.rpc('access_detail_get', {
        p_search: (search || null) as string,
        p_from: from,
        p_to: to,
        p_create_identity: identity,
    })

    if (error) throw ACTION_FAIL
    return data as AccessDetail[]
}

export const getAccessDetailCb = async (): Promise<cbOption[]> => {
    const identity = await getCreateIdentity()

    const { data, error } = await supabase.rpc('access_detail_get_cb', {
        p_create_identity: identity
    })

    if (error) throw ACTION_FAIL
    return data as Pick<AccessDetail, 'id' | 'name'>[]
}