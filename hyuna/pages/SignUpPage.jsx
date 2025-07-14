// jsx

import React, { useState } from 'react';

function SignUpPage() {
// 나중에 다른 파일에서 <SignUpPage />로 사용할 수 있음
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  // useState(''): 값을 저장할 수 있는 변수(name, email, userType) 만들기
	// setXxx: 해당 값을 변경할 때 쓰는 함수
	// 예를 들어, 이름 입력창에 "홍길동"을 쓰면 setName("홍길동")이 실행됨

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`가입 완료! 이름: ${name}, 이메일: ${email}, 유형: ${userType}`);
  };
  // onSubmit 이벤트가 발생했을 때 실행될 함수
	// e.preventDefault()는 기본 제출 동작(새로고침)을 막아줌
	// 버튼을 클릭할 때 현재 페이지가 새로고침되고 입력값이 날아가버린다. 
	// -> 내가 직접 원하는 처리를 하겠다는 의미

  return (
    <div style={{ padding: '2rem' }}>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>이름:</label><br />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>이메일:</label><br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>사용자 유형:</label><br />
          <select value={userType} onChange={(e) => setUserType(e.target.value)} required>
            <option value="">선택하세요</option>
            <option value="귀향자">귀향자</option>
            <option value="의뢰자">의뢰자</option>
            <option value="멘토">멘토</option>
            {/* 드롭다운 메뉴 생성 */}
          </select>
          
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>가입하기</button>
      </form>
    </div>
  );
}

export default SignUpPage;

