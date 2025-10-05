# DICOM Sorter v1.1

Client‑side DICOM file sorter with optional header de‑identification. Sorts by type, date, time, and frame‑of‑reference (FoR), presents a live preview of the planned output tree, then saves either to a local folder (fast, streaming) or as a ZIP (with progress).

- Type · Date · Time · FoR sorting (keeps related objects together)
- Duplicates removed by SOPInstanceUID (keep first, skip the rest)
- Optional header de‑identification (PS3.15‑aligned; header‑only subset)
- Electron desktop build for Windows, macOS and Linux


## Table of Contents

- Overview
- Quick Start
  - Open in a browser
  - Desktop app (Electron)
- Usage
  - Directory selection and preview
  - Saving (Save To Folder vs ZIP)
- Sorting Rules and Tree Layout
- Filenames and Series Folders
- Optional De‑identification (Header Only)
- Browser Support and Requirements
- Troubleshooting
- Development and Build
- Open Source Licenses
- Disclaimer


## Overview

This tool organizes DICOM datasets into a folder tree that preserves context and makes downstream import/registration easier. It buckets by day (D0, D1, …), then clusters within each day by the FrameOfReferenceUID (FoR) to keep items in the same spatial frame (e.g., CT with RS/RP/RD). A live, hierarchical preview shows what will be written before any files are saved.

Optionally, it can de‑identify common header fields in a way aligned with DICOM PS3.15 Basic Application Level Confidentiality (header‑only subset). Pixel data is never modified — manual PHI verification is always required.


## Quick Start

### Open in a browser

- Download or clone this repository
- Open `dicom-sorter-anonymizer-v1.0.0.2.html` in the latest Chrome/Edge
- Click “Select Directory” (inside the drop zone) and choose a folder of DICOM files
- Review the Planned Output (Preview)
- Click “Save To Folder” (fast) or “Download Processed Files” (ZIP)

Notes:
- “Save To Folder” requires the File System Access API (Chromium‑based browsers). If not available, use the ZIP path.
- All processing is client‑side. No data leaves your machine.

### Desktop app (Electron)

- Requirements: Node.js 18+ and npm
- Install: `npm install`
- Run dev: `npm start`
- Build installers:
  - Windows Portable EXE: `npm run build:win`
  - Linux AppImage: `npm run build:linux`
  - macOS DMG: `npm run build:mac`

Electron loads the same HTML app locally and works offline.


## Usage

### Directory selection and preview

- Click “Select Directory” or drop a folder onto the drop zone.
- The app parses headers and generates a preview automatically.
- The preview shows a tree, grouped by day and FoR (frame‑of‑reference), then by series. RS/RP/RD series show their identifying IDs in brackets to help differentiate.

### Saving

- Save To Folder (recommended): Writes the exact preview tree to a chosen directory. Shows a persistent save progress bar.
- Download Processed Files (ZIP): Builds a ZIP, uses streaming when possible, and displays progress.


## Sorting Rules and Tree Layout

- Day buckets (D0, D1, …) are created for unique acquisition dates across the dataset:
  - D0 is the earliest date seen, D1 the next distinct date, etc.
  - Acquisition date is obtained from 0008,0022/0021/0020 with a fallback.
- Within each day, items are clustered by FrameOfReferenceUID (0020,0052):
  - Each cluster is labeled T1, T2, … with a modality cue (e.g., `T1-CT-RS`).
  - If FoR is missing, series UID is used as a fallback key.
- The final tree looks like:

```
D0/
  T1-CT-RS/
    SERIES_2_CT (56 files)
    SERIES_5_RS (1 files) [RS:STRUCT_ID]
  T2-CT-RP-RD/
    SERIES_3_CT (48 files)
    SERIES_7_RP (1 files) [RP:PLAN_ID]
    SERIES_8_RD (1 files) [RD:PLAN_ID]
```

- Duplicate handling: Files with the same SOPInstanceUID (0008,0018) are treated as duplicates; only the first occurrence is kept. Skipped duplicates are shown in the log.


## Filenames and Series Folders

- Series folders: `SERIES_{SeriesNumber}_{Modality}`
- File naming:
  - RT Plan: `RP(PLAN)_{PlanID}_{YYYYMMDD}_{HHMMSS}_{Seq}.dcm`
  - RT Struct: `RS(STRUCT)_{StructID}_{YYYYMMDD}_{HHMMSS}_{Seq}.dcm`
  - RT Dose: `RD(DOSE)_{AssocPlanID}_{YYYYMMDD}_{HHMMSS}_{Seq}.dcm`
  - Other modalities: `{MOD}_{YYYYMMDD}_{HHMMSS}_{Seq}.dcm`
- `{Seq}` uses InstanceNumber (0008,0013) padded to 4 digits (falls back to internal counter if missing).
- `_ID` tokens are sanitized to safe characters and truncated for portability.


## Optional De‑identification (Header Only)

- Disabled by default (folded panel in the UI). When enabled:
  - Replaces common patient identifiers (e.g., PatientName, PatientID, PatientBirthDate)
  - Remaps Study/Series/SOP/FrameOfReference UIDs and referenced SOP UIDs consistently
  - Preserves SOP Class UID and Transfer Syntax UID
  - Type 2 attributes are retained but cleared (empty values)
  - Optional removal of private tags (odd groups)
  - Stamps DeidentificationMethod with “PS3.15‑aligned header de‑identification v1.1”
- Important limitation: Pixel data is never analyzed; burned‑in text is not removed. Always perform a manual review of images for visible PHI.


## Browser Support and Requirements

- Recommended: Chrome or Edge (latest)
- “Save To Folder” requires the File System Access API (Chromium). Safari/Firefox may not support it — use the ZIP option instead.
- For very large datasets, prefer “Save To Folder” to minimize memory pressure.


## Troubleshooting

- “Save To Folder” missing: Use Chrome/Edge, or fall back to ZIP.
- Memory error (“Array buffer allocation failed”): Use streamed ZIP or Save To Folder.
- No preview after selecting: Ensure you selected a folder, not files, and that the browser was allowed to read the directory.
- RS/RP/RD not together: Items from different calendar days are intentionally separated into distinct D buckets.
- Duplicates kept: The first occurrence of a given SOPInstanceUID is kept, subsequent ones are skipped with a log message.


## Development and Build

Project layout:

- `dicom-sorter-anonymizer-v1.0.0.2.html` — the entire web app (UI + logic)
- `main.js` — Electron entrypoint (loads the HTML app)
- `package.json` — electron/electron‑builder configuration and scripts
- `UI_STYLE_GUIDE.md` — visual language and tokens used in the UI

Scripts:

- `npm start` — run the Electron app
- `npm run build:win` — Windows portable EXE
- `npm run build:linux` — Linux AppImage
- `npm run build:mac` — macOS DMG


## Open Source Licenses

This project bundles the following libraries (each with MIT license):

- dcmjs
- dicom‑parser
- JSZip

See the “Help & About” panel in the app for full license texts.


## Disclaimer

This tool is provided “as‑is” for research/engineering workflows. It is not a medical device and is not intended for primary diagnosis or therapeutic decision‑making. If using the optional header de‑identification, you remain responsible for ensuring compliance with applicable regulations and for validating that no PHI is present in pixel data or private attributes.

