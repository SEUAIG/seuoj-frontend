import React from 'react'

export default function Slogan() {
  return (
    <div className="flex-none h-8 flex items-center justify-center text-muted-foreground text-sm bg-gray-50">
      SEUOJ Powered By{" "}
      <a href="https://ippclub.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors ml-1">
        I++ Club
      </a>
    </div>
  );
}
