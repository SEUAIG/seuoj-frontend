import React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export default function UserTable() {
  return (
<Table className='w-full table-fixed'>
    <TableHeader>
        <TableRow>
            <TableHead className='w-8'>#</TableHead>
            <TableHead className='w-96'>用户名</TableHead>
            <TableHead>个性签名</TableHead>
            <TableHead className='w-32'>通过数量</TableHead>
            <TableHead className='w-16'>积分</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
    </TableBody>
</Table>
  )
}
