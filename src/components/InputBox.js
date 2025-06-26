import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { AiOutlineFileText, AiOutlineClose } from "react-icons/ai";
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { colors } from "../styles/colors";
import { useNavigate } from 'react-router-dom';
import SmartVisualization from './SmartVisualization';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 18px;
  margin-bottom: 10px;
`;

const Box = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: ${colors.bgLight};
  border: 2px solid ${colors.primary};
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 ${colors.navyDark}44;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 8px;
  backdrop-filter: blur(2px);
  transition: border 0.2s, background 0.2s;
  overflow-x: auto;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.13rem;
  color: ${colors.text};
  outline: none;
  padding: 4px 0;
  &::placeholder {
    color: ${colors.gray};
    font-size: 1rem;
  }
`;

const ArrowButton = styled.button`
  background: #111;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${colors.white};
  box-shadow: 0 0 8px #222;
  cursor: pointer;
  transition: background 0.2s;
  margin-left: 6px;
  &:hover {
    background: #222;
  }
`;

const FileTag = styled.div`
  display: flex;
  align-items: center;
  background: ${colors.bgLight};
  border-radius: 20px;
  padding: 4px 12px 4px 8px;
  margin-right: 8px;
  font-size: 15px;
`;

const FileName = styled.span`
  margin: 0 6px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${colors.text};
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-size: 16px;
  color: ${colors.disabled};
  &:hover {
    color: ${colors.error};
  }
`;

const JobsContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin-top: 2rem;
`;

const JobCard = styled.div`
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.2);
`;

const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const JobStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: white;
`;

const JobUrl = styled.div`
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 0.5rem;
  word-break: break-all;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  overflow: hidden;
  margin: 0.5rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #eaffb7;
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

function extractYoutubeId(url) {
  const regExp = /(?:v=|youtu.be\/)([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

const InputBox = () => {
  const [inputValue, setInputValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [youtubeReporterJobs, setYoutubeReporterJobs] = useState([]);
  const navigate = useNavigate();

  // YouTube Reporter 작업 상태 확인 (로그인 상태에서만)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return; // 로그인하지 않은 경우 API 호출 안함

    const fetchYoutubeReporterJobs = async () => {
      try {
        const response = await axios.get('/youtube-reporter/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.jobs) {
          const jobsWithStatus = await Promise.all(
            response.data.jobs.slice(0, 3).map(async (job) => { // 최근 3개만
              if (job.status === 'processing') {
                try {
                  const statusResponse = await axios.get(`/youtube-reporter/jobs/${job.id}/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  return { ...job, ...statusResponse.data };
                } catch (e) {
                  return job;
                }
              }
              
              if (job.status === 'completed') {
                try {
                  const resultResponse = await axios.get(`/youtube-reporter/jobs/${job.id}/result`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  return { ...job, result: resultResponse.data };
                } catch (e) {
                  return job;
                }
              }
              
              return job;
            })
          );
          setYoutubeReporterJobs(jobsWithStatus);
        }
      } catch (error) {
        console.error('YouTube Reporter 작업 확인 실패:', error);
      }
    };

    fetchYoutubeReporterJobs();
    const interval = setInterval(fetchYoutubeReporterJobs, 5000); // 5초마다 확인
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (input) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let response;
      if (input instanceof File) {
        const formData = new FormData();
        formData.append('file', input);
        response = await axios.post('/analysis/document', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (/^https?:\/\//.test(input)) {
        if (/(youtube\.com|youtu\.be)/.test(input)) {
          // YouTube Reporter 사용
          response = await axios.post('/youtube-reporter/analyze', { 
            youtube_url: input,
            include_audio: true 
          });
          // 새 작업 시작 후 상태 업데이트
          setTimeout(() => {
            const fetchJobs = async () => {
              try {
                const jobsResponse = await axios.get('/youtube-reporter/jobs');
                if (jobsResponse.data && jobsResponse.data.jobs) {
                  setYoutubeReporterJobs(jobsResponse.data.jobs.slice(0, 3));
                }
              } catch (e) {
                console.error('작업 상태 업데이트 실패:', e);
              }
            };
            fetchJobs();
          }, 1000);
        } else {
          response = await axios.post('/youtube/search', { query: input });
        }
      } else {
        response = await axios.post('/youtube/search', { query: input });
      }
      setResult(response.data);
      
      // YouTube 분석 결과가 있으면 에디터로 이동
      if (response.data.analysis_results?.fsm_analysis?.final_output) {
        const analysisData = response.data.analysis_results.fsm_analysis;
        navigate('/editor', { 
          state: { 
            analysisData: analysisData
          } 
        });
      }
    } catch (err) {
      setError(err.message || '에러 발생');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles([...files, ...droppedFiles]);
    }
  };

  const handleInput = async () => {
    if (files.length > 0) {
      for (const file of files) {
        await handleSubmit(file);
      }
      setFiles([]);
    } else if (inputValue.trim()) {
      if (/(youtube\.com|youtu\.be)/.test(inputValue.trim())) {
        await handleSubmit(inputValue.trim());
      } else {
        navigate(`/youtube-search?query=${encodeURIComponent(inputValue.trim())}`);
      }
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <FaSpinner className="animate-spin" color="#eaffb7" />;
      case 'completed':
        return <FaCheckCircle color="#10b981" />;
      case 'failed':
        return <FaExclamationTriangle color="#ef4444" />;
      default:
        return <FaSpinner color="#6b7280" />;
    }
  };

  const getStatusText = (status, message, progress) => {
    if (status === 'processing') {
      return message || `분석 중... ${progress || 0}%`;
    }
    if (status === 'completed') {
      return '분석 완료';
    }
    if (status === 'failed') {
      return '분석 실패';
    }
    return '대기 중';
  };

  const renderReportContent = (result) => {
    if (!result || !result.sections) return null;

    return (
      <div style={{ marginTop: '1rem' }}>
        {result.title && (
          <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>{result.title}</h3>
        )}
        
        {result.summary && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#eaffb7', marginBottom: '0.5rem', fontSize: '1rem' }}>📋 요약</h4>
            <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', fontSize: '0.9rem' }}>{result.summary}</p>
          </div>
        )}

        {result.sections.slice(0, 2).map((section, index) => ( // 처음 2개 섹션만 표시
          <div key={index} style={{ marginBottom: '1rem' }}>
            {section.type === 'text' ? (
              <>
                <h4 style={{ color: '#eaffb7', marginBottom: '0.5rem', fontSize: '1rem' }}>{section.title}</h4>
                <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', fontSize: '0.9rem' }}>
                  {section.content.length > 200 ? section.content.substring(0, 200) + '...' : section.content}
                </p>
              </>
            ) : section.type === 'visualization' ? (
              <SmartVisualization section={section} />
            ) : null}
          </div>
        ))}

        {result.sections.length > 2 && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              onClick={() => navigate('/reports')}
              style={{
                background: '#eaffb7',
                color: '#7e7e00',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              전체 리포트 보기
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Container>
      <Box
        isDragOver={isDragOver}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={e => { e.preventDefault(); setIsDragOver(false); }}
        onDrop={handleDrop}
        style={{ overflowX: 'auto' }}
      >
        {files.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 8 }}>
            {files.map((file, idx) => (
              <FileTag key={idx}>
                <AiOutlineFileText />
                <FileName title={file.name}>{file.name}</FileName>
                <RemoveBtn onClick={() => removeFile(idx)}>
                  <AiOutlineClose />
                </RemoveBtn>
              </FileTag>
            ))}
          </div>
        )}
        <Input
          placeholder="텍스트, 파일, 또는 URL 입력"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleInput(); }}
        />
        <input
          type="file"
          style={{ display: 'none' }}
          id="file-upload"
          multiple
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <ArrowButton as="span" title="파일 첨부">📎</ArrowButton>
        </label>
        <ArrowButton onClick={handleInput} title="전송">→</ArrowButton>
      </Box>
      {loading && <div style={{ color: 'white', marginTop: '1rem' }}>요청을 처리 중입니다...</div>}
      {error && <div style={{ color: colors.error, marginTop: '1rem' }}>{error}</div>}
      
      {/* YouTube Reporter 작업 상태 표시 */}
      {youtubeReporterJobs.length > 0 && (
        <JobsContainer>
          <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>🎬 YouTube Reporter</h3>
          {youtubeReporterJobs.map((job) => (
            <JobCard key={job.id}>
              <JobHeader>
                <JobStatus>
                  {getStatusIcon(job.status)}
                  {getStatusText(job.status, job.message, job.progress)}
                </JobStatus>
              </JobHeader>

              <JobUrl>{job.youtube_url}</JobUrl>

              {job.status === 'processing' && (
                <ProgressBar>
                  <ProgressFill progress={job.progress || 0} />
                </ProgressBar>
              )}

              {job.status === 'completed' && job.result && renderReportContent(job.result)}
              
              {job.status === 'failed' && (
                <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>
                  분석에 실패했습니다. 다시 시도해주세요.
                </div>
              )}
            </JobCard>
          ))}
        </JobsContainer>
      )}
      
      {result && !/(youtube\.com|youtu\.be)/.test(inputValue) && (
        <div style={{ color: colors.primary, textAlign: 'left', marginTop: 20 }}>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </Container>
  );
};

export default InputBox; 