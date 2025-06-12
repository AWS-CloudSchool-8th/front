import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Link, Element } from "react-scroll";
import Sidebar from "../components/Sidebar";
import LoginModal from "../components/LoginModal";
import SignupModal from "../components/SignupModal";
import { UserContext } from "../contexts/UserContext";
import { jwtDecode } from "jwt-decode";
import { SummaryContext } from "../contexts/SummaryContext";
import { useNavigate } from "react-router-dom";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [url, setUrl] = useState("");
  const { user, setUser } = useContext(UserContext);
  const { setSummaryData } = useContext(SummaryContext);
  const navigate = useNavigate();
  const [loginWarning, setLoginWarning] = useState(false);
  const isValidURL = (input) => {
    try {
      const url = new URL(input);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("id_token"); // ✅ id_token 사용

    if (token && !user) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded["cognito:username"],
          email: decoded.email,
        });
      } catch (err) {
        console.error("토큰 디코딩 실패:", err);
        localStorage.removeItem("access_token"); // 에러 시 토큰 제거
        localStorage.removeItem("id_token");
      }
    }
  }, [setUser, user]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    setUser(null);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLoginClick={() => setLoginOpen(true)}
        onLogout={handleLogout}
      />
      {/* 토글 버튼 */}
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-50 p-2 text-2xl bg-white rounded shadow-md"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
      )}
      {/* 메인 콘텐츠 */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Hero 섹션 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative flex flex-col items-center justify-center h-screen px-4 text-center"
        >
          <h1 className="text-xl font-medium mb-4 text-gray-800">
            쉽고 빠르게, 요약 시작하기
          </h1>

          {/* 입력 카드 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center w-full"
          >
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">
              <textarea
                rows={2}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={`https://www.example.com\n- 링크를 넣어주세요!`}
                className="w-full h-20 text-sm text-gray-600 placeholder-gray-300 bg-transparent resize-none focus:outline-none"
              />

              {/* 아이콘 */}
              <div className="absolute bottom-4 left-4 flex space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m2 6H7a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l.707-.707a1 1 0 011.414 0l.707.707A1 1 0 0013.414 5H16a2 2 0 012 2v9a2 2 0 01-2 2z"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 1v4m0 14v4m8-12a8 8 0 01-16 0M4 10a8 8 0 0116 0"
                  />
                </svg>
              </div>

              {/* 요약하기 버튼 */}
              <button
                className="absolute bottom-3 right-4 flex items-center space-x-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-full"
                onClick={async () => {
                  if (!user) {
                    setLoginWarning(true);
                    setLoginOpen(true);
                    return;
                  }

                  if (!url.trim()) return alert("URL을 입력해주세요");
                  if (!isValidURL(url.trim()))
                    return alert("올바른 URL 형식이 아닙니다.");

                  try {
                    const fakeResponse = await new Promise((resolve) =>
                      setTimeout(() => {
                        resolve({
                          data: {
                            summary: `요약 결과입니다!\n\n입력하신 링크: ${url}\n이건 백엔드 없이 테스트하는 중입니다.`,
                          },
                        });
                      }, 1000)
                    );

                    setSummaryData({ url, summary: fakeResponse.data.summary });
                    navigate("/result");
                  } catch (err) {
                    console.error(err);
                    alert("요약 실패");
                  }
                }}
              >
                <span>요약하기</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* ↓ 화살표 */}
          <Link to="summary-section" smooth={true} duration={500}>
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
              whileHover={{ scale: 1.1 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </Link>
        </motion.section>

        {/* 요약 섹션 */}
        <Element name="summary-section">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="py-24 px-6 flex flex-col items-center gap-6"
          >
            <h2 className="text-purple-500 font-semibold text-sm">요약</h2>
            <p className="text-lg text-center font-medium">
              한 눈에 파악하기 어려운 영상은
              <br /> 텍스트 요약으로 빠르게 파악해보세요
            </p>
            <div className="w-[320px] h-[180px] bg-gray-300 rounded-xl shadow-xl" />
          </motion.section>
        </Element>

        {/* 마인드맵 섹션 */}
        <Element name="mindmap-section">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="py-24 px-6 flex flex-col items-center gap-6"
          >
            <h2 className="text-indigo-500 font-semibold text-sm">마인드맵</h2>
            <p className="text-lg text-center font-medium">
              중요 포인트만 연결해 보여주는
              <br /> 마인드맵 기능
            </p>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-16 h-6 bg-gray-300 rounded" />
              ))}
            </div>
          </motion.section>
        </Element>
      </div>
      {/* 로그인 모달 */}
      {loginOpen && (
        <LoginModal
          warningMessage={
            loginWarning ? "서비스 이용하려면 로그인해주세요." : ""
          }
          onClose={() => {
            setLoginOpen(false);
            setLoginWarning(false); // 모달 닫을 때 경고도 초기화
          }}
          onSignupClick={() => {
            setLoginOpen(false);
            setSignupOpen(true);
            setLoginWarning(false);
          }}
          onLoginSuccess={({ accessToken, idToken, user }) => {
            localStorage.setItem("id_token", idToken);
            localStorage.setItem("access_token", accessToken);
            setUser(user);
            setLoginOpen(false);
            setLoginWarning(false);
          }}
        />
      )}
      {/* 회원가입 모달 */}
      {signupOpen && (
        <SignupModal
          onClose={() => setSignupOpen(false)}
          onLoginClick={() => {
            setSignupOpen(false);
            setLoginOpen(true);
          }}
        />
      )}
    </div>
  );
}

export default App;

