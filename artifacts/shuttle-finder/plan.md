# Shuttle Finder — Plan

## 전제

| 항목 | 결정 |
|---|---|
| 공휴일 관리 | `config/schedule.ts`에 연간 날짜 배열 하드코딩 (연초 1회 업데이트) |
| 페이지 경로 | `/` (앱 메인) — 현재 blank slate |
| RSC 경계 | `app/page.tsx` Server Component → `<ShuttleFinder />` Client Component |
| 시간표 셀렉터 | 기존 `components/ui/select.tsx` 재사용 (Radix UI 기반) |
| 결과 카드 | 기존 `components/ui/card.tsx` 재사용 |

## 영향받는 파일

| 파일 | 역할 |
|---|---|
| `types/shuttle.ts` | 신규 — Stop, Route, ScheduleEntry, ShuttleResult 타입 |
| `config/schedule.ts` | 신규 — 정류장 목록, 노선별 시간표, 공휴일 날짜 배열 |
| `lib/shuttle.ts` | 신규 — 핵심 비즈니스 로직 |
| `lib/shuttle.test.ts` | 신규 — Vitest 유닛 테스트 |
| `components/shuttle-finder/shuttle-finder.tsx` | 신규 — 메인 컨테이너 (use client) |
| `components/shuttle-finder/stop-selector.tsx` | 신규 — 정류장 드롭다운 UI |
| `components/shuttle-finder/shuttle-result.tsx` | 신규 — 결과 영역 |
| `components/shuttle-finder/shuttle-result.test.tsx` | 신규 — Vitest 컴포넌트 테스트 |
| `app/page.tsx` | 수정 — ShuttleFinder 렌더링으로 교체 |

## 관련 스킬

- `next-best-practices` — RSC 경계, `"use client"` 배치, hydration 오류 방지
- `vercel-react-best-practices` — `rerender-derived-state-no-effect` (시간 계산은 render 중 파생), `rendering-conditional-render` (ternary 사용)

---

## Task 1. 핵심 데이터 타입 + 시간표 config + 비즈니스 로직

**크기:** S (4 파일)  
**담당 시나리오:** Scenario 1·2·3의 로직 레이어 (UI 없음)

### 구현 대상

- `types/shuttle.ts` — 타입 정의
- `config/schedule.ts` — 샘플 정류장 3개, 양방향 노선 2개, 2026 공휴일 배열
- `lib/shuttle.ts` — 아래 함수 구현
  - `isServiceDay(date: Date): boolean` — 주말·공휴일 false
  - `getNextWeekday(date: Date): Date` — 다음 평일 반환
  - `getNextShuttles(from, to, now, max=3): ShuttleResult[]` — 남은 셔틀 최대 max개
  - `getNextServiceInfo(from, to, now): { date: Date; firstTime: string } | null` — 다음 운행일 첫 셔틀
- `lib/shuttle.test.ts` — 수용 기준 테스트

### 수용 기준

- [ ] 평일 14:12, "본관"→"연구동", 14:30·15:00·15:30 시간표 → `getNextShuttles` 결과 3개, 첫 번째 출발 시각 "14:30", 남은 분 18
- [ ] 평일 14:12, 남은 시간이 1분 미만(14:12:30 기준 14:12)인 셔틀 → `minutesRemaining`이 0이고 결과 목록에 **포함**됨 (제외 아님 — UI에서 "곧 출발" 표시용)
- [ ] 평일 23:00, 오늘 마지막 셔틀이 모두 지남 → `getNextShuttles` 빈 배열, `getNextServiceInfo` 다음 평일 날짜 + 첫 셔틀 시각 반환
- [ ] 토요일 → `isServiceDay` false
- [ ] 2026-01-01(신정) → `isServiceDay` false
- [ ] `getNextWeekday`(금요일) → 월요일 반환
- [ ] "본관"→"연구동" 시간표와 "연구동"→"본관" 시간표가 다른 경우 → 각각 독립된 결과 반환 (양방향 독립 노선 불변 규칙)

**검증:** `bun run test` (Vitest, 전체 통과)

---

## Task 2. 정류장 셀렉터 UI + 초기 화면

**크기:** M (3 파일)  
**담당 시나리오:** Scenario 4 (정류장 미선택), Scenario 5 (동일 정류장 방지)

### 구현 대상

- `components/shuttle-finder/stop-selector.tsx` — 출발/도착 Select 컴포넌트 쌍, `components/ui/select.tsx` 사용
- `components/shuttle-finder/shuttle-finder.tsx` (`"use client"`) — 상태 관리(from, to), StopSelector + 결과 영역 placeholder 조합
- `app/page.tsx` — 기존 ComponentExample 제거, `<ShuttleFinder />` 렌더링

### 수용 기준

- [ ] 출발 또는 도착 정류장 중 하나라도 미선택 → 셔틀 카드 없음, "출발지와 도착지를 선택하면 다음 셔틀을 안내해 드립니다" 문구 표시
- [ ] 출발 정류장 "본관" 선택 → 도착 드롭다운의 "본관" 항목이 비활성화(disabled)되어 선택 불가
- [ ] 도착 정류장 "연구동" 선택 → 출발 드롭다운의 "연구동" 항목이 비활성화
- [ ] `isServiceDay(today) === false` (주말·공휴일) → 드롭다운이 렌더링되지 않고 비운행 안내만 표시 (wireframe 화면 3과 일치)

**검증:** `bun run test` (`@testing-library/react`, jsdom)

---

## ✅ CHECKPOINT 1

> `bun run test` 전체 통과 + `bun run build` 성공  
> 브라우저에서 `/` 접속 → 두 드롭다운 표시, 미선택 시 안내 문구 확인

---

## Task 3. 셔틀 결과 카드 + 상태별 결과 화면

**크기:** M (3 파일)  
**담당 시나리오:** Scenario 1 (정상 조회), Scenario 2 (운행 종료), Scenario 3 (주말/공휴일)

### 구현 대상

- `components/shuttle-finder/shuttle-result.tsx` — 세 상태(정상·종료·비운행) 조건 분기 렌더링, `components/ui/card.tsx` 사용
- `components/shuttle-finder/shuttle-result.test.tsx` — 각 상태별 렌더링 테스트
- `components/shuttle-finder/shuttle-finder.tsx` 업데이트 — placeholder를 `<ShuttleResult />` 로 교체, `useEffect`로 매 분 현재 시각 갱신

### 수용 기준

- [ ] 평일 + 선택된 방향에 남은 셔틀 3개 → 카드 3개 표시, 각 카드에 출발 시각과 "N분 후" 표시
- [ ] 남은 시간 0분(`minutesRemaining === 0`)인 셔틀 → 해당 카드에 "N분 후" 대신 "곧 출발" 표시 (카드는 목록에서 제외하지 않음)
- [ ] 평일 + 오늘 모든 셔틀 통과 → "오늘 운행이 종료되었습니다" 표시 + 다음 운행일 첫 셔틀 시각 표시
- [ ] 주말 또는 공휴일 → 드롭다운 선택 여부와 무관하게 "오늘은 운행하지 않습니다" 표시 + 다음 평일 첫 셔틀 시각 표시

**검증:** `bun run test` (`@testing-library/react`, jsdom)

---

## ✅ CHECKPOINT 2 (최종)

> `bun run test` 전체 통과 + `bun run build` 성공  
> **Human review:** 브라우저에서 4개 화면 상태 수동 확인
>
> | 확인 항목 | 방법 |
> |---|---|
> | 정상 조회: 카드 3개 + 남은 시간 | 평일 시간대에 정류장 선택 |
> | "곧 출발": 출발 1분 내 카드 스타일 | 시간표 데이터를 현재 시각 ±1분으로 임시 조정 |
> | 운행 종료: 안내 메시지 | 마지막 셔틀 이후 시간으로 기기 시각 변경 또는 config 임시 수정 |
> | 주말: 비운행 안내 | 토요일로 기기 날짜 변경 또는 `isServiceDay` mock |

---

## 실행 순서 요약

```
Task 1  →  Task 2  →  CHECKPOINT 1  →  Task 3  →  CHECKPOINT 2
```
