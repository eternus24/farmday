// src/utils/dateKST.js

const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

/** KST 기준 오늘의 { y, m, d } */
function getTodayYMDInSeoul() {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const parts = dtf.formatToParts(new Date());
  const y = Number(parts.find(p => p.type === 'year').value);
  const m = Number(parts.find(p => p.type === 'month').value);
  const d = Number(parts.find(p => p.type === 'day').value);
  return { y, m, d };
}

function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
function daysInMonth(y, m) {
  if (m === 2) return isLeap(y) ? 29 : 28;
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}

/** Y/M/D에 delta일 더한 { y, m, d } */
function addDaysYMD(y, m, d, delta) {
  let Y = y, M = m, D = d + delta;
  while (D > daysInMonth(Y, M)) {
    D -= daysInMonth(Y, M);
    M += 1;
    if (M > 12) { M = 1; Y += 1; }
  }
  return { y: Y, m: M, d: D };
}

/** 주(0=일…6=토) — why: 타임존 영향 제거 */
function weekdayIndex(y, m, d) {
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** KST 기준 임의의 +delta일을 'M/D(요일)' 포맷으로 */
export function formatDaysLaterLabelKST(delta) {
  const { y, m, d } = getTodayYMDInSeoul();
  const next = addDaysYMD(y, m, d, delta);
  const w = weekdayIndex(next.y, next.m, next.d);
  return `${next.m}/${next.d}(${WEEKDAYS_KO[w]})`;
}

/** KST 기준 1·2·3일 중 랜덤 선택해 'M/D(요일)' 반환 */
export function random123DaysLaterLabelKST() {
  const choices = [1, 2, 3];
  const delta = choices[Math.floor(Math.random() * choices.length)];
  return formatDaysLaterLabelKST(delta);
}

/* 사용 예 (React)
  const label = random123DaysLaterLabelKST();
  return <span>{label}</span>;
*/
