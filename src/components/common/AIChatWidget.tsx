import React from "react";
import AIChat from "./AIChat";
import Draggable from "react-draggable";

export default function AIChatWidget() {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <Draggable handle=".chat-handle" bounds="parent">
        <div className="pointer-events-auto absolute bottom-24 right-6">
          <AIChat />
        </div>
      </Draggable>
    </div>
  );
}
