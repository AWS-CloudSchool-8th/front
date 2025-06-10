// src/components/Sidebar.jsx
import React, { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

const Sidebar = ({ isOpen, onClose, onLoginClick }) => {
  const { user } = useContext(UserContext); // ① Context에서 user 꺼내기

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md z-40 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* 사이드바 상단 */}
      <div className="relative p-4 border-b">
        <h2 className="text-xl font-bold text-blue-600">서비스 이름</h2>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl bg-white rounded p-1 shadow"
        >
          ☰
        </button>

        {/* ② 로그인 상태면 사용자 정보 */}
        {user && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">안녕하세요,</p>
            <p className="text-lg font-semibold">{user.username}님</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        )}
      </div>

      {/* 메뉴 항목 */}
      <ul className="p-4 space-y-4 text-sm">
        <li>홈</li>
        <li>검색</li>
        <li>최근</li>
        <li>내 지식</li>
        <li>❓ 도움말</li>

        {/* ③ 로그인 안 된 상태에서만 로그인 버튼 */}
        {!user && (
          <li>
            <button
              onClick={onLoginClick}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
            >
              로그인
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
