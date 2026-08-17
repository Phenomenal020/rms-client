const COOKIE_NAME = "rms_class_results_student";
/** ~6 months; adjust as needed */
const MAX_AGE_SEC = 60 * 60 * 24 * 180;

type SelectionPayload = {
  classId: string;
  termId: string;
  studentId: string;
  subjectId?: string;
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

function writeCookie(payload: SelectionPayload): void {
  if (typeof document === "undefined") return;
  const raw = encodeURIComponent(JSON.stringify(payload));
  document.cookie = `${COOKIE_NAME}=${raw}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
}

export function readResultsClassSelection(termId: string): string | null {
  const payload = parseCookie();
  if (!payload || payload.termId !== termId) return null;
  return payload.classId || null;
}

export function readResultsStudentSelection(classId: string, termId: string): string | null {
  const payload = parseCookie();
  if (!payload || payload.classId !== classId || payload.termId !== termId) return null;
  return payload.studentId || null;
}

export function readResultsSubjectSelection(classId: string, termId: string): string | null {
  const payload = parseCookie();
  if (!payload || payload.classId !== classId || payload.termId !== termId) return null;
  return payload.subjectId || null;
}

export function writeResultsStudentSelection(payload: SelectionPayload): void {
  const existing = parseCookie();
  const keepSubject =
    existing && existing.classId === payload.classId && existing.termId === payload.termId
      ? existing.subjectId
      : undefined;
  writeCookie({
    ...payload,
    subjectId: payload.subjectId ?? keepSubject,
  });
}

export function writeResultsClassSelection(classId: string, termId: string): void {
  const existing = parseCookie();
  const sameClass = existing && existing.classId === classId && existing.termId === termId;
  writeCookie({
    classId,
    termId,
    studentId: sameClass ? existing.studentId : "",
    subjectId: sameClass ? existing.subjectId : undefined,
  });
}

export function writeResultsSubjectSelection(classId: string, termId: string, subjectId: string): void {
  const existing = parseCookie();
  const keepStudent =
    existing && existing.classId === classId && existing.termId === termId
      ? existing.studentId
      : "";
  writeCookie({ classId, termId, studentId: keepStudent, subjectId });
}
