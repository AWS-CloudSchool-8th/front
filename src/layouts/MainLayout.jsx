import { useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import { UserContext } from "../contexts/UserContext";
import LoginModal from "../components/LoginModal";
import { useLocation, useNavigate } from "react-router-dom";

export default function MainLayout({ children, rightButtons }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { setUser } = useContext(UserContext);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    setUser(null);
    alert("로그아웃 되었습니다.");

    if (location.pathname === "/result") {
      navigate("/");
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex">
      {/* ☰ 버튼 */}
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-50 p-2 text-2xl bg-white rounded shadow-md"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
      )}

      {/* ✅ 상단 헤더 우측 버튼 (페이지별로 조건부 삽입) */}
      {rightButtons && (
        <div className="absolute top-4 left-1/2 z-40 w-full max-w-4xl -translate-x-1/2 px-4 flex justify-end gap-2">
          {rightButtons}
        </div>
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

      {/* 로그인 모달 */}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onLoginSuccess={(data) => {
            setUser(data.user);
            setLoginOpen(false);
          }}
        />
      )}
    </div>
  );
}

