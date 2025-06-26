import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createGlobalStyle } from 'styled-components';
import axios from "axios";
import YoutubeSearchPage from './components/YoutubeSearchPage';
import FixedNotionEditor from './components/FixedNotionEditor';
import Dashboard from './components/Dashboard';
import AnalysisStatus from './components/AnalysisStatus';
import ReportsPage from './components/ReportsPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// API 베이스 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
axios.defaults.baseURL = API_BASE_URL;

console.log('API BASE URL:', API_BASE_URL);

// Axios 인터셉터: 요청 시 access_token 자동 추가
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios 인터셉터: 에러 처리 및 토큰 갱신
axios.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // 리프레시 토큰으로 재시도
      const refreshToken = localStorage.getItem('refresh_token');
      const email = localStorage.getItem('user_email');
      
      if (refreshToken && email) {
        try {
          const response = await axios.post('/auth/refresh', {
            refresh_token: refreshToken,
            email: email
          });
          
          const newAccessToken = response.data.access_token;
          localStorage.setItem('access_token', newAccessToken);
          
          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // 리프레시 실패 시 로그아웃
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_email');
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        }
      } else {
        alert('로그인이 필요합니다.');
      }
    }
    
    return Promise.reject(err);
  }
);

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

// PrivateRoute 컴포넌트
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('로그인이 필요합니다.');
    return <Navigate to="/" replace />; // 또는 로그인 모달/페이지로 이동
  }
  return children;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
// <React.StrictMode>
  <>
    <GlobalStyle />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/youtube-search" element={<PrivateRoute><YoutubeSearchPage /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
        <Route path="/editor" element={<PrivateRoute><FixedNotionEditor /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/analysis/:jobId" element={<PrivateRoute><AnalysisStatus /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  </>
//  </React.StrictMode>
);