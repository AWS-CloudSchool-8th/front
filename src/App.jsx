import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SummaryProvider } from "./contexts/SummaryContext";
import MainPage from "./pages/MainPage";       // 기존 App → MainPage로 이동
import ResultPage from "./pages/ResultPage";   // 새로 생성

function App() {
  return (
    <SummaryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </Router>
    </SummaryProvider>
  );
}

export default App;
