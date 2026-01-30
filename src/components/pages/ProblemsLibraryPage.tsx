import React from 'react'
import { Helmet } from 'react-helmet-async'
import SearchBox from '../common/SearchBox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { DialogClose, DialogDescription } from '@radix-ui/react-dialog'
import TagSelector from '../bussiness/TagSelector'
import SelectedTags from '../bussiness/SelectedTags'

export default function ProblemsLibraryPage() {
  return (
    <div className="container mx-auto px-4 py-2">
      <Helmet>
        <title>题库 - SeuOJ</title>
      </Helmet>
      <div className='flex-col flex'>
        <div className="flex ">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">选择题目标签</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>选择题目标签</DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
              <SelectedTags />
              <TagSelector />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">确认</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <SearchBox />
            </div>
          </div>
        </div>
        <SelectedTags/>
      </div>
    </div>
  );
}
