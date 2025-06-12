import { useContext } from "react";
import { SummaryContext } from "../contexts/SummaryContext";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";

export default function ResultPage() {
  const { summaryData } = useContext(SummaryContext);

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-blue-50 p-8 rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-bold text-blue-800 mb-4">요약 결과</h2>
        <p className="text-sm text-gray-600 mb-6">
          입력한 URL: <span className="underline">{summaryData.url}</span>
        </p>
        <div className="bg-white p-6 rounded-md border border-gray-300 whitespace-pre-wrap text-sm leading-relaxed text-gray-800 shadow-sm">
          {summaryData.summary || "요약 결과가 없습니다."}
        </div>
      </motion.div>
    </MainLayout>
  );
}

