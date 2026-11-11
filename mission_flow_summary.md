# HometownON 미션 시스템 요약

이 문서는 현재 하드코딩된 데이터를 기반으로 한 HometownON 앱의 미션 시스템 구조와 흐름을 요약합니다.

## 1. 미션 현황 화면 (MissionListScreen.js)

*   **역할:** 사용자의 전체 미션 진행 상황(레벨, 경험치)과 미션 유형별 목록을 보여줍니다.
*   **주요 데이터:**
    *   `userLevel`, `totalExp`, `currentExp`: 사용자의 레벨 및 경험치.
    *   `missionTypes` 배열:
        *   **탐색형 미션:** 새로운 장소 탐험 (`icon: '🎲'`)
        *   **유대형 미션:** 지역 주민과의 관계 (`icon: '🤝'`)
        *   **커리어형 미션:** 새로운 기술/경험 (`icon: '💼'`)
        *   각 미션 유형은 `title`, `description`, `icon`, `level`, `color`, `completed`, `total`, `expReward`, `progress` 등의 속성을 가집니다.
*   **내비게이션:** 각 미션 유형 카드를 터치하면 `MissionCardGameScreen`으로 이동하며, 해당 미션 유형(`type`)을 파라미터로 전달합니다.
    *   예: `navigation.navigate('MissionCardGame', { type: '탐색' });`

## 2. 미션 카드 게임 화면 (MissionCardGameScreen.js)

*   **역할:** 특정 미션 유형(예: 탐색형)에 해당하는 개별 미션 카드들을 그리드 형태로 보여줍니다.
*   **주요 데이터:**
    *   `cards` 배열: 하드코딩된 개별 미션 카드 데이터. 각 카드는 `id`, `title`, `description`, `type`, `status`, `image`, `todayImage`, `completedImage` 등의 속성을 가집니다.
*   **미션 상태 (`status`) 및 동작:**
    *   **`'locked'` (잠김):**
        *   카드에 잠금 아이콘(🔒) 오버레이가 표시됩니다.
        *   카드의 제목과 설명 텍스트가 흐리게(lockedText) 표시됩니다.
        *   카드를 터치해도 아무런 동작을 하지 않습니다 (`disabled` 처리).
    *   **`'today'` (오늘의 미션):**
        *   카드에 "오늘의 미션" 배지가 표시됩니다.
        *   카드를 터치하면 `MissionDetailScreen`으로 이동합니다. (`handleCardPress` 함수에서 `navigation.navigate('MissionDetail', { ... });`)
        *   `getCardImage` 함수는 `todayImage`를 반환합니다.
    *   **`'completed'` (완료됨):**
        *   카드에 "✅ 완료" 오버레이가 표시됩니다.
        *   카드를 터치해도 아무런 동작을 하지 않습니다 (`disabled` 처리).
        *   `getCardImage` 함수는 `completedImage` (별 모양 이미지: `mission_complete.png`)를 반환합니다.
*   **내비게이션:** `status`가 `'today'`인 미션 카드를 터치하면 `MissionDetailScreen`으로 이동합니다.

## 3. 미션 상세 화면 (MissionDetailScreen.js)

*   **역할:** 선택된 미션의 상세 정보, 지도, 미션 시작/완료 버튼 등을 제공합니다.
*   **주요 데이터:**
    *   `route.params`에서 `type` (예: 'exploration')을 받아옵니다.
    *   `getMissionData()` 함수: `type`에 따라 미션의 `title`, `address`, `instruction`, `icon`, `coordinates` (위도/경도) 등의 상세 정보를 하드코딩하여 반환합니다. (예: 'exploration' 타입일 때 "나의 모교 초등학교 방문하기" 정보 제공)
*   **주요 기능:**
    *   **지도 표시:** `react-native-maps`를 사용하여 미션 장소의 지도를 중앙에 표시하고 마커를 찍습니다.
    *   **미션 시작/완료 버튼:**
        *   `handleStartMission`: 미션 시작 시 타이머를 활성화합니다.
        *   `handleCompleteMission`: 미션 완료 시 `MissionCompleteScreen`으로 이동합니다. (참고: `MissionCompleteScreen` 파일은 현재 프로젝트에 존재하지 않습니다.)
    *   **타이머:** 탐색형 미션의 경우, 미션 시작 후 경과 시간을 표시합니다.
    *   **장소 정보:** 지도 아래에 미션 장소의 주소가 표시됩니다.

## 미션 흐름 요약

1.  **홈 화면 하단 탭에서 "미션현황" 선택**
    *   `MissionListScreen.js` 로 이동.
2.  **`MissionListScreen`에서 미션 유형 카드 선택 (예: "탐색형 미션")**
    *   `MissionCardGameScreen.js` 로 이동하며, 선택된 미션 유형(`type`)을 파라미터로 전달.
3.  **`MissionCardGameScreen`에서 개별 미션 카드 선택**
    *   `status`가 `'today'`인 카드만 터치 가능.
    *   터치 시 `MissionDetailScreen.js` 로 이동하며, 미션 상세 정보(`type`, `cardId`, `isTodayMission`)를 파라미터로 전달.
4.  **`MissionDetailScreen`에서 미션 수행**
    *   "미션 시작" 버튼을 눌러 타이머 시작.
    *   "미션 완료" 버튼을 눌러 미션 완료 처리.
    *   미션 완료 시 `MissionCompleteScreen`으로 이동 시도 (현재 파일 누락).
