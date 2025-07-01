import React, { useState } from 'react';
import axios from 'axios';
import { AiOutlineFileText, AiOutlineClose } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';
import styles from './InputBox.module.css';

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
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const pollJobStatus = async (jobId) => {
    try {
      const response = await axios.get(
        `/youtube/jobs/${jobId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      if (response.data.status === 'completed') {
        const resultResponse = await axios.get(
          `/youtube/jobs/${jobId}/result`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (resultResponse.data.content) {
          navigate('/editor', {
            state: {
              analysisData: resultResponse.data.content.report
            }
          });
        }
        return true;
      } else if (response.data.status === 'failed') {
        setError('¿ä¾à¿¡ ½ÇÆĞÇß½À´Ï´Ù.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('»óÅÂ È®ÀÎ ½ÇÆĞ:', err);
      return false;
    }
  };


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
          response = await axios.post(
            '/youtube/analysis',
            { youtube_url: input },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            }
          );
                    
          // YouTube ë¶„ì„??ê²½ìš° ë¹„ë™ê¸?ì²˜ë¦¬
          if (response.data.job_id) {
            const jobId = response.data.job_id;
            
            // 2ì´ˆë§ˆ???íƒœ ?•ì¸
            const pollInterval = setInterval(async () => {
              const isCompleted = await pollJobStatus(jobId);
              if (isCompleted) {
                clearInterval(pollInterval);
                setLoading(false);
              }
            }, 2000);
            
            // 5ë¶????€?„ì•„??            
            setTimeout(() => {
              clearInterval(pollInterval);
              setLoading(false);
              setError('ë¶„ì„ ?œê°„??ì´ˆê³¼?˜ì—ˆ?µë‹ˆ?? ?˜ì¤‘???¤ì‹œ ?œë„?´ì£¼?¸ìš”.');
            }, 300000);
            
            return; // ?¬ê¸°???¨ìˆ˜ ì¢…ë£Œ (?´ë§??ê³„ì†??
          }
        } else {
          response = await axios.post('/youtube/search', { query: input });
        }
      } else {
        response = await axios.post('/youtube/search', { query: input });
      }
      
      setResult(response.data);
      
      // YouTube ë¶„ì„ ê²°ê³¼ê°€ ?ˆìœ¼ë©??ë””?°ë¡œ ?´ë™ (ê¸°ì¡´ ?™ê¸° ì²˜ë¦¬??
      if (response.data.analysis_results?.fsm_analysis?.final_output) {
        const analysisData = response.data.analysis_results.fsm_analysis;
        navigate('/editor', { 
          state: { 
            analysisData: analysisData
          } 
        });
      }
    } catch (err) {
      setError(err.message || '?ëŸ¬ ë°œìƒ');
    } finally {
      // YouTube ë¶„ì„???„ë‹Œ ê²½ìš°?ë§Œ ë¡œë”© ?´ì œ
      if (!/(youtube\.com|youtu\.be)/.test(input)) {
        setLoading(false);
      }
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

  return (
    <div className={styles.container}>
      <div
        className={styles.box}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={e => { e.preventDefault(); setIsDragOver(false); }}
        onDrop={handleDrop}
      >
        {files.length > 0 && (
          <div className={styles.filesContainer}>
            {files.map((file, idx) => (
              <div key={idx} className={styles.fileTag}>
                <AiOutlineFileText />
                <span className={styles.fileName} title={file.name}>{file.name}</span>
                <button className={styles.removeBtn} onClick={() => removeFile(idx)}>
                  <AiOutlineClose />
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          className={styles.input}
          placeholder="?ìŠ¤?? ?Œì¼, ?ëŠ” URL ?…ë ¥"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleInput(); }}
        />
        <input
          type="file"
          className={styles.fileInput}
          id="file-upload"
          multiple
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className={styles.fileLabel}>
          <span className={styles.arrowButton} title="?Œì¼ ì²¨ë?">?“</span>
        </label>
        <button
          className={styles.arrowButton}
          onClick={handleInput}
          title="Àü¼Û"
        >
          Àü¼Û
        </button>

      </div>
      {loading && <div className={styles.loading}>YouTube ?ìƒ??ë¶„ì„ ì¤‘ì…?ˆë‹¤... (2-5ë¶??Œìš”)</div>}
      {error && <div className={styles.error}>{error}</div>}
      {result && (
        <div className={styles.result}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default InputBox;