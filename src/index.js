import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createGlobalStyle } from 'styled-components';
import axios from "axios";
import { BrowserRouter } from 'react-router-dom';

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;

console.log('API BASE URL:', process.env.REACT_APP_API_BASE_URL);

// Axios 인터셉터: 요청 시 access_token 자동 추가
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios 인터셉터: 401 응답 시 로그인 모달 유도 (예시)
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      alert('로그인이 필요합니다.');
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <GlobalStyle />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </>
);