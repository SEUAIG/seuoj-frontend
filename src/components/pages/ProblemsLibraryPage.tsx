import React from 'react'
import { Helmet } from 'react-helmet-async'
import SearchBox from '../common/SearchBox'

export default function ProblemsLibraryPage() {
  return (
    <div className="container mx-auto px-4 py-2">
      <Helmet>
        <title>题库 - SeuOJ</title>
      </Helmet>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
            <SearchBox/>
        </div>
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground bg-muted/10">
            题目列表区域
        </div>
      </div>
    </div>
  )
}
