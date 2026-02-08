import useDebounced from '@/hooks/useDebounced'
import { useSearchQueryByKeyword } from '@/hooks/useSearchQueryByKeyword'
import React, { useState } from 'react'
import SearchInput from './SearchInput'
import SearchResultList from './SearchResultList'

export default function SearchBox() {
    const [keyword,setKeyword] = useState('')
    const debounced = useDebounced(keyword,300)
    const {data} = useSearchQueryByKeyword("1", "10", debounced, null)

  return (
    <div className='space-y-2 w-64 relative'>
        <SearchInput value={keyword} onChange={setKeyword} placeholder='搜索题号或名称'/>
        {keyword&&<SearchResultList data={data?.records ?? []}/>}
    </div>
  )
}
