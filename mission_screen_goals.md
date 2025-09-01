# Mission Screen Development Goals

This document summarizes the current goals and understanding regarding the "미션 목록" (Mission List) and "미션" (Mission Detail) screens in the HometownON application, based on recent discussions.

## 1. "미션 목록" (MissionCardGameScreen)

**Current State:**
*   The `MissionCardGameScreen` successfully fetches mission data from the backend API (`/api/missions`).
*   It displays mission cards using the `mission1.png` image for all cards.
*   The `status` field for each mission is currently defaulting to 'available' on the frontend, as the backend is not yet reliably providing this field.
*   The screen is currently rendering basic text information (title, description, status, image URL) for each mission.

**Goal:**
*   The primary goal for this screen is to ensure the full, original complex rendering of the mission cards is working correctly, including images and conditional styling based on status.
*   The secondary goal is to ensure all mission cards are clickable and navigate to the "미션" (Mission Detail) screen.

## 2. "미션" (MissionDetailScreen)

**Current State:**
*   This screen is intended to display the details of a selected mission.
*   It is currently accessed when a mission card with `status: 'today'` is clicked in `MissionCardGameScreen`.

**Goal:**
*   Ensure that *any* mission card click in `MissionCardGameScreen` successfully navigates to `MissionDetailScreen`.
*   The `MissionDetailScreen` should receive the full mission data (e.g., the `card` object) as navigation parameters.
*   Further development on the `MissionDetailScreen` (e.g., displaying mission steps, location details, completion logic) will commence once the navigation and basic display are confirmed.

## Current Challenges & Next Steps

**Primary Challenge:**
*   The `MissionCardGameScreen` is currently not rendering the full complex card UI, despite the data being present. This indicates a rendering issue within the `renderCard` function or its dependencies.

**Immediate Next Steps:**
1.  **Revert `MissionCardGameScreen.js` to its state where `renderCard` is the original complex version and `handleCardPress` has the `locked`/`completed` checks.** This will be done by overwriting the file with a known good state.
2.  **Then, modify `handleCardPress` to remove the `locked`/`completed` checks and always navigate to `MissionDetailScreen`**, passing the full `missionData`.

This approach aims to restore the intended UI for the mission list and enable navigation to the detail screen for all cards.
