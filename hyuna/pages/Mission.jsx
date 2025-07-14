// jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

function SelectMissionPage() {
  const navigate = useNavigate();

  const boxes = [
    { text: '지역 탐색형', color: '#FFD700', path: '/mission' },
    { text: '유대감 형성형', color: '#FFB6C1', path: '/request-board' },
    { text: '재능 기부형', color: '#87CEFA', path: '/mentoring' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>👋 고향으로 ON</h1>
      <p>원하는 항목을 선택하세요</p>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        {boxes.map((box, index) => (
          <div
            key={index}
            onClick={() => navigate(box.path)}
            style={{
              backgroundColor: box.color,
              padding: '2rem',
              borderRadius: '1rem',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textAlign: 'center',
              flex: 1,
              cursor: 'pointer',
              boxShadow: '3px 3px 10px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
          >
            {box.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectMissionPage;
