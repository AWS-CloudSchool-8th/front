import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function SignupModal({ onClose, onLoginClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const isPasswordMatch = password && confirmPassword && password === confirmPassword;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendVerification = () => {
    if (!isValidEmail) {
      alert('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    // TODO: AWS Cognito signup 호출
    setShowModal(true);
    setCodeSent(true);
  };

  const handleSignupConfirm = () => {
    if (!authCode) {
      alert('인증 코드를 입력해주세요.');
      return;
    }

    // TODO: AWS Cognito confirmSignUp 호출
    alert('회원가입 완료!');
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
          {/* 닫기 버튼 */}
          <button
            className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black"
            onClick={onClose}
          >
            ×
          </button>

          <h2 className="text-2xl font-bold text-center mb-6">회원가입</h2>

          {/* 이메일 */}
          <input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded mb-2"
          />
          {!isValidEmail && email && (
            <div className="text-red-500 text-sm mb-2">올바른 이메일 주소가 아닙니다.</div>
          )}

          {/* 비밀번호 */}
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded mb-2"
          />

          {/* 비밀번호 확인 */}
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded mb-2"
          />
          {confirmPassword && (
            <div className={`text-sm mb-2 ${isPasswordMatch ? 'text-green-600' : 'text-red-500'}`}>
              {isPasswordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
            </div>
          )}

          {/* 인증 전: 인증 이메일 보내기 */}
          {!codeSent && (
            <button
              className="w-full bg-indigo-600 text-white font-semibold py-2 rounded mb-4 hover:bg-indigo-700"
              onClick={handleSendVerification}
              disabled={!isPasswordMatch || !isValidEmail}
            >
              인증 이메일 보내기
            </button>
          )}

          {/* 인증 후: 코드 입력 & 확인 */}
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

          {/* SNS 로그인 */}
          {!codeSent && (
            <>
              <div className="text-center text-sm text-gray-500 my-4">또는 SNS로 회원가입</div>
              <div className="grid grid-cols-1 gap-3 mb-4">
                {/* Google */}
                <button
                  onClick={() => alert('구글 회원가입')}
                  className="flex items-center justify-center border rounded py-2 hover:bg-gray-50"
                >
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                    alt="Google"
                    className="w-5 h-5 mr-2 object-contain"
                  />
                  Google 계정으로 가입
                </button>

                {/* Apple */}
                <button
                  onClick={() => alert('애플 회원가입')}
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
            이미 계정이 있으신가요?{' '}
            <button onClick={onLoginClick} className="text-indigo-500 hover:underline">
              로그인
            </button>
          </div>
        </motion.div>
      </div>

      {/* 이메일 인증 안내 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg text-center">
            <p className="mb-2 font-semibold">이메일 인증만 하면 가입이 완료됩니다.</p>
            <p className="text-sm text-gray-600 mb-4">
              인증 이메일이 <span className="font-medium">{email}</span> 에 발송되었어요.
              <br />
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
