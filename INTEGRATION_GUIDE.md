# RailSetu Production API Integration Guide

This guide describes the clean architecture integration of real-world Indian Railways data interfaces into the **RailSetu** application.

---

## 🏛️ Application Architecture Overview

RailSetu is designed using clean architecture separating the Presentation (UI), Domain, and Data Layers. This separates our user interface views from live networking servers, supporting extreme reliability, caching, backoffs, and proper error handling.

```
┌────────────────────────────────────────────────────────┐
│                   Presentation Layer                   │
│        (src/components/simulatedScreens.tsx)           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                    Repository Layer                    │
│        (src/repositories/RailwayRepository.ts)         │
│  - Exponential Retries   - Network Timeout Policies    │
│  - Local Cache (TTL)     - Offline Connection Guards   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                     Service Layer                      │
│         (src/services/RailwayService.ts)               │
│  - Defined contracts & live placeholders for central  │
│    transit database registers                          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Express Proxy Node                   │
│                      (server.ts)                       │
│  - Server-Side route handling                          │
│  - Hiding sensitive RAPID_API keys from the browser    │
└────────────────────────────────────────────────────────┘
```

---

## ⚙️ Key Integration Points

### 1. The Service Contract: `src/services/RailwayService.ts`
All central transit operations conform to the `RailwayService` contract interface. Placeholders exist here for all 7 primary utility screens:

```typescript
export interface RailwayService {
  getPnrStatus(pnrNumber: string): Promise<PNRStatus>;
  getLiveTrainStatus(trainNo: string): Promise<LiveTrainStatus>;
  searchTrains(fromStation: string, toStation: string, date: string): Promise<Train[]>;
  getTrainSchedule(trainNo: string): Promise<any>;
  checkSeatAvailability(
    trainNo: string,
    fromCode: string,
    toCode: string,
    date: string,
    classType: string,
    quota?: string
  ): Promise<ClassSeatAvailability>;
  getFareEnquiry(
    trainNo: string,
    fromCode: string,
    toCode: string,
    classType: string,
    quota?: string
  ): Promise<FareBreakdown>;
  getCoachPosition(trainNo: string): Promise<any>;
}
```

To bind a new custom API service, simply modify the implementation class `RailwayServiceImpl` in `src/services/RailwayService.ts`.

### 2. High-Resilience Policies: `src/repositories/RailwayRepository.ts`
The repository acts as the single source of truth for the presentation screens. It intercepts all service calls to enforce:
* **ConnectionGuard:** Pre-checks cellular link before network transmissions.
* **Auto-Retries:** Automatically retries up to 3 times on transmission interruptions using exponential backoff.
* **Timeouts:** Restricts queries to a 12-second terminal limit (matching high-grade mobile application guidelines).
* **Caching with TTL:** Prevents hammering live endpoints by caching query responses inside the local database with screen-specific TTL rules.

### 3. Server-Side Secret Management: `server.ts`
To prevent leaking sensitive API keys, the client makes local relative requests to `/api/...` paths. These are captured by the Express server, which appends secrets from `.env` and proxies them to Indian Railways API gateways:

```env
# Define this variable inside your secure .env file
RAILWAY_API_KEY=your_rapidapi_key_here
```

The Express middleware `checkRailwayApiKey` guarantees graceful authentication checks:
```typescript
if (!apiKey || apiKey === 'your_rapidapi_key_here' || apiKey.trim() === '') {
  return res.status(401).json({
    success: false,
    code: 'API_KEY_MISSING',
    error: 'API Key Not Configured',
    message: 'RailSetu live transit query engine is ready! Please configure "RAILWAY_API_KEY" inside your .env file.'
  });
}
```

---

## 🛡️ Error Treatment and Unavailable Fallback State

If any query fails (e.g., due to missing keys, server downtime, offline cellular connectivity, or expired credentials), RailSetu catches the failure and displays a standardized human-readable alert:

> **"Railway information is currently unavailable. Please try again later."**

This is uniformly handled across all 7 screens:
1. **PNR Screen:** Triggers if PNR checking fails or returns non-authorized responses.
2. **Live Train Tracking:** Displays if GPS telemetry cannot be resolved.
3. **Train Search:** Renders if station routes return missing/failed lists.
4. **Train Schedule:** Triggers if stops/timetable records are currently unreachable.
5. **Seat Availability:** Shown if quotas/GNWL availability logs cannot be queried.
6. **Fare Enquiry:** Fails safely if the tariff matrices are offline.
7. **Coach Position:** Renders if the train rake composition can't be found.

---

## 🚀 Transitioning to Live Production

To transition from the current preparation mode to full production:
1. Acquire a valid rapid API plan or internal CRIS/IRCTC gateway access.
2. Update the backend proxy targets in `server.ts` to match your provider's specific API schemas.
3. Add the API credentials to your runtime environment (e.g. `RAILWAY_API_KEY=...`).
4. Keep the UI screens completely unchanged: they will automatically start rendering beautiful live railway listings, and handle any connection interruptions gracefully!
