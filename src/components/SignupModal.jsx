import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const API_BASE_URL = "http://43.201.55.116:8000"; // 실제 FastAPI 서버 주소

export default function SignupModal({ onClose, onLoginClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const isPasswordMatch =
    password && confirmPassword && password === confirmPassword;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendVerification = async () => {
    if (!isValidEmail) {
      alert("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    if (!isPasswordMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, {
        email: email,
        password: password,
        password_confirm: confirmPassword,
      });

      setShowModal(true);
      setCodeSent(true);
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((d) => `${d.loc?.join(".")}: ${d.msg}`)
          .join("\n");
        alert(`회원가입 실패:\n${messages}`);
      } else {
        alert(`회원가입 실패: ${detail || error.message}`);
      }
    }
  };

  const handleSignupConfirm = async () => {
    if (!authCode) {
      alert("인증 코드를 입력해주세요.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/confirm`, {
        email: email,
        code: authCode,
      });

      alert("회원가입 완료! 로그인 후 사용해주세요.");
      setShowModal(false);
      onClose();
    } catch (error) {
      const detail = error.response?.data?.detail;
      alert(`인증 실패: ${detail || error.message}`);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white p-8 rounded-xl shadow-lg w-96 relative"
        >
          <button
            className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black"
            onClick={onClose}
          >
            ×
          </button>

          <h2 className="text-2xl font-bold text-center mb-6">회원가입</h2>

          <input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded mb-2"
          />
          {!isValidEmail && email && (
            <div className="text-red-500 text-sm mb-2">
              올바른 이메일 주소가 아닙니다.
            </div>
          )}

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded mb-2"
          />

          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded mb-2"
          />
          {confirmPassword && (
            <div
              className={`text-sm mb-2 ${
                isPasswordMatch ? "text-green-600" : "text-red-500"
              }`}
            >
              {isPasswordMatch
                ? "비밀번호가 일치합니다."
                : "비밀번호가 일치하지 않습니다."}
            </div>
          )}

          {!codeSent && (
            <button
              className="w-full bg-indigo-600 text-white font-semibold py-2 rounded mb-4 hover:bg-indigo-700"
              onClick={handleSendVerification}
              disabled={!isPasswordMatch || !isValidEmail}
            >
              인증 이메일 보내기
            </button>
          )}

          {codeSent && (
            <>
              <input
                type="text"
                placeholder="인증 코드 입력"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded mb-2"
              />
              <button
                className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700"
                onClick={handleSignupConfirm}
              >
                확인
              </button>
            </>
          )}

          {!codeSent && (
            <>
              <div className="text-center text-sm text-gray-500 my-4">
                또는 SNS로 회원가입
              </div>
              <div className="grid grid-cols-1 gap-3 mb-4">
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
                  Google 계정으로 가입
                </button>

                <button
                  onClick={() => alert("애플 회원가입")}
                  className="flex items-center justify-center border rounded py-2 hover:bg-gray-50"
                >
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg"
                    alt="Apple"
                    className="w-5 h-5 mr-2 object-contain"
                  />
                  Apple 계정으로 가입
                </button>
              </div>
            </>
          )}

          <div className="mt-4 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <button
              onClick={onLoginClick}
              className="text-indigo-500 hover:underline"
            >
              로그인
            </button>
          </div>
        </motion.div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[28rem] shadow-lg text-center">
            <p className="mb-2 font-semibold">
              이메일 인증만 하면 가입이 완료됩니다.
            </p>
            <p className="text-sm text-gray-600 mb-1">
              인증 이메일이 <span className="font-medium">{email}</span> 에
              발송되었어요.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              이메일을 인증한 후 다시 로그인하면 사용하실 수 있어요!
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-yellow-300 hover:bg-yellow-400 text-black font-semibold py-2 px-4 rounded w-full"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
