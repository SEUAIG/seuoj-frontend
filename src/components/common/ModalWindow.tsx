import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
interface ModalWindowProps{
    isOpen:boolean;
    onClose:()=>void;
    children:React.ReactNode;
}
export default function ModalWindow({isOpen,onClose,children}:ModalWindowProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      {children}
    </DialogContent>
  </Dialog>
  )
}
