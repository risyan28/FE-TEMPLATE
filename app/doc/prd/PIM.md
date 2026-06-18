# Product Requirement Document (PRD)

## Production Instruction Sequence Management System

### 1. Background

Saat ini Production Execution mengikuti sequence yang dikirim dari PI-NES setiap shift.

Namun pada kondisi aktual produksi, terdapat sejumlah Work In Progress (WIP) yang sudah berada di dalam line produksi sebelum sequence baru diproses.

WIP dapat berada pada beberapa lokasi:

- AGV Supply
- Conveyor
- Transfer Zone
- Machine Position
- Manual Buffer
- Intermediate Stock

Karena adanya WIP tersebut, sequence pertama yang harus diproses tidak selalu dimulai dari sequence pertama yang dikirim oleh PI-NES.

Sistem harus mampu menghitung offset sequence berdasarkan total WIP aktual di sepanjang line, menentukan sequence berikutnya yang harus diproses, memvisualisasikan posisi sequence di line, dan mengirimkan sequence ke mesin berdasarkan request aktual dari mesin.

---

### 2. Objectives

Sistem harus mampu:

1. Meminta (request) sequence produksi dari PI-NES via button-triggered sync.
2. Menginput WIP aktual secara manual per WIP point (MVP) atau dari PLC/sensor (Phase 2).
3. Menghitung offset sequence berdasarkan WIP aktual (snapshot-based).
4. Menentukan sequence berikutnya yang harus diproduksi.
5. Memvisualisasikan sequence yang sedang berada di dalam line (dengan WIP region highlighting).
6. Mengirim sequence ke mesin berdasarkan request signal dari mesin (Phase 2).
7. Menerima complete signal dari mesin (Phase 2).
8. Mengelola manual sequence injection (termasuk validasi dan approval).
9. Mendukung konfigurasi line secara dinamis tanpa perubahan source code.
10. Menyediakan traceability penuh untuk setiap keputusan sequence.

---

### 3. Architecture Boundary

**PI-NES** = Source of Truth (production sequence)
**PIM** = Execution Orchestrator (this system)
**Machine** = Consumer (PLC/machine yang mengerjakan sequence)

PIM **bukan** MES dan **bukan** Production Planning System.

PIM responsibilities:

1. Sync sequence from PI-NES
2. Calculate WIP offset (snapshot-based)
3. Generate executable queue
4. Merge local manual injection into queue
5. Wait for machine REQUEST signal
6. Dispatch next sequence
7. Wait for COMPLETE signal
8. Advance queue

**Machine Communication Protocol (3-step):**

```
REQUEST → SEND SEQUENCE → COMPLETE
```

- No REQUEST = no dispatch
- No COMPLETE = queue does not advance
- Current sequence remains SENT until COMPLETE received
- PROCESSING state is derived (optional), not signaled by machine

---

### 4. User Roles

#### MVP Roles (Phase 1)

| Role           | Responsibilities                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Operator**   | View line visualization, input WIP, submit injection request, sync NES, monitor production status                      |
| **Supervisor** | All Operator capabilities + approve/reject injections, force complete/retry, manual WIP override, manual offset recalc |

#### Phase 2 Roles (added on machine integration)

| Role                    | Responsibilities                                                              |
| ----------------------- | ----------------------------------------------------------------------------- |
| **Production Engineer** | Create/configure lines, configure WIP points, configure signal mapping        |
| **Automation Engineer** | Map PLC signals, monitor machine communication, set machine maintenance state |

---

### 5. Core Business Flow

```
PI-NES
  ↓
[1] NES Sync Request (user clicks "Sync NES" or auto-trigger on shift boundary)
  ↓
[2] Sequence Import (SequenceBatch received from NES API)
  ↓
[3] Queue Merge (identity-based NES + injection merge)
  ↓
[4] WIP Snapshot (capture WIP point occupancy — manual input or sensor)
  ↓
[5] Offset Calculation (nextSequence = queue[totalWip])
  ↓
[6] Queue Available (waiting for machine REQUEST)
  ↓
[7] Machine REQUEST signal received
  ↓
[8] Validate queue (not locked, next sequence exists)
  ↓
[9] Dispatch Sequence (send to machine, status → SENT)
  ↓
[10] Machine COMPLETE signal received
  ↓
[11] Mark COMPLETED, advance queue, unlock
  ↓
(back to step 6)
```

---

### 6. Production Line Management

#### Purpose

Menyediakan konfigurasi line secara dinamis.

#### Functional Requirement

User dapat:

- Menambah line baru (Production Engineer)
- Mengubah line
- Menonaktifkan line (soft delete)
- Mengatur urutan flow line (WIP point order)

#### Data

- Line Name
- Line Code
- Description
- Status (Active / Inactive)
- Production Area
- Created At / Updated At

---

### 7. WIP Point Configuration

#### Purpose

Mendefinisikan titik WIP yang digunakan untuk perhitungan offset sequence.

#### Functional Requirement

User dapat menambahkan WIP point types:

- AGV Supply
- Buffer
- Conveyor Position
- Machine Position
- Manual Zone

Tanpa perubahan source code. WIP points are ordered (position index determines flow).

#### Example: Cylinder Block Line

```
AGV Supply → Pos 7 → Pos 6 → Pos 5 → Pos 4 → Pos 3 → Manual Zone
```

Each point has:

- Name
- Type (enum)
- Position index (ordering)
- Occupied sequence (dynamic, updated from PLC/sensor)
- Status (Occupied / Empty / Unknown)

---

### 7.5 Manual WIP Input

#### Purpose

Memungkinkan operator untuk menginput jumlah WIP (occupied count) per WIP point secara manual melalui UI, sebagai primary source untuk offset calculation di MVP (PLC/sensor integration available di Phase 2).

#### Functional Requirement

Operator / Supervisor dapat:

- Input occupied count per WIP point pada line yang aktif
- Submit WIP snapshot (all points at once) untuk trigger offset recalculation
- View current WIP values per point (last submitted or last sensor update)
- Override sensor-based values (if sensor integration is active)

#### WIP Input UI

```
┌──────────────────────────────────────────────────────────────────┐
│  WIP Input — Cylinder Block Line                                 │
│                                                                  │
│  WIP Point            Occupied Count    Sequence Range (auto)    │
│  ───────────────────  ─────────────     ──────────────────────   │
│  AGV Supply           [  5  ] ▼         Seq 1–5                 │
│  Pos 7                [  1  ] ▼         Seq 6                   │
│  Pos 6                [  1  ] ▼         Seq 7                   │
│  Pos 5                [  0  ] ▼         —                       │
│  Pos 4                [  1  ] ▼         Seq 8                   │
│  Pos 3                [  0  ] ▼         —                       │
│  Manual Zone          [  2  ] ▼         Seq 9–10                │
│                                                                  │
│  Total WIP: 10    Next Sequence for Dispatch: Seq 11            │
│                                                                  │
│  [Submit WIP]    [Reset to Sensor Values]                        │
└──────────────────────────────────────────────────────────────────┘
```

> **Sequence Range:** Calculated automatically based on cumulative WIP. Each WIP point shows which sequences are occupying it. For example, AGV Supply has 5 occupied → it holds Seq 1–5. Pos 7 has 1 occupied → it holds Seq 6 (the 6th sequence). Total WIP = 10, so the next sequence available for dispatch = Seq 11 (queue[10]).

#### WIP Input Rules

| #   | Rule                                               | Violation Behavior         |
| --- | -------------------------------------------------- | -------------------------- |
| 1   | Occupied count must be ≥ 0                         | Validation error           |
| 2   | All WIP points must be filled before submit        | "Complete all WIP points"  |
| 3   | Submit triggers offset recalculation (snapshot)    | Implicit                   |
| 4   | Submit triggers `wip:recalculated` WebSocket event | Implicit                   |
| 5   | Previous snapshot preserved for audit              | Implicit                   |
| 6   | Only Operator/Supervisor on active line can input  | "Insufficient permissions" |
| 7   | Queue must not be LOCKED during submit             | "Queue locked, retry"      |

#### Data Source Priority (Phase 2)

| Priority | Source            | Condition                            |
| -------- | ----------------- | ------------------------------------ |
| 1        | Manual input      | Always, when submitted               |
| 2        | PLC/Sensor        | Auto, when sensor integration active |
| 3        | Previous snapshot | Fallback, when neither available     |

> **MVP:** Only manual input is available. PLC/sensor integration is Phase 2.

#### WipManualInput Entity

```typescript
type WipManualInput = {
  id: string
  lineId: string
  submittedBy: string // userId
  submittedAt: string // ISO timestamp
  points: {
    pointId: string
    pointName: string
    occupiedCount: number
    sequenceRange: {
      start: string | null // auto-calculated sequence ID range start
      end: string | null // auto-calculated sequence ID range end
    }
    source: 'manual' | 'sensor' | 'fallback'
  }[]
  totalWip: number
  nextSequenceForDispatch: string | null // queue[totalWip]
  triggerRecalc: boolean // always true for MVP
}
```

---

### 8. NES Sequence Sync

#### Purpose

Mengambil (pull) sequence produksi dari PI-NES dalam batch per shift.

> **Note:** PIM actively **requests** data from NES via button-triggered sync. PIM does NOT passively wait for NES to push data.

#### NES Sequence Data Structure

Each NES sequence entry contains:

```typescript
interface NesSequenceEntry {
  sequenceId: string // unique NES sequence identifier (e.g. "SEQ-2026-0611-S1-001")
  modelCode: string // product model / part type reference
  partNumber: string // specific part number
  variant?: string // optional variant code
  sequenceOrder: number // position in shift sequence (1-based)
}
```

> **Clarification:** NES sends ~800 entries per shift. Each entry represents one **sequence position** with a unique part/model assignment. The `sequenceId` is the primary key used for identity-based merge.

#### Sync Modes

| Mode            | Trigger                       | Description                                                |
| --------------- | ----------------------------- | ---------------------------------------------------------- |
| **Manual Sync** | User clicks "Sync NES" button | PIM sends request to NES API for current shift batch       |
| **Auto Sync**   | Shift boundary detection      | PIM automatically requests new shift batch on shift change |
| **Re-sync**     | Supervisor manual action      | Re-request latest batch from NES (e.g. after NES revision) |

#### Sync Request Flow

```
User clicks "Sync NES" button (or system triggers auto/re-sync)
  ↓
PIM sends HTTP request to NES API → GET /shift-sequence?line={lineId}&shift={shiftCode}
  ↓
NES responds with SequenceBatch data
  ↓
PIM validates checksum
  ↓
If valid → store with version, trigger queue merge
If invalid → reject, emit alert, log error
  ↓
Emit `batch:received` WebSocket event
```

#### Sync Failure Handling

| Scenario                  | Action                                                   |
| ------------------------- | -------------------------------------------------------- |
| NES API unreachable       | Retry up to 3 times (5s interval). Alert FE if all fail. |
| NES returns empty batch   | Log warning, do NOT clear existing queue. Alert FE.      |
| Checksum validation fails | Reject batch, emit alert, preserve existing queue.       |
| NES returns same checksum | Version stays, merge skipped (no-op).                    |
| NES returns revised batch | Version +1, old → `Merged`, proceed with identity merge. |

#### SequenceBatch Entity

```typescript
interface SequenceBatch {
  id: string // UUID
  lineId: string
  shiftCode: string // e.g. "2026-06-11-SHIFT1"
  receivedAt: string // ISO timestamp
  sequenceCount: number
  sequences: NesSequenceEntry[] // ordered list of NES sequence entries (not just IDs)
  status: 'Active' | 'Merged' | 'Archived' | 'Rejected'
  version: number // starts at 1, incremented per merge/re-sync
  previousVersionId: string | null // chain for traceability
  mergeEventIds: string[] // link to merge audit log
  checksum: string // SHA256 of sequences[] at creation
}
```

#### Version Rules

- `version` starts at 1 for each new shift batch
- Incremented every time NES re-sends or merges
- Identical batch (same shift, same sequences, same checksum) → version stays, merge skipped
- NES revision (same shift, different sequences) → version + 1, old status → `Merged`
- `previousVersionId` creates a traceable history chain

---

### 9. Queue Merge Strategy

#### Sources

1. **NES Sequence** — from SequenceBatch
2. **Local Injection** — from manual injection

#### Merge Rules

| Rule                        | Description                                                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Injection survives NES sync | Injections tagged `source: injection` persist across re-sync. Never removed by batch merge.                                                                       |
| Active sequence frozen      | SENT sequences cannot be reordered, removed, or replaced. Position frozen until COMPLETED.                                                                        |
| Completed immutable         | COMPLETED sequences are read-only. Never re-inserted, never re-sent.                                                                                              |
| NES identity-based merge    | New batch sequences matched by ID with existing queue. Existing (non-completed) preserved in place. New sequences appended after last non-completed NES sequence. |
| NES-removed sequences       | Sequences in queue (PLANNED only) not in new batch → marked "Removed by NES" (preserved for audit, strikethrough in UI). SENT/PROCESSING never removed.           |
| Queue version incremented   | Every merge increments `queue.version`. FE tracks version to detect stale data.                                                                                   |

#### Merge Flow Detail

```
1. New SequenceBatch arrives from NES
2. Build candidate queue:
   - Existing queue (frozen SENT + COMPLETED preserved)
   - New NES entries (identity-matched, then appended)
   - All active injections (interleaved at chosen positions)
3. Validate candidate:
   - No SENT/PROCESSING moved
   - No COMPLETED modified
   - No duplicate sequence IDs
4. If valid → replace current queue, increment version
5. If invalid → reject merge, emit alert, queue unchanged
6. Trigger WIP recalc (snapshot)
7. Emit `queue:updated` via WebSocket
```

#### Identity-Based Merge Example

```
Current Queue (before merge):
Pos 0: SEQ001 (SENT)      ← NES
Pos 1: RW001  (QUEUED)    ← INJECTION
Pos 2: SEQ002 (QUEUED)    ← NES
Pos 3: SEQ003 (QUEUED)    ← NES
Pos 4: SEQ004 (QUEUED)    ← NES

Incoming NES Batch: ["SEQ001", "SEQ002", "SEQ003", "SEQ004", "SEQ005", "SEQ006"]

After Identity Merge:
Pos 0: SEQ001 (SENT)      ← matched, preserved
Pos 1: RW001  (QUEUED)    ← injection, preserved
Pos 2: SEQ002 (QUEUED)    ← matched, preserved
Pos 3: SEQ003 (QUEUED)    ← matched, preserved
Pos 4: SEQ004 (QUEUED)    ← matched, preserved
Pos 5: SEQ005 (QUEUED)    ← new, appended
Pos 6: SEQ006 (QUEUED)    ← new, appended

If NES removed SEQ003:
Pos 0: SEQ001 (SENT)
Pos 1: RW001  (QUEUED)
Pos 2: SEQ002 (QUEUED)
Pos 3: SEQ003 (QUEUED)    ← "Removed by NES" (audit)
Pos 4: SEQ004 (QUEUED)
Pos 5: SEQ005 (QUEUED)    ← new
Pos 6: SEQ006 (QUEUED)    ← new
```

---

### 10. Queue State Machine

```
                    ┌────────────────────────────────┐
                    │                                │
                    v                                │
  ┌──────────┐  dispatch  ┌────────┐  request ┌──────┴─────┐
  │ PLANNED  │ ────────→  │ QUEUED │ ────────→│   SENT     │
  └──────────┘            └────────┘           └─────┬──────┘
       ↑                                              │
       │                                              │ COMPLETE
       │                                              v
       │                                       ┌──────────┐
       │                                       │COMPLETED  │ (terminal)
       │                                       └──────────┘
       │
       │ (on error)
       v
  ┌──────────┐
  │  ERROR   │ ──→ retry → QUEUED
  └──────────┘
```

#### Queue States

| State     | Meaning                                  | Transitions                           |
| --------- | ---------------------------------------- | ------------------------------------- |
| PLANNED   | From NES, before offset                  | → QUEUED                              |
| QUEUED    | Ready for dispatch, awaiting REQUEST     | → SENT, → ERROR                       |
| SENT      | Dispatched to machine, awaiting COMPLETE | → COMPLETED, → ERROR                  |
| COMPLETED | Done (terminal)                          | ∅                                     |
| ERROR     | Communication/processing error           | → QUEUED (retry), → COMPLETED (force) |

**PROCESSING state:** Removed from MVP. Phase 2: Optional, derived (not signaled by machine). If machine behavior allows detecting "processing started" (e.g. 10s after SEND with no COMPLETE), system may infer PROCESSING state. Never blocks queue advancement.

---

### 10.5 Sequence Visualization UI Specification

#### Purpose

Define how sequence data (up to 800 entries per shift) is displayed in the web UI.

#### Sequence List Display

| Aspect         | Specification                                                                              |
| -------------- | ------------------------------------------------------------------------------------------ | ----------- | ---------- | ------------ | ---------------------- | ------------- | ------- |
| Component      | `QueueTable` with virtual scroll (handles 800+ rows efficiently)                           |
| Columns        | Position #                                                                                 | Sequence ID | Model/Part | Status Badge | Source (NES/Injection) | Batch Version | Actions |
| Pagination     | Virtual scroll only (no traditional pagination) — smooth scrolling through all 800 entries |
| Row height     | Compact (40px) — enables quick scanning                                                    |
| Status Badges  | Color-coded: PLANNED (gray), QUEUED (blue), SENT (orange), COMPLETED (green), ERROR (red)  |
| Injection Flag | Icon indicator (⚡) for injected sequences, distinct from NES-sourced                      |
| Batch Version  | Tooltip on hover showing NES batch version & shift code                                    |

#### WIP Region Highlighting

The WIP region (sequences already consumed by WIP, not yet available for dispatch) must be visually distinct:

```
Queue Table Visual Layout:

┌──────────────────────────────────────────────────────────────┐
│  ■ WIP Region (offset 0–4, consumed by line WIP)            │
│    Pos 0: SEQ001  │ Model-A │ PLANNED │ ← gray, strikethrough │
│    Pos 1: SEQ002  │ Model-B │ PLANNED │ ← gray, strikethrough │
│    Pos 2: SEQ003  │ Model-A │ PLANNED │ ← gray, strikethrough │
│    Pos 3: SEQ004  │ Model-C │ PLANNED │ ← gray, strikethrough │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  ■ Active Queue (offset 4+, available for dispatch)          │
│    Pos 4: SEQ005  │ Model-A │ QUEUED  │ ← blue, bold          │
│    Pos 5: ⚡ RW001 │ Model-X │ QUEUED  │ ← blue, injected icon │
│    Pos 6: SEQ006  │ Model-B │ QUEUED  │ ← blue                │
│    ...                                                        │
│    Pos 799: SEQ800 │ Model-C │ PLANNED │ ← gray                │
└──────────────────────────────────────────────────────────────┘
```

| Visual Element      | WIP Region (consumed)                                 | Active Queue (available)           |
| ------------------- | ----------------------------------------------------- | ---------------------------------- |
| Background          | Subtle gray tint                                      | White / default                    |
| Text style          | Normal, slightly muted                                | Bold, full color                   |
| Sequence ID         | No strikethrough (still valid, just consumed)         | Normal rendering                   |
| Status badge        | PLANNED (gray)                                        | QUEUED (blue), SENT (orange), etc. |
| Divider             | Thick dashed line between WIP region and active queue | —                                  |
| WIP count indicator | "WIP Offset: 4" label above divider                   | —                                  |

#### Line Detail Header

The header of LineDetailPage must show key metrics prominently:

```
┌────────────────────────────────────────────────────────────────┐
│  Cylinder Block Line — LINE-A                                 │
│                                                               │
│  Current Batch: v3 (Shift 2026-06-11-SH1)    Next Seq: SEQ005│
│  WIP Offset: 4    Total WIP: 10    Queue Position: 5/800     │
│                                                               │
│  [Sync NES ▼]   [Input WIP]   [Inject Sequence]   [Recalc]  │
└────────────────────────────────────────────────────────────────┘
```

| Header Element | Source                            | Update Trigger         |
| -------------- | --------------------------------- | ---------------------- |
| Current Batch  | Latest SequenceBatch              | On sync/re-sync        |
| Next Sequence  | queue[totalWip] from offset calc  | On WIP recalc          |
| WIP Offset     | totalWip from latest snapshot     | On WIP recalc          |
| Total WIP      | Sum of occupied WIP points        | On WIP input / recalc  |
| Queue Position | Current dispatch position / total | On dispatch / complete |

#### Toolbar Buttons (MVP)

| Button              | Action                          | Permission           |
| ------------------- | ------------------------------- | -------------------- |
| **Sync NES**        | Trigger manual NES sync request | Operator, Supervisor |
| **Input WIP**       | Open WIP Input modal            | Operator, Supervisor |
| **Inject Sequence** | Open Inject modal (single-form) | Operator, Supervisor |
| **Recalc Offset**   | Manual offset recalculation     | Supervisor only      |

---

### 11. WIP Offset Engine (Snapshot-Based)

#### Purpose

Menghitung sequence awal berdasarkan kondisi aktual line.

#### Recalculation Triggers (Snapshot-based)

| Trigger                  | Fire Policy                            |
| ------------------------ | -------------------------------------- |
| New NES batch received   | After merge complete                   |
| WIP manual input         | After operator submits WIP snapshot    |
| Shift change             | On shift boundary detection            |
| Line restart             | On system restart / line re-activation |
| Supervisor manual action | On-demand via "Recalc Offset" button   |

**No auto-recalculation** on COMPLETE, Injection, or continuous WIP changes.

#### Functional Requirement

System shall:

- Read WIP point occupancy from latest snapshot
- Calculate total WIP = count of occupied WIP points
- Determine next sequence = queue[totalWip]
- Log recalc event with all WIP point values

#### Separate Concerns

| Concern                  | Mechanism                               | Update Frequency   |
| ------------------------ | --------------------------------------- | ------------------ |
| Live WIP visualization   | Real-time PLC/sensor push via WebSocket | Continuous         |
| Queue offset calculation | Snapshot-based recalculation            | On 4 triggers only |

#### Example

```
AGV Supply = 5 (occupied)  → holds Seq 1–5  (cumulative: 5)
Buffer     = 3 (occupied)  → holds Seq 6–8  (cumulative: 8)
Machine    = 2 (occupied)  → holds Seq 9–10 (cumulative: 10)
Total WIP  = 10
Next Sequence for Dispatch = queue[10] = Seq 11
```

Each area consumes sequences sequentially. The sequence range per WIP point is calculated as:

- For WIP point at position `i` with occupied count `n`:
  - Start sequence = `queue[cumulativeWipBefore + 1]`
  - End sequence = `queue[cumulativeWipBefore + n]`
- Where `cumulativeWipBefore` = sum of occupied counts of all WIP points before point `i` in flow order

#### WipRecalcEntry

```typescript
type WipRecalcEntry = {
  timestamp: string
  trigger: 'batch' | 'wip-input' | 'shift' | 'restart' | 'manual'
  lineId: string
  wipSnapshot: {
    pointId: string
    pointName: string
    occupiedCount: number
    sequenceRange: {
      start: string | null // first sequence ID occupying this point
      end: string | null // last sequence ID occupying this point
    }
    cumulativeWipBefore: number // sum of all previous WIP points' occupied counts
  }[]
  totalWip: number
  calculatedOffset: number
  nextSequence: string | null
  queueVersion: number
}
```

---

### 12. Machine Dispatch & Completion

#### Purpose

Mengelola komunikasi dengan machine: receive REQUEST → dispatch → receive COMPLETE.

#### Protocol

```
Machine → PIM: REQUEST signal
PIM     → Machine: SEND sequence (sequence ID + model)
Machine → PIM: COMPLETE signal
```

#### Functional Requirement

System shall:

- Listen for machine REQUEST signal (PLC tag / API / WebSocket)
- Validate queue is not LOCKED
- Get next QUEUED sequence
- Dispatch sequence to machine
- Update sequence status → SENT
- Set queue LOCKED
- Start dispatch timeout timer
- Listen for COMPLETE signal
- Mark sequence COMPLETED
- Remove lock, advance queue

#### Dispatch Timeout

| Parameter       | Value                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Default timeout | 5 minutes (configurable per line)                                     |
| Action          | Alert only — no auto-advance, no re-dispatch                          |
| Alert channel   | FE toast + SignalMonitor badge + audit log                            |
| Escalation      | 3 consecutive timeouts on same machine → persistent Supervisor banner |
| Retry           | Manual (Supervisor: "Force Complete" or "Retry Send")                 |

#### Machine States

```
ONLINE
  ├── IDLE           → waiting for REQUEST
  ├── REQUESTING     → REQUEST sent, awaiting dispatch
  ├── PROCESSING     → dispatched (inferred after SEND)
  └── COMPLETING     → COMPLETE sent, awaiting queue advance
OFFLINE
  ├── DISCONNECTED   → no signal received > threshold (configurable, default 30s)
  ├── ERROR          → protocol/message error
  └── MAINTENANCE    → manually set by Automation Engineer
```

Rules:

- OFFLINE machine cannot trigger dispatch
- DISCONNECTED is automatic after signal timeout
- MAINTENANCE is manual
- State transitions logged

#### Signal Mapping Configuration

| Field                   | Description                       |
| ----------------------- | --------------------------------- |
| Machine ID              | Target machine                    |
| REQUEST Signal Address  | PLC tag / register for request    |
| COMPLETE Signal Address | PLC tag / register for completion |

(No ACK signal — removed from protocol.)

---

### 13. Manual Sequence Injection

#### Purpose

Memungkinkan user menyisipkan sequence khusus ke line tertentu.

#### Functional Requirement

Authorized user can:

- Insert manual sequence via contextual modal (from Line Detail page)
- Select insertion position (after sequence X, or end of queue)
- Specify injection type
- Provide reason
- Submit for approval (if required)

#### Injection Types

- Rework
- Quality Recovery
- Trial
- Engineering Test
- Urgent Production (requires Supervisor approval)

#### Injection Validation Rules

| #   | Rule                                                      | Violation Behavior                     |
| --- | --------------------------------------------------------- | -------------------------------------- |
| 1   | Sequence ID must not already exist in queue (any status)  | "Sequence already in queue"            |
| 2   | Sequence ID must not match COMPLETED sequence in last 24h | "Completed within 24h"                 |
| 3   | Position must be after current SENT sequence              | "Cannot insert before active sequence" |
| 4   | Position must be after last COMPLETED sequence            | "Cannot insert into completed region"  |
| 5   | Max 5 pending injections per line per shift               | "Injection limit reached"              |
| 6   | Injection type required                                   | Form validation                        |
| 7   | Reason text required (min 10 chars) for non-Urgent        | Form validation                        |
| 8   | Urgent Production requires Supervisor approval            | Auto-pend to approval queue            |
| 9   | Line must be ACTIVE                                       | "Line is disabled"                     |
| 10  | Queue must not be LOCKED                                  | "Queue locked, retry"                  |
| 11  | Single sequence per injection (no batch injection in MVP) | Implicit                               |

#### Scope

- Injection only affects selected line
- Does NOT modify PI-NES Master Sequence
- Does NOT affect other lines
- Injection survives NES re-sync (per Merge Rules)

---

### 14. Sequence Decision Traceability

#### Purpose

Melacak dan menjelaskan alasan di balik setiap keputusan sequence yang dibuat sistem.

#### Traceable Events

- Batch received (with version)
- Queue merge (added/removed/preserved sequences)
- WIP recalc (snapshot values, offset, next sequence)
- Sequence dispatched (to which machine, timestamp)
- Sequence completed (duration)
- Injection created / approved / rejected / resolved
- Queue locked / unlocked
- Dispatch timeout
- Machine state change
- NES re-sync

#### Data Display per Sequence

User dapat melihat:

- NES source batch & version
- Current WIP at decision time
- Offset calculation result
- Queue position at decision time
- Dispatch timestamp + machine
- Completion timestamp + duration
- Injection reason (if applicable)

---

### 15. Signal Monitoring

#### Purpose

Monitoring komunikasi antara system dan machine.

#### Functional Requirement

Monitor:

- Machine status (per state machine)
- Last REQUEST signal time
- Last COMPLETE signal time
- Communication health (ONLINE/OFFLINE duration)
- Dispatch timeout count (per machine)
- Signal log (timestamp, direction, payload)
- Consecutive timeout counter

(ACK signal removed.)

---

### 16. Audit Trail

#### Purpose

Melacak seluruh aktivitas sistem untuk compliance dan troubleshooting.

#### Logged Activities

- Sequence dispatched
- Sequence completed
- Dispatch timeout
- Injection created / approved / rejected
- Line configuration changed
- WIP point added / removed / reordered
- Signal mapping changed
- Machine state changed (including OFFLINE transitions)
- NES batch received / merged / rejected
- **NES sync request** (manual, auto, re-sync — with trigger type and result)
- **NES sync failure** (retry count, error details)
- WIP recalculated
- **WIP manual input submitted** (who, values, trigger)
- Queue merged
- User login / logout
- RBAC permission change

---

### 17. Non-Functional Requirements

| Category       | Requirement                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| Performance    | Response time < 1 second (API)                                                     |
| Real-time      | WebSocket push for queue updates, WIP visualization, machine state                 |
| Availability   | 99.9% (planned maintenance window)                                                 |
| Scalability    | Support dynamic line creation without code changes                                 |
| Security       | RBAC per role (MVP: Operator, Supervisor. Phase 2: + Prod Engineer, Auto Engineer) |
| Auditability   | All production actions traceable                                                   |
| Data retention | Queue history: 30 days. Audit log: 1 year.                                         |

---

### 18. WebSocket Event Catalog

| Event                 | Direction        | Payload                                              |
| --------------------- | ---------------- | ---------------------------------------------------- | ------ | ------------ |
| `sync:nes:request`    | UI → System      | `{ lineId, shiftCode, trigger: 'manual'              | 'auto' | 're-sync' }` |
| `sync:nes:success`    | System → UI      | `{ lineId, batchId, sequenceCount, version }`        |
| `sync:nes:failed`     | System → UI      | `{ lineId, error, retryCount }`                      |
| `sequence:request`    | Machine → System | `{ lineId, machineId }`                              |
| `sequence:dispatched` | System → UI      | `{ lineId, sequence, machineId }`                    |
| `sequence:complete`   | Machine → System | `{ lineId, sequenceId, status }`                     |
| `queue:updated`       | System → UI      | `{ lineId, queue[], offset, version }`               |
| `wip:recalculated`    | System → UI      | `{ lineId, wipPoints[], totalWip, offset, trigger }` |
| `wip:input:submitted` | UI → System      | `{ lineId, points[], totalWip, submittedBy }`        |
| `batch:received`      | System → UI      | `{ lineId, batch }`                                  |
| `batch:merged`        | System → UI      | `{ lineId, batchId, changes[] }`                     |
| `injection:created`   | System → UI      | `{ lineId, injection }`                              |
| `injection:resolved`  | System → UI      | `{ lineId, injectionId, status }`                    |
| `machine:status`      | System → UI      | `{ lineId, machineId, status }`                      |
| `line:status`         | System → UI      | `{ lineId, status, activeSequence }`                 |

---

### 19. RBAC → Feature Mapping

#### MVP (Phase 1) — 2 Roles

| Feature                  | Operator   | Supervisor           |
| ------------------------ | ---------- | -------------------- |
| View Line Overview       | ✓          | ✓                    |
| View Line Detail (Queue) | ✓          | ✓                    |
| Input WIP                | ✓          | ✓                    |
| Sync NES (Button)        | ✓          | ✓                    |
| Inject Sequence          | ✓ (submit) | ✓ (submit + approve) |
| Approve Injection        | —          | ✓                    |
| Force Complete / Retry   | —          | ✓                    |
| Manual Offset Recalc     | —          | ✓                    |
| Create/Manage Lines      | —          | ✓ (Phase 1 only)     |
| View Traceability        | ✓          | ✓                    |

#### Phase 2 — 4 Roles

| Feature                  | Operator   | Supervisor           | Prod Engineer | Auto Engineer |
| ------------------------ | ---------- | -------------------- | ------------- | ------------- |
| View Line Overview       | ✓          | ✓                    | ✓             | ✓             |
| View Line Detail (Queue) | ✓ (read)   | ✓                    | ✓             | ✓             |
| Input WIP                | ✓          | ✓                    | —             | —             |
| Sync NES (Button)        | ✓          | ✓                    | —             | —             |
| Inject Sequence          | ✓ (submit) | ✓ (submit + approve) | —             | —             |
| Approve Injection        | —          | ✓                    | —             | —             |
| Force Complete / Retry   | —          | ✓                    | —             | —             |
| Configure WIP Points     | —          | —                    | ✓             | —             |
| Configure Signal Mapping | —          | —                    | ✓             | ✓             |
| Set Machine Maintenance  | —          | —                    | —             | ✓             |
| View Signal Monitor      | ✓          | ✓                    | ✓             | ✓             |
| View Traceability        | ✓          | ✓                    | ✓             | ✓             |
| Create/Manage Lines      | —          | —                    | ✓             | —             |

---

### 20. Frontend Route Structure

```
/dashboard-user
  /manufacture
    /                              → LineOverview (default active line)
    /lines                         → LineList
    /lines/:lineId                 → LineDetail (visualization + queue table)
    /lines/:lineId/config          → LineConfig (WIP points, signal mapping)
    /lines/:lineId/monitor         → SignalMonitor
    /lines/:lineId/trace/:seqId    → SequenceTrace (optional slide-over)
    /traceability                  → DispatchHistory (all lines)
```

**Injection:** Contextual modal (`<InjectDialog />`), not a page. MVP: single-form modal. Phase 2: 4-step wizard. Opened from LineDetail toolbar.

---

### 21. Component Hierarchy

#### MVP (Phase 1)

```
ManufactureLayout
├── LineSelectorDropdown
├── LineDetailPage
│   ├── LineDetailHeader (info, batch version, next sequence, toolbar)
│   │   ├── SyncNesButton
│   │   ├── InputWipButton
│   │   ├── InjectSequenceButton
│   │   └── RecalcOffsetButton (Supervisor only)
│   ├── LineFlowVisualization
│   │   ├── WIPPointCard[] (occupied count + sequence range per point)
│   │   └── FlowArrow
│   └── QueueSection (collapsible)
│       ├── QueueFilters (status, source)
│       ├── QueueTable → QueueRow (virtual scroll, status badge, injected flag, WIP region divider)
│       └── QueueStats (total, offset, active position)
├── LineConfigPage
│   ├── WIPPointConfig (drag-reorderable list + form)
│   └── LineSettings
├── WipInputDialog (modal — input occupied count per WIP point)
├── InjectDialog (modal — single-form MVP: position, type, reason, confirm in one view)
└── TraceabilityPage
    ├── DispatchHistoryTable → DispatchEventRow
    └── SequenceTracePanel (slide-over) → TraceTimeline
```

#### Phase 2 (added components)

```
├── LineConfigPage
│   └── SignalMappingConfig (REQUEST + COMPLETE only)
├── SignalMonitorPage
│   ├── MachineStatusGrid → MachineCard
│   └── SignalLogTable
├── InjectDialog (upgrade to 4-step wizard: position → details → reason → confirm)
└── MachineStatusIndicator (in LineFlowVisualization)
```

---

### 22. MVP Scope

#### MVP (Phase 1) — Core Display & WIP Management

Focus: **Display sequence data, input WIP, sync NES, inject manual sequence**.

| Feature                         | Detail                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| Line CRUD                       | Create, edit, deactivate lines (Production Engineer)                                      |
| WIP Point Configuration         | Dynamic WIP points per line, drag-reorder, no code change                                 |
| **Manual WIP Input**            | Operator/Supervisor input occupied count per WIP point via UI                             |
| **NES Sync (Button-triggered)** | "Sync NES" button → PIM pulls shift batch from NES API                                    |
| SequenceBatch with versioning   | Version, checksum, previousVersionId chain                                                |
| Queue Engine                    | Identity-based NES merge, injection merge                                                 |
| Queue State Machine             | 4 clean states: PLANNED → QUEUED → SENT → COMPLETED / ERROR                               |
| **Manual Injection**            | Single-form modal, 11 validation rules, approval flow                                     |
| WIP Offset Engine               | Snapshot-based, 4 triggers (batch, shift, restart, manual)                                |
| Sequence Visualization          | Table with virtual scroll, WIP region highlighting, status badges                         |
| Audit Trail                     | All production actions logged                                                             |
| RBAC                            | **2 roles MVP**: Operator (view + input + inject) + Supervisor (all + approve + override) |
| WebSocket                       | Real-time queue, WIP, batch events                                                        |

> **MVP simplification:** No machine communication, no PLC integration, no signal monitor. Offset is based on **manual WIP input**. Queue advancement is manual (Supervisor "Force Complete" or auto on NES re-sync).

#### Phase 2 — Machine Integration & Advanced Features

| Feature                        | Detail                                                              |
| ------------------------------ | ------------------------------------------------------------------- |
| Machine Communication Protocol | REQUEST → SEND → COMPLETE (3-step)                                  |
| Machine State Machine          | ONLINE/OFFLINE with sub-states (IDLE, REQUESTING, PROCESSING, etc.) |
| PLC/Sensor Integration         | Auto WIP occupancy from sensors, override manual input              |
| Signal Mapping Configuration   | REQUEST + COMPLETE PLC tag/register mapping                         |
| Dispatch Timeout               | 5min configurable, alert-only, Supervisor escalation                |
| Signal Monitor                 | Machine status grid, signal log, timeout counter                    |
| PROCESSING State               | Derived (optional), inferred after SEND                             |
| RBAC expansion                 | Add Production Engineer + Automation Engineer roles                 |
| InjectDialog wizard            | 4-step wizard (position → details → reason → confirm)               |
| Shift Transition Handling      | Auto queue freeze on shift boundary, carry-over rules               |

#### Excluded (All Phases)

- Quality Hold
- Rework Tracking
- Serial Tracking
- Production Orders
- OEE
- AGV Tracking
- Parallel Machine Dispatch
- Multi-machine Scheduling

---

### 23. Success Metrics

| Metric                                    | Target                                          |
| ----------------------------------------- | ----------------------------------------------- |
| Zero manual spreadsheet sequence tracking | Complete elimination of manual tracking methods |
| Real-time visibility of active sequence   | < 5s delay from WIP input to UI update          |
| Accurate sequence dispatch based on WIP   | 100% offset accuracy vs manual verification     |
| Reduced production mis-sequence           | < 1 mis-sequence incident per month             |
| Faster troubleshooting & recovery         | < 10min from issue detection to resolution      |
| Audit trail completeness                  | 100% of production events traceable             |
| NES sync reliability                      | > 99% successful sync rate per shift            |

---

### 24. Shift Transition Handling (Phase 2)

> **MVP Note:** Shift transition is handled manually — Supervisor triggers re-sync via "Sync NES" button when shift changes. Phase 2 adds automatic shift boundary detection.

#### Phase 2 Spec

| Event                    | Action                                                      |
| ------------------------ | ----------------------------------------------------------- |
| Shift boundary detected  | Auto-trigger NES sync request for new shift                 |
| New shift batch received | Merge into queue (identity-based), reset offset             |
| Carry-over sequences     | Non-completed sequences from previous shift remain in queue |
| Completed sequences      | Archived, no longer active in new shift queue               |
| WIP snapshot reset       | New WIP snapshot taken after shift merge                    |

#### Carry-over Rules

- SENT sequences from previous shift → remain SENT, await COMPLETE
- QUEUED sequences from previous shift → re-evaluate after new batch merge
- Injections from previous shift → preserved (survive NES re-sync per merge rules)
