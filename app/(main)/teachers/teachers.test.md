# `/teachers` Route — Comprehensive Test Plan

**Route:** `/teachers`
**Page:** `page.tsx`
**Stack:** Next.js App Router · Vitest · Testing Library · (E2E: Playwright recommended)

---

## Scope & Architecture

| File | Responsibility |
|------|----------------|
| `page.tsx` | Wraps content in `OrgAdminGate`; shows `TeachersLoading` fallback |
| `teachers-form.tsx` | Data fetching, auth gating, add/remove mutations, UI state machine |
| `teachers-table.tsx` | Sortable/searchable table via shared `DataTable` |
| `add-teacher-modal.tsx` | Add-teacher dialog + email form |
| `edit-teacher-modal.tsx` | View teacher details + two-step remove confirmation |
| `loading.tsx` | Route-level skeleton while `OrgAdminGate` resolves |
| `teachers-loading-table.tsx` | Inline table skeleton during member fetch |

**External dependencies under test (mock in unit/component tests):**
- `getOrgMembers()` → `authClient.organization.listMembers`
- `useAddMember()` → `POST /api/v1/organisation/add-member`
- `authClient.organization.removeMember`
- `useUser()` → role, 2FA, email verification
- `OrgAdminGate`, `SessionGate`, `SecuritySetupModal`
- `handleAuthRedirect`, `getHttpStatus`, `getApiErrorMessage`

**Suggested test fixtures:**
```ts
const mockTeachers = [
  { id: "t1", name: "Ada Lovelace", email: "ada@school.edu", image: null },
  { id: "t2", name: "Alan Turing", email: "alan@school.edu", image: null },
];
const orgAdminCanManage = {
  id: "t1", role: "orgadmin", twoFactorEnabled: true, emailVerified: true,
};
const orgAdminNo2FA = { ...orgAdminCanManage, twoFactorEnabled: false };
const teacherUser = { id: "t3", role: "teacher", twoFactorEnabled: true, emailVerified: true };
```

---

## 1. Unit Tests

Pure logic with no DOM. Run with Vitest (`client/vitest.config.mts`).

### 1.1 `addTeacherSchema` (`teachers-form.tsx`)

| ID | Test | Input | Expected |
|----|------|-------|----------|
| U-01 | Accepts valid email | `"staff@school.edu"` | Parse succeeds |
| U-02 | Rejects empty string | `""` | Error: "Valid email is required" |
| U-03 | Rejects malformed email | `"not-an-email"` | Zod validation error |
| U-04 | Rejects email without domain | `"user@"` | Zod validation error |
| U-05 | Accepts email with subdomain | `"a.b@c.d.edu"` | Parse succeeds |
| U-06 | Trimming is handled in handler, not schema | `"  x@y.com  "` | Schema passes; handler trims (see U-10) |

### 1.2 `canManage` permission logic (`teachers-form.tsx`)

| ID | Test | User state | Expected `canManage` |
|----|------|------------|----------------------|
| U-07 | Org admin with 2FA + verified email | `role: orgadmin`, `twoFactorEnabled: true`, `emailVerified: true` | `true` |
| U-08 | Org admin without 2FA | `twoFactorEnabled: false` | `false` |
| U-09 | Org admin with unverified email | `emailVerified: false` | `false` |
| U-10 | Non-orgadmin role | `role: "teacher"` | `false` |
| U-11 | Undefined user | `user: undefined` | `false` |

### 1.3 Email normalization & duplicate detection (`addMember` handler)

| ID | Test | Existing list | Submitted email | Expected |
|----|------|---------------|-----------------|----------|
| U-12 | Normalizes to lowercase | `[]` | `"Staff@School.EDU"` | API called with `"staff@school.edu"` |
| U-13 | Trims whitespace | `[]` | `"  staff@school.edu  "` | API called with `"staff@school.edu"` |
| U-14 | Blocks duplicate (exact match) | `[{ email: "a@b.com" }]` | `"a@b.com"` | `setError("email", "A teacher with this email already exists")`; no API call |
| U-15 | Blocks duplicate (case-insensitive) | `[{ email: "A@B.com" }]` | `"a@b.com"` | Same as U-14 |
| U-16 | Allows new email | `[{ email: "a@b.com" }]` | `"c@d.com"` | API called |
| U-17 | No-op when `canManage` is false | any | any | No API call, no dialog side effects |

### 1.4 Auth redirect side effects (`teachers-form.tsx` useEffect + `handleAuthRedirect`)

| ID | Test | Error status | Expected |
|----|------|--------------|----------|
| U-18 | 401 on member fetch | `membersError` status 401 | `router.replace("/sign-in?redirect=/teachers")` |
| U-19 | 403 on member fetch | status 403 | `router.replace("/forbidden")` |
| U-20 | Other errors | status 500 | No redirect; error banner shown instead |
| U-21 | 401 on add member | mutation error 401 | `handleAuthRedirect` → toast + sign-in redirect |
| U-22 | 403 on remove member | remove error 403 | `handleAuthRedirect` → toast + `/forbidden` |
| U-23 | Non-auth error on add | status 409 | Generic error toast via `getApiErrorMessage` |

### 1.5 `getOrgMembers` query mapper (`fetcher/queries.ts`)

| ID | Test | API response | Expected |
|----|------|--------------|----------|
| U-24 | Maps members to `teacherOption[]` | `{ members: [{ user: { id, name, email, image } }] }` | Correct shape returned |
| U-25 | Throws when `members` missing | `{ members: undefined }` | Error: "Failed to load organisation members" |
| U-26 | Returns empty array initially | SWR loading | `teachers: []`, `isLoading: true` |
| U-27 | `enabled: false` skips fetch | `enabled = false` | SWR key is `null`; no fetch |

### 1.6 `useAddMember` mutation (`fetcher/mutations.ts`)

| ID | Test | Expected |
|----|------|----------|
| U-28 | POSTs to `/api/v1/organisation/add-member` with `{ email }` | Correct URL + body |
| U-29 | On success, invalidates `ORG_MEMBERS_KEY` | `mutate("org-members")` called |
| U-30 | Exposes `isMutating` while request in flight | Loading flag true → false |

### 1.7 `controlsDisabled` derivation

| ID | Condition | Expected `controlsDisabled` |
|----|-----------|----------------------------|
| U-31 | `addLoading === true` | `true` |
| U-32 | `isLoadingMembers === true` | `true` |
| U-33 | `membersError` present | `true` |
| U-34 | `teacherList.length === 0` (after load) | `true` |
| U-35 | Loaded list with teachers, no errors | `false` |

### 1.8 `TeachersTable` column filter (`teachers-table.tsx`)

| ID | Test | Query | Row data | Expected match |
|----|------|-------|----------|----------------|
| U-36 | Filter by name | `"ada"` | `{ name: "Ada Lovelace", email: "x@y.com" }` | `true` |
| U-37 | Filter by email | `"school.edu"` | `{ name: "X", email: "a@school.edu" }` | `true` |
| U-38 | Case-insensitive | `"ADA"` | `{ name: "Ada Lovelace" }` | `true` |
| U-39 | No match | `"zzz"` | any | `false` |

### 1.9 `EditTeacherModal` guard logic

| ID | Test | Expected |
|----|------|----------|
| U-40 | `handleRemoveClick` no-ops when `teacher.id === user.id` | Confirm dialog not opened |
| U-41 | `handleRemoveClick` no-ops when `canManage === false` | Confirm dialog not opened |
| U-42 | Closing details modal also closes confirm dialog | `setConfirmOpen(false)` |

---

## 2. Component Tests

Render with `@testing-library/react` + mocked providers (`UserProvider`, `SWRConfig`, `next/navigation`).

### 2.1 `TeachersPage` (`page.tsx`)

| ID | Test | Setup | Expected |
|----|------|-------|----------|
| C-01 | Renders `OrgAdminGate` wrapper | Mock gate to render children | `TeachersForm` mountable |
| C-02 | Shows loading fallback while gate pending | `OrgAdminGate` returns fallback | Skeleton layout from `loading.tsx` visible |
| C-03 | Page layout classes | Org admin user | `main` has `min-h-screen`, `max-w-5xl` container |

### 2.2 `OrgAdminGate` integration (via page)

| ID | Test | User | Expected |
|----|------|------|----------|
| C-04 | Non-orgadmin redirected | `role: "teacher"` | `router.replace("/dashboard")` |
| C-05 | Orgadmin sees content | `role: "orgadmin"` | `TeachersForm` rendered |
| C-06 | Loading shows fallback | `isLoading: true` | Fallback skeleton, not form |

### 2.3 `TeachersForm` — loading & empty states

| ID | Test | Mock state | Expected UI |
|----|------|------------|-------------|
| C-07 | Initial fetch loading | `isLoadingMembers: true`, `teachers: []` | `TeachersLoadingTable` with `aria-busy="true"` |
| C-08 | Fetch error | `membersError` set | `ErrorBanner` title "Could not load teachers" + Retry button |
| C-09 | Retry refetches | Click Retry | `mutate(ORG_MEMBERS_KEY)` called |
| C-10 | Empty list after success | `teachers: []`, loaded | `EmptyNoEntry` "No teachers yet" |
| C-11 | Empty state CTA for manager | `canManage: true` | "Add Teacher" action in empty state |
| C-12 | Empty state no CTA for read-only | `canManage: false` | No action button in empty state |
| C-13 | Header shows count | 3 teachers | "All Teachers (3)" |
| C-14 | Page title | always | `h1` "Teachers" + `SmallTermText` |

### 2.4 `TeachersForm` — add teacher flow

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| C-15 | Add button visible for manager | `canManage: true` | "Add Teacher" button rendered |
| C-16 | Add button hidden without manage permission | `canManage: false` | Button absent |
| C-17 | Add button disabled during load/error | loading or error | Button `disabled` |
| C-18 | Opens add modal | Click Add | `TeacherModal` open, email field empty |
| C-19 | Submit valid email | Fill + submit | `addMemberClient` called; success toast; modal closes; form reset |
| C-20 | Submit invalid email | `"bad"` + submit | Inline validation message |
| C-21 | Duplicate email inline error | Existing email | Error on field; no API call |
| C-22 | Submit loading state | Slow mutation | Submit button shows loading; inputs disabled |
| C-23 | API failure toast | Mutation rejects | Error toast with API message |
| C-24 | Cancel closes modal | Click Cancel | Modal closed; no mutation |
| C-25 | `SecuritySetupModal` rendered | always | Component present in tree |

### 2.5 `TeacherModal` (`add-teacher-modal.tsx`)

| ID | Test | Expected |
|----|------|----------|
| C-26 | Dialog title "Add Teacher" | Visible when open |
| C-27 | Email input `type="email"`, placeholder `staff@school.edu` | Correct attributes |
| C-28 | Read-only mode hides submit | `readOnly: true` | No "Add Teacher" submit button |
| C-29 | Read-only disables input | `readOnly: true` | Email input disabled |
| C-30 | Cancel disabled while loading | `loading: true` | Cancel button disabled |

### 2.6 `TeachersTable` (`teachers-table.tsx`)

| ID | Test | Expected |
|----|------|----------|
| C-31 | Renders all teachers | 2 rows for 2 teachers |
| C-32 | Default sort by name ascending | Names in A→Z order |
| C-33 | Sort toggle on Name column | Click header reverses order |
| C-34 | Sort toggle on Email column | Works independently |
| C-35 | Search filters rows | Type in search → matching rows only |
| C-36 | Empty search message | No matches | "No teachers match your search." |
| C-37 | Pagination at 10 rows | 15 teachers | Page 2 accessible |
| C-38 | Current user row shows "You" badge | `currentUserId` match | No View button; "You" label |
| C-39 | Other rows show View button | `canManage: true` | Pencil/View button present |
| C-40 | No actions column when read-only | `canManage: false` | Actions cells empty/null |
| C-41 | View button disabled during add | `addLoading: true` | Button disabled |
| C-42 | View opens edit modal | Click View | `onViewTeacher` called with row data |
| C-43 | Table disabled prop passed through | `disabled: true` | Search/sort interactions blocked |

### 2.7 `EditTeacherModal` (`edit-teacher-modal.tsx`)

| ID | Test | Expected |
|----|------|----------|
| C-44 | Shows teacher name and email read-only | Disabled inputs with values |
| C-45 | Danger zone hidden for self | `teacher.id === user.id` | No remove section |
| C-46 | Danger zone shown for other teachers | Different id | Remove button visible |
| C-47 | Danger zone hidden when `canManage: false` | | No remove section |
| C-48 | Remove opens confirm dialog | Click Remove | `ConfirmDialog` opens with name/email in copy |
| C-49 | Confirm remove calls `removeMember` | Confirm | `removeMember(teacher.email)` invoked |
| C-50 | Cancel confirm keeps teacher | Dismiss confirm | Member not removed |
| C-51 | Removing state disables confirm | During async remove | Confirm button loading/disabled |
| C-52 | Close button closes modal | Click Close | Dialog closes |
| C-53 | Closing details modal dismisses confirm | X or overlay | Both dialogs closed |

### 2.8 `TeachersLoading` & `TeachersLoadingTable`

| ID | Test | Expected |
|----|------|----------|
| C-54 | Route loading skeleton structure | Header + card skeletons present |
| C-55 | Loading table renders 3 skeleton rows | `LOADING_ROW_COUNT === 3` |
| C-56 | Accessible loading label | `aria-label="Loading teachers"` |

### 2.9 Accessibility (component-level)

| ID | Test | Expected |
|----|------|----------|
| C-57 | View button has `aria-label="View teacher"` | Screen reader accessible |
| C-58 | Actions column has sr-only header | "Actions" for assistive tech |
| C-59 | Form fields associated with labels | Email label + input linked |
| C-60 | Focus trap in dialogs | Tab cycles within modal |
| C-61 | Escape closes modals | Keydown Escape dismisses |

---

## 3. End-to-End Tests

Recommended: **Playwright** against `client` (port 3000) + `api` (port 5000).
Use seeded org-admin account with 2FA enabled and verified email.

### 3.1 Route protection & navigation

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| E-01 | Unauthenticated access blocked | Visit `/teachers` without session | Redirect to `/sign-in` (via `proxy.ts` / session) |
| E-02 | Sign-in redirect preserves return URL | Hit `/teachers` → sign in | Lands back on `/teachers` |
| E-03 | Non-orgadmin cannot access | Sign in as teacher → visit `/teachers` | Redirect to `/dashboard` |
| E-04 | Sidebar link works | Click "Teachers" in sidebar | Navigates to `/teachers` |
| E-05 | Direct URL load | Paste `/teachers` | Page renders for org admin |

### 3.2 Page load & display

| ID | Test | Expected |
|----|------|----------|
| E-06 | Page title and heading | "Teachers" visible; active term text shown |
| E-07 | Loading skeleton → data | Brief skeleton, then teacher list |
| E-08 | Teacher count accurate | Header count matches table rows |
| E-09 | Empty org state | Fresh org with no members | Empty state with add CTA |

### 3.3 Add teacher (happy path)

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| E-10 | Add new teacher | Add → enter new email → submit | Success toast; teacher appears in table; count +1 |
| E-11 | Add normalizes email | Submit `" Teacher@School.EDU "` | Stored/displayed as lowercase |
| E-12 | Modal closes on success | After add | Dialog not visible |
| E-13 | New teacher persists after refresh | Reload page | Teacher still listed |

### 3.4 Add teacher (error paths)

| ID | Test | Expected |
|----|------|----------|
| E-14 | Duplicate email blocked client-side | Inline error before API |
| E-15 | Invalid email blocked | Validation message; no API call |
| E-16 | Unknown user / server rejection | Error toast; modal stays open |
| E-17 | Network failure on add | Error toast; user can retry |

### 3.5 View & remove teacher

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| E-18 | View teacher details | Click View on row | Modal shows name + email |
| E-19 | Cannot remove self | Open own row (if listed) | No danger zone / no remove |
| E-20 | Remove other teacher | View → Remove → Confirm | Success toast; row gone; count -1 |
| E-21 | Cancel remove | View → Remove → Cancel | Teacher remains |
| E-22 | Removed teacher loses org access | Removed user signs in | No longer sees org data (API-level check) |

### 3.6 Table interactions

| ID | Test | Expected |
|----|------|----------|
| E-23 | Search by name | Filters visible rows |
| E-24 | Search by email | Filters visible rows |
| E-25 | Sort by name | Order changes correctly |
| E-26 | Pagination | 11+ teachers → page 2 works |

### 3.7 Permission & security gating

| ID | Test | Expected |
|----|------|----------|
| E-27 | Org admin without 2FA | Add/Remove controls hidden or blocked; `SecuritySetupModal` prompts setup |
| E-28 | Org admin unverified email | `canManage` false; no add/remove |
| E-29 | Session expiry mid-action | 401 → redirect to sign-in with message |
| E-30 | Forbidden action | 403 → redirect to `/forbidden` |

### 3.8 Error recovery

| ID | Test | Expected |
|----|------|----------|
| E-31 | API down on load | Error banner with retry |
| E-32 | Retry after API recovery | Click Retry → table loads |
| E-33 | Stale-while-revalidate | Cached teachers shown while revalidating |

### 3.9 Responsive & cross-browser

| ID | Test | Viewport | Expected |
|----|------|----------|----------|
| E-34 | Mobile layout | 375px | "Add" short label; table scrolls horizontally |
| E-35 | Desktop layout | 1280px | Full "Add Teacher" label |
| E-36 | Chromium + Firefox smoke | Both browsers | Core flows pass |

---

## 4. API / Integration Tests (backend support for `/teachers`)

These live in `api/` but are required for reliable E2E.

| ID | Endpoint / action | Test |
|----|-------------------|------|
| A-01 | `GET listMembers` (Better Auth) | Returns org members for active org |
| A-02 | `POST /api/v1/organisation/add-member` | Adds member by email; 201 |
| A-03 | Same endpoint duplicate | 409 or appropriate error |
| A-04 | Same endpoint non-orgadmin caller | 403 |
| A-05 | `removeMember` | Removes member; subsequent list excludes them |
| A-06 | Remove self as sole admin | Blocked or safe-handled |

---

## 5. Suggested Implementation Order

1. **Unit:** U-01–U-17 (schema, permissions, duplicate logic) — highest ROI, no DOM
2. **Component:** C-07–C-14, C-15–C-24 (state machine + add flow)
3. **Component:** C-31–C-43, C-44–C-53 (table + edit/remove)
4. **E2E:** E-01–E-05, E-10–E-13 (access + happy path)
5. **E2E:** E-18–E-22, E-27–E-30 (remove + security)
6. **Remaining** error, a11y, responsive cases

---

## 6. Mock Setup Snippets (Vitest)

```ts
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/teachers",
}));

vi.mock("@/fetcher/queries", () => ({
  getOrgMembers: vi.fn(),
  ORG_MEMBERS_KEY: "org-members",
}));

vi.mock("@/fetcher/mutations", async () => {
  const actual = await vi.importActual("@/fetcher/mutations");
  return { ...actual, useAddMember: vi.fn() };
});

vi.mock("@/contexts/user-context", () => ({
  useUser: vi.fn(() => ({ user: orgAdminCanManage })),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
```

---

## 7. Coverage Targets

| Area | Target |
|------|--------|
| `teachers-form.tsx` handlers (`addMember`, `removeMember`, redirects) | 90%+ |
| Modal open/close + guard branches | 85%+ |
| Table column filter fn | 100% |
| E2E critical paths (add, remove, auth) | 100% of happy paths |

---

**Total test cases:** 36 unit · 25 component · 36 e2e · 6 API = **103**
