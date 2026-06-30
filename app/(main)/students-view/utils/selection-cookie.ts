const COOKIE_NAME = "rms_class_results_student";
/** ~6 months; adjust as needed */
const MAX_AGE_SEC = 60 * 60 * 24 * 180;

type SelectionPayload = {
  classId: string;
  termId: string;
  studentId: string;
};

function parseCookie(): SelectionPayload | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!row) return null;
  const value = row.slice(COOKIE_NAME.length + 1);
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as SelectionPayload;
  } catch {
    return null;
  }
}

export function readResultsStudentSelection(classId: string, termId: string): string | null {
  const payload = parseCookie();
  if (!payload || payload.classId !== classId || payload.termId !== termId) return null;
  return payload.studentId || null;
}

export function writeResultsStudentSelection(payload: SelectionPayload): void {
  if (typeof document === "undefined") return;
  const raw = encodeURIComponent(JSON.stringify(payload));
  document.cookie = `${COOKIE_NAME}=${raw}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
}
