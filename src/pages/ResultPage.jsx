import { useContext } from "react";
import { SummaryContext } from "../contexts/SummaryContext";

export default function ResultPage() {
  const { summaryData } = useContext(SummaryContext);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">요약 결과</h2>
      <p className="text-sm text-gray-500 mb-3">입력한 URL: {summaryData.url}</p>
      <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap text-sm">
        {summaryData.summary || "요약 결과가 없습니다."}
      </div>
    </div>
  );
}

