import { useState } from "react";

export default function ChatSidebar({ isOpen, onClose, summary }) {
  const [messages, setMessages] = useState([
    { role: "system", content: "요약 결과에 대해 궁금한 점을 물어보세요!" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // ������ 여기서 실제 챗봇 응답 API 호출하면 됨
    const botResponse = {
      role: "assistant",
      content: `요약에 기반한 임시 응답입니다: ${input}`,
    };

    setMessages((prev) => [...prev, botResponse]);
    setInput("");
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-100">
        <h2 className="text-lg font-bold">챗봇</h2>
        <button onClick={onClose} className="text-2xl font-bold text-gray-500">
          ×
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md whitespace-pre-wrap text-sm ${
              msg.role === "user"
                ? "bg-blue-100 self-end text-right"
                : "bg-gray-100 self-start text-left"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* 입력창 */}
      <div className="p-4 border-t flex gap-2 bg-white">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm"
          value={input}
          placeholder="질문을 입력하세요..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          전송
        </button>
      </div>
    </div>
  );
}

