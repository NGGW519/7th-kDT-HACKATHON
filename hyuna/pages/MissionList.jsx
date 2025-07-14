import React from 'react';
import { useMission } from '../context/MissionContext';

function TodoPage() {
  const { todoList, toggleComplete } = useMission();

  const incompleteTasks = todoList.filter((t) => !t.completed);
  const completedTasks = todoList.filter((t) => t.completed);

  const stars = Array.from({ length: todoList.length }, (_, i) =>
    i < completedTasks.length ? '★' : '☆'
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📌 오늘의 추천 미션</h2>

      

      <ul style={{ listStyle: 'none' }}>
        {incompleteTasks.map((item, index) => (
          <li key={index} style={{ marginBottom: '1rem' }}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleComplete(todoList.indexOf(item))}
            />
            <span style={{ marginLeft: '0.5rem' }}>{item.text}</span>
          </li>
        ))}
      </ul>

      {completedTasks.length > 0 && (
        <>
          <h3 style={{ marginTop: '2rem' }}>✅ 완료한 미션</h3>
          <ul style={{ listStyle: 'none' }}>
            {completedTasks.map((item, index) => (
              <li key={index} style={{ marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleComplete(todoList.indexOf(item))}
                />
                <span style={{ marginLeft: '0.5rem', color: '#888' }}>{item.text}</span>
                <div style={{ fontSize: '0.8rem', color: '#888', marginLeft: '1.5rem' }}>
                  완료: {item.completedAt}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        ⭐ 미션 점수: {stars.join(' ')} ({completedTasks.length}/{todoList.length})
      </div>
    </div>
  );
}

export default TodoPage;
