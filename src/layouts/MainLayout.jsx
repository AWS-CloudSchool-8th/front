import { useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import { UserContext } from "../contexts/UserContext";
import LoginModal from "../components/LoginModal";
import { useLocation, useNavigate } from "react-router-dom";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { setUser } = useContext(UserContext);

  const location = useLocation(); // 현재 페이지 경로
  const navigate = useNavigate(); // 리다이렉트용

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    setUser(null);
    alert("로그아웃 되었습니다.");

    // 결과페이지에서만 홈으로 이동
    if (location.pathname === "/result") {
      navigate("/");
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex">
      {/* ☰ 버튼: 사이드바 닫혀 있을 때만 보여줌 */}
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-50 p-2 text-2xl bg-white rounded shadow-md"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
      )}

      {/* 사이드바 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLoginClick={() => setLoginOpen(true)}
        onLogout={handleLogout}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 p-10">{children}</div>

      {/* 로그인 모달 렌더링 */}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onLoginSuccess={(data) => {
            setUser(data.user); // Context에 저장
            setLoginOpen(false); // 모달 닫기
          }}
        />
      )}
    </div>
  );
}
