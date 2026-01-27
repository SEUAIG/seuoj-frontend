import {useQuery} from "@tanstack/react-query"
import {search} from '@/services/search'
export function  useSearchQueryByKeyword(keyword:string){
    return useQuery({
        queryKey:["search",keyword],
        queryFn:()=>search(keyword),
        enabled:!!keyword,        
    })
}