import React from "react";

const Sidebar = ({ isOpen, onClose, onLoginClick }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md z-40 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* 사이드바 상단 */}
      <div className="relative p-4 border-b">
        <h2 className="text-xl font-bold text-blue-600">서비스 이름</h2>

        {/* 사이드바 우측 상단 닫기 버튼 (☰ 모양) */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl bg-white rounded p-1 shadow"
        >
          ☰
        </button>
      </div>

      {/* 메뉴 항목 */}
      <ul className="p-4 space-y-4 text-sm">
        <li>홈</li>
        <li>검색</li>
        <li>최근</li>
        <li>내 지식</li>
        <li>❓ 도움말</li>
        <li>
          <button
            onClick={onLoginClick}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
          >
            로그인
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
