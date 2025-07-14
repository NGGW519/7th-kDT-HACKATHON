// jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();
  // navigate()는 URL 경로를 바꿔서 다른 페이지로 이동할 수 있게 해줌
	// 예: navigate('/badges') → /badges 페이지로 이동

  return (
    <div style={{ padding: '2rem' }}>
      <h1>고향으로 ON - 메인 대시보드</h1>

      <section>
        <h2>내 프로필</h2>
        <p>이름: 홍길동</p>
        <p>유형: 귀향자</p>
        <p>현재 등급: Intermediate</p>
      </section>
      {/* 고정된 텍스트지만, 나중에 로그인한 사용자의 정보로 바뀔 수 있음 */}

      <section>
        <h2>오늘의 추천 미션</h2>
        <ul>
          <li>동사무소 방문하기</li>
          <li>어르신과 장기두기</li>
        </ul>
      </section>
      {/* 실제로는 AI 추천이나 서버에서 불러온 데이터를 표시 */}

      <section>
        <h2>나의 진행 중 미션</h2>
        <ul>
          <li>화장실 수전 교체</li>
        </ul>
      </section>

      <section>
        <h2>완료된 미션</h2>
        <ul>
          <li>동네 소풍 미션</li>
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <button onClick={() => navigate('/request-board')}>의뢰자 게시판</button>
        <button onClick={() => navigate('/mentoring')}>멘토링 게시판</button>
        <button onClick={() => navigate('/badges')}>배지 목록</button>
        {/* 각 버튼은 클릭 시 navigate()로 다른 페이지로 이동시킴 */}
      </section>
    </div>
  );
}

export default MainPage;
