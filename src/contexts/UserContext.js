import React, { createContext, useState } from "react";

// Context 생성
export const UserContext = createContext();

// Context Provider 컴포넌트
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 사용자 상태 초기화

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
