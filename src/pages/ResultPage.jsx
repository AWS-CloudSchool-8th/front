import { useContext, useState } from "react";
import { SummaryContext } from "../contexts/SummaryContext";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";
import ChatSidebar from "../components/ChatSidebar";

export default function ResultPage() {
  const { summaryData } = useContext(SummaryContext);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 버튼 컴포넌트 묶기
  const rightButtons = (
    <>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        내보내기
      </button>
      <button
        onClick={() => setIsChatOpen((prev) => !prev)}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        채팅
      </button>
    </>
  );

  return (
    <MainLayout rightButtons={rightButtons}>
      {/* 요약 카드 */}
      <div className="max-w-4xl mx-auto mt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-blue-50 p-8 rounded-2xl shadow-md"
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-4">요약 결과</h2>
          <p className="text-sm text-gray-600 mb-6">
            입력한 URL: <span className="underline">{summaryData.url}</span>
          </p>
          <div className="bg-white p-6 rounded-md border border-gray-300 whitespace-pre-wrap text-sm leading-relaxed text-gray-800 shadow-sm">
            {summaryData.summary || "요약 결과가 없습니다."}
          </div>
        </motion.div>
      </div>

      {/* 채팅 사이드바 */}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        summary={summaryData.summary}
      />
    </MainLayout>
  );
}

