// frontend/src/components/Test.jsx
import { useEffect, useState } from 'react';

export default function Test() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const { protocol, hostname } = window.location; // 왜: 다른 PC에서도 접속한 IP를 그대로 사용
    fetch(`${protocol}//${hostname}:8080/api/test`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => setErr(e.message || 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>로딩중…</p>;
  if (err) return <p role="alert">오류: {err}</p>;

  return (
    <div style={{ maxWidth: 560, margin: '2rem auto', fontFamily: 'system-ui' }}>
      <h2>Test Table</h2>
      <ul>
        {rows.map((r) => (
          <li key={r.id}>{r.id} — {r.name}</li>
        ))}
      </ul>
    </div>
  );
}


