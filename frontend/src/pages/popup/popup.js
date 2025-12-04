// utils/popup.js
export function getTodayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function shouldShowMainPopup() {
  try {
    const today = getTodayStr();
    const skipDate = localStorage.getItem("mainPopupSkipDate");
    return skipDate !== today;
  } catch {
    return true;
  }
}

export function markMainPopupSkippedForToday() {
  try {
    const today = getTodayStr();
    localStorage.setItem("mainPopupSkipDate", today);
  } catch {}
}
