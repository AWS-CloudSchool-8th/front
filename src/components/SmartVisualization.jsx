// frontend/src/components/SmartVisualization.jsx - Timeline 문제 해결
import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar, Scatter } from 'react-chartjs-2';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, DataSet } from 'vis-network/standalone';
import * as d3 from 'd3';
import './SmartVisualization.css';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SmartVisualization = ({ section }) => {
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const networkRef = useRef(null);
  const flowRef = useRef(null);
  const d3Ref = useRef(null);
  const [networkInstance, setNetworkInstance] = useState(null);

  // 컴포넌트 마운트 및 데이터 변경 시 렌더링
  useEffect(() => {
    // 디버깅을 위한 상세 로그
    console.log('=== SmartVisualization Debug ===');
    console.log('섹션 데이터:', section);
    console.log('시각화 타입:', section.data?.type);
    console.log('시각화 서브타입:', section.data?.visualization_type);
    console.log('전체 데이터:', section.data?.data);

    // 시각화 타입에 따라 적절한 렌더링 함수 호출
    if (section.data?.type === 'network' && networkRef.current) {
      console.log('네트워크 렌더링 시도');
      renderNetwork();
    } else if (section.data?.type === 'flow' && flowRef.current) {
      console.log('플로우 렌더링 시도');
    } else if (section.data?.type === 'd3' && d3Ref.current) {
      console.log('D3 렌더링 시도 - 타입:', section.data?.visualization_type);
      renderD3Visualization();
    } else if (section.data?.type === 'diagram') {
      console.log('다이어그램을 네트워크로 변환하여 렌더링 시도');
      section.data.type = 'network';
      if (networkRef.current) {
        renderNetwork();
      }
    }

    return () => {
      if (networkInstance) {
        networkInstance.destroy();
        setNetworkInstance(null);
      }
    };
  }, [section.data]);

  // vis.js Network 렌더링
  const renderNetwork = () => {
    if (!networkRef.current) {
      console.error('네트워크 렌더링을 위한 ref가 없습니다');
      return;
    }

    try {
      setError(null);

      if (networkInstance) {
        networkInstance.destroy();
      }

      let networkData = section.data?.data;

      if (!networkData || section.data?.type === 'diagram') {
        if (section.data?.code) {
          console.log('다이어그램 코드를 네트워크 데이터로 변환');
        }

        networkData = {
          nodes: [
            { id: 1, label: '노드 1', color: '#667eea' },
            { id: 2, label: '노드 2', color: '#f093fb' },
            { id: 3, label: '노드 3', color: '#4facfe' }
          ],
          edges: [
            { from: 1, to: 2, label: '연결 1-2' },
            { from: 2, to: 3, label: '연결 2-3' }
          ]
        };
      }

      console.log('네트워크 데이터:', networkData);

      const container = networkRef.current;
      const data = {
        nodes: new DataSet(networkData.nodes || []),
        edges: new DataSet(networkData.edges || [])
      };

      const options = section.data.options || {
        layout: {
          hierarchical: {
            enabled: true,
            direction: 'LR',
            sortMethod: 'directed'
          }
        },
        physics: {
          enabled: true,
          hierarchicalRepulsion: {
            centralGravity: 0.0,
            springLength: 100,
            springConstant: 0.01,
            nodeDistance: 120
          }
        },
        nodes: {
          shape: 'box',
          margin: 10,
          font: {
            size: 14
          }
        },
        edges: {
          arrows: 'to',
          smooth: true
        }
      };

      const network = new Network(container, data, options);
      setNetworkInstance(network);

      console.log('✅ Network 다이어그램 렌더링 성공');

    } catch (err) {
      console.error('❌ Network 렌더링 오류:', err);
      setError(`네트워크 다이어그램 렌더링 실패: ${err.message}`);
    }
  };

  // D3.js 시각화 렌더링 (수정된 버전)
  const renderD3Visualization = () => {
    if (!section.data?.data || !d3Ref.current) {
      console.error('D3 렌더링 조건 불충족:', {
        hasData: !!section.data?.data,
        hasRef: !!d3Ref.current
      });
      return;
    }

    try {
      setError(null);

      // 기존 SVG 제거
      d3.select(d3Ref.current).selectAll('*').remove();

      const container = d3Ref.current;
      const data = section.data.data;
      const config = section.data.config || {};
      const width = config.width || 800;
      const height = config.height || 400;
      const vizType = section.data.visualization_type;

      console.log('D3 렌더링 시작:', { vizType, data, config });

      // SVG 생성
      const svg = d3.select(container)
        .append('svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      // Timeline 시각화 (개선된 조건 체크)
      if (vizType === 'timeline') {
        console.log('Timeline 렌더링 시작 - 데이터 체크:', data);

        // 다양한 데이터 형식 지원
        let events = data.events || data.items || data.timeline || [];

        // 데이터가 배열이 아닌 경우 변환 시도
        if (!Array.isArray(events)) {
          if (data.nodes && Array.isArray(data.nodes)) {
            // nodes 형식의 데이터를 timeline으로 변환
            events = data.nodes.map((node, index) => ({
              year: node.year || node.date || 2020 + index,
              name: node.name || node.label || node.title || `이벤트 ${index + 1}`,
              impact: node.impact || node.value || Math.random() * 100
            }));
          } else {
            // 기본 샘플 데이터 생성
            events = [
              { year: 2020, name: '시작', impact: 30 },
              { year: 2021, name: '발전', impact: 60 },
              { year: 2022, name: '성장', impact: 80 },
              { year: 2023, name: '확장', impact: 90 },
              { year: 2024, name: '현재', impact: 100 }
            ];
          }
        }

        console.log('Timeline 이벤트 데이터:', events);

        if (events.length === 0) {
          throw new Error('Timeline 데이터가 비어있습니다');
        }

        // Timeline 시각화 렌더링
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        // 시간 스케일
        const xScale = d3.scaleLinear()
          .domain(d3.extent(events, d => d.year))
          .range([0, innerWidth]);

        // 임팩트 스케일
        const yScale = d3.scaleLinear()
          .domain([0, d3.max(events, d => d.impact)])
          .range([innerHeight, 0]);

        // 축 추가
        g.append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(d3.axisBottom(xScale).tickFormat(d3.format('d')));

        g.append('g')
          .call(d3.axisLeft(yScale));

        // 타임라인 선
        const line = d3.line()
          .x(d => xScale(d.year))
          .y(d => yScale(d.impact))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(events)
          .attr('fill', 'none')
          .attr('stroke', '#667eea')
          .attr('stroke-width', 3)
          .attr('d', line);

        // 이벤트 점들
        g.selectAll('.event-dot')
          .data(events)
          .enter().append('circle')
          .attr('class', 'event-dot')
          .attr('cx', d => xScale(d.year))
          .attr('cy', d => yScale(d.impact))
          .attr('r', 8)
          .attr('fill', '#f093fb')
          .attr('stroke', '#fff')
          .attr('stroke-width', 3);

        // 이벤트 레이블
        g.selectAll('.event-label')
          .data(events)
          .enter().append('text')
          .attr('class', 'event-label')
          .attr('x', d => xScale(d.year))
          .attr('y', d => yScale(d.impact) - 15)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333')
          .text(d => d.name);

        // 축 레이블
        g.append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 0 - margin.left)
          .attr('x', 0 - (innerHeight / 2))
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .text('영향도');

        g.append('text')
          .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
          .style('text-anchor', 'middle')
          .text('연도');

        console.log('✅ Timeline 시각화 렌더링 성공');

      } else if (vizType === 'force' && data.nodes && data.links) {
        // Force 다이어그램 렌더링
        console.log('Force 다이어그램 렌더링');

        const simulation = d3.forceSimulation(data.nodes)
          .force('link', d3.forceLink(data.links).id(d => d.id))
          .force('charge', d3.forceManyBody().strength(-100))
          .force('center', d3.forceCenter(width / 2, height / 2));

        const link = svg.append('g')
          .selectAll('line')
          .data(data.links)
          .enter().append('line')
          .attr('stroke', '#999')
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', d => Math.sqrt(d.value || 1));

        const node = svg.append('g')
          .selectAll('circle')
          .data(data.nodes)
          .enter().append('circle')
          .attr('r', d => Math.sqrt((d.value || 10) * 3))
          .attr('fill', (d, i) => (config.colors || ['#667eea', '#f093fb'])[i % (config.colors || ['#667eea', '#f093fb']).length])
          .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

        node.append('title')
          .text(d => d.name || d.id);

        simulation.on('tick', () => {
          link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

          node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        });

        function dragstarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        }

        function dragended(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        console.log('✅ Force 다이어그램 렌더링 성공');

      } else if (vizType === 'treemap' && data.nodes) {
        // Treemap 시각화
        console.log('Treemap 렌더링');

        const root = d3.hierarchy({ children: data.nodes })
          .sum(d => d.value || 1)
          .sort((a, b) => b.value - a.value);

        d3.treemap()
          .size([width, height])
          .padding(2)(root);

        const leaf = svg.selectAll('g')
          .data(root.leaves())
          .enter().append('g')
          .attr('transform', d => `translate(${d.x0},${d.y0})`);

        leaf.append('rect')
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('fill', (d, i) => (config.colors || ['#667eea', '#f093fb', '#4facfe'])[i % 3]);

        leaf.append('text')
          .attr('x', 4)
          .attr('y', 14)
          .text(d => d.data.name || d.data.id)
          .attr('font-size', '12px')
          .attr('fill', 'white');

        console.log('✅ Treemap 렌더링 성공');

      } else if (vizType === 'sankey' && data.nodes && data.links) {
        // Sankey 다이어그램 (간단한 버전)
        console.log('Sankey 다이어그램 - 기본 구현');
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('font-size', '16px')
          .attr('fill', '#667eea')
          .text('Sankey 다이어그램 - 고급 구현 예정');

      } else {
        // 알 수 없는 시각화 타입 또는 데이터 부족
        console.warn('알 수 없는 D3 시각화 타입 또는 데이터 부족:', { vizType, data });

        // 더 상세한 오류 메시지 표시
        const errorGroup = svg.append('g')
          .attr('transform', `translate(${width / 2}, ${height / 2})`);

        errorGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('font-size', '16px')
          .attr('fill', '#ef4444')
          .attr('y', -20)
          .text(`${vizType || 'unknown'} 시각화`);

        errorGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('font-size', '14px')
          .attr('fill', '#64748b')
          .attr('y', 10)
          .text('데이터 형식을 확인해주세요');

        // 디버깅 정보 표시
        errorGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('fill', '#64748b')
          .attr('y', 30)
          .text(`받은 데이터 키: ${Object.keys(data).join(', ')}`);
      }

      console.log('D3 시각화 렌더링 완료');

    } catch (err) {
      console.error('❌ D3 렌더링 오류:', err);
      setError(`D3 시각화 렌더링 실패: ${err.message}`);

      // 오류 시 기본 메시지 표시
      if (d3Ref.current) {
        d3.select(d3Ref.current).selectAll('*').remove();

        const svg = d3.select(d3Ref.current)
          .append('svg')
          .attr('width', '100%')
          .attr('height', '300px')
          .attr('viewBox', '0 0 400 300');

        svg.append('text')
          .attr('x', 200)
          .attr('y', 150)
          .attr('text-anchor', 'middle')
          .attr('font-size', '14px')
          .attr('fill', '#ef4444')
          .text(`시각화 오류: ${err.message}`);
      }
    }
  };

  const renderChart = () => {
    const { config } = section.data;
    if (!config) return null;

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: section.title
        }
      },
      ...config.options
    };

    const chartProps = {
      data: config.data,
      options: chartOptions,
      ref: chartRef
    };

    switch (config.type) {
      case 'bar':
        return <Bar {...chartProps} />;
      case 'line':
        return <Line {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      case 'radar':
        return <Radar {...chartProps} />;
      case 'scatter':
        return <Scatter {...chartProps} />;
      default:
        return <div>지원하지 않는 차트 타입: {config.type}</div>;
    }
  };

  const renderTable = () => {
    const { headers, rows, styling } = section.data;
    if (!headers || !rows) return null;

    return (
      <div className="table-container">
        <table className={`data-table ${styling?.sortable ? 'sortable' : ''}`}>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i} className={styling?.highlight_column === i ? 'highlighted' : ''}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={styling?.highlight_column === cellIndex ? 'highlighted' : ''}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAdvanced = () => {
    return (
      <div className="advanced-visualization-placeholder">
        <h4>{section.data.visualization_type} 시각화</h4>
        <p>고급 시각화는 추가 구현이 필요합니다.</p>
        <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', overflow: 'auto' }}>
          {JSON.stringify(section.data.data, null, 2)}
        </pre>
      </div>
    );
  };

  const getPurposeIcon = (purpose) => {
    const icons = {
      overview: '🌐',
      detail: '🔍',
      comparison: '⚖️',
      process: '🔄',
      data: '📊',
      timeline: '📅',
      structure: '🏗️'
    };
    return icons[purpose] || '📊';
  };

  const getPurposeLabel = (purpose) => {
    const labels = {
      overview: '전체 개요',
      detail: '세부 분석',
      comparison: '비교',
      process: '프로세스',
      data: '데이터',
      timeline: '타임라인',
      structure: '구조'
    };
    return labels[purpose] || purpose;
  };

  return (
    <div className="smart-visualization">
      <div className="visualization-header">
        <h3>
          {getPurposeIcon(section.purpose)} {section.title}
          {section.purpose && (
            <span className={`purpose-badge purpose-${section.purpose}`}>
              {getPurposeLabel(section.purpose)}
            </span>
          )}
        </h3>
      </div>

      <div className="visualization-content">
        {section.data?.type === 'chart' && (
          <div className="chart-container">
            {renderChart()}
          </div>
        )}

        {(section.data?.type === 'network' || section.data?.type === 'diagram') && (
          <div className="network-container">
            <div
              ref={networkRef}
              className="vis-network"
              style={{ height: '400px', width: '100%' }}
            />
            {error && (
              <div className="visualization-error">
                <p>⚠️ {error}</p>
              </div>
            )}
          </div>
        )}

        {section.data?.type === 'flow' && (
          <div className="flow-container" style={{ height: '400px', width: '100%' }} ref={flowRef}>
            <ReactFlow
              nodes={section.data?.data?.nodes || [
                { id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: '시작' } },
                { id: '2', position: { x: 100, y: 100 }, data: { label: '과정' } },
                { id: '3', type: 'output', position: { x: 200, y: 200 }, data: { label: '완료' } }
              ]}
              edges={section.data?.data?.edges || [
                { id: 'e1-2', source: '1', target: '2', label: '연결 1' },
                { id: 'e2-3', source: '2', target: '3', label: '연결 2' }
              ]}
              fitView
              attributionPosition="bottom-right"
            >
              <Background />
              <Controls />
            </ReactFlow>
            {error && (
              <div className="visualization-error">
                <p>⚠️ {error}</p>
              </div>
            )}
          </div>
        )}

        {section.data?.type === 'd3' && (
          <div className="d3-container">
            <div
              ref={d3Ref}
              className="d3-visualization"
              style={{ width: '100%', minHeight: '400px' }}
            />
            {error && (
              <div className="visualization-error">
                <p>⚠️ {error}</p>
              </div>
            )}
          </div>
        )}

        {section.data?.type === 'table' && renderTable()}

        {section.data?.type === 'advanced' && renderAdvanced()}

        {!section.data && (
          <div className="visualization-error">
            <p>⚠️ 시각화 데이터가 없습니다</p>
            <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
              섹션 전체 데이터: {JSON.stringify(section, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {section.insight && (
        <div className="visualization-insight">
          <h4>💡 핵심 인사이트</h4>
          <p>{section.insight}</p>
        </div>
      )}

      {section.user_benefit && (
        <div className="visualization-benefit">
          <h4>🎯 이 시각화의 가치</h4>
          <p>{section.user_benefit}</p>
        </div>
      )}
    </div>
  );
};

export default SmartVisualization;