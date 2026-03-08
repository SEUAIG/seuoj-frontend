import React from 'react'

export default function ModalWindow({isOpen,onClose,children}) {
    if(!isOpen)
    {
        return null;
    }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-[420px] p-6">
        {children}
      </div>
    </div>
  );
}
