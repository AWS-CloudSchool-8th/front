import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = "http://43.201.55.116:8000"; // FastAPI 서버 주소

export default function LoginModal({ onClose, onSignupClick, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    if (!isValidEmail || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      // access, id 토큰 둘 다 꺼내기
      const { access_token: accessToken, id_token: idToken } = response.data;

      if (!accessToken || !idToken) {
        alert("로그인 실패: 토큰이 없습니다.");
        return;
      }

      // idToken 디코딩해서 사용자 정보 추출
      const decoded = jwtDecode(idToken);
      const user = {
        username: decoded["cognito:username"],
        email: decoded.email,
      };

      // 1) 로컬 스토리지에 저장 (선택)
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("id_token", idToken);

      // 2) 부모 콜백 호출 → Context에 setUser, 모달 닫기 등 처리
      onLoginSuccess({ accessToken, idToken, user });
    } catch (error) {
      const detail = error.response?.data?.detail;
      alert(`로그인 실패: ${detail || error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white p-8 rounded-xl shadow-lg w-96 relative"
      >
        {/* 닫기 버튼 */}
        <button
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">로그인</h2>

        <input
          type="email"
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded mb-4"
        />

        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-2.5 right-3 text-sm text-gray-500 cursor-pointer"
          >
            {showPassword ? "숨기기" : "보기"}
          </span>
        </div>

        <button
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded mb-6 hover:bg-blue-700"
          onClick={handleLogin}
        >
          로그인
        </button>

        <div className="text-center text-sm text-gray-500 mb-4">
          또는 SNS로 로그인
        </div>
        <div className="grid grid-cols-1 gap-3">
          {/* Google */}
          <button
            onClick={() =>
              (window.location.href = `${API_BASE_URL}/auth/google/login`)
            }
            className="flex items-center justify-center border rounded py-2 hover:bg-gray-50"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google"
              className="w-5 h-5 mr-2 object-contain"
            />
            Google 계정으로 로그인
          </button>

          {/* Apple */}
          <button
            onClick={() => alert("애플 로그인")}
            className="flex items-center justify-center border rounded py-2 hover:bg-gray-50"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg"
              alt="Apple"
              className="w-5 h-5 mr-2 object-contain"
            />
            Apple 계정으로 로그인
          </button>
        </div>

        <div className="mt-6 text-center">
          <span>계정이 없으신가요? </span>
          <button
            onClick={onSignupClick}
            className="text-indigo-500 hover:underline"
          >
            회원가입
          </button>
        </div>
      </motion.div>
    </div>
  );
}
