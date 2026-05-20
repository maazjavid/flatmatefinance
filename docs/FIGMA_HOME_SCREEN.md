# Implementing the **Home Screen** from Figma (MCP)

The previous UI was generated from the wrong node: **`31:2`** (`Figma design - 1.jpg`), which is a flattened export of the **Settlements** dashboard—not the **Home Screen** frame you want.

## 1. Select the correct frame in Figma

1. Open your file: [Flatmate Finance](https://www.figma.com/design/PhU0bXlXGGPZPFhrksVWjl/Flatmate-Finance).
2. In the **Layers** panel, click the frame or top-level group named **Home Screen** (exact name matters for you finding it).
3. With that node selected, copy the file URL from the browser. It will look like:
   - `https://www.figma.com/design/PhU0bXlXGGPZPFhrksVWjl/...?node-id=XX-YY&...`

## 2. Turn `node-id` into MCP parameters

From `node-id=XX-YY` (hyphens), use:

- **`nodeId`**: `XX:YY` (use a **colon**, not a hyphen).
- **`fileKey`**: from the path segment after `/design/` — for this file it is **`PhU0bXlXGGPZPFhrksVWjl`**.

Example: if the URL has `node-id=12-345`, then `nodeId` is `12:345`.

## 3. What to ask the agent (Cursor + Figma MCP)

Use a prompt like:

> Pull design context from Figma `fileKey=PhU0bXlXGGPZPFhrksVWjl` and `nodeId=<YOUR_HOME_SCREEN_NODE>` (from this URL: `<paste full Figma URL>`). Implement the **Home Screen** in this Next.js app at `src/app/page.tsx` (and add components under `src/components/` as needed). Adapt the MCP reference code to our Tailwind tokens and existing `Button` / layout patterns—do not paste the raw export as-is.

The agent should call the Figma MCP tool **`get_design_context`** with:

- `fileKey`
- `nodeId`
- `clientLanguages`: e.g. `typescript`
- `clientFrameworks`: e.g. `next,react`

Optional: **`get_metadata`** with the same `fileKey` (and no `nodeId`) lists top-level pages; with `nodeId` set to a page id (e.g. `0:1`) you get an XML outline of children to find **Home Screen** by name and id.

## 4. After you have the URL

Paste the **full Figma link** for the **Home Screen** frame into chat. The agent will extract `fileKey` and `nodeId` and run `get_design_context` for you.

## 5. Design-to-code rules (from Figma MCP)

- MCP output is **reference** React + Tailwind; this project uses **Next.js App Router**, **Tailwind** in `tailwind.config.ts`, and **`@/` imports** — the implementation must match that stack.
- Asset URLs from MCP expire in about **7 days**; replace with local `public/` assets or your CDN when you ship.

## 6. Where the Home UI should live

- Primary route: **`src/app/page.tsx`** (currently a short placeholder).
- Shared pieces: **`src/components/`** (reuse `src/components/ui/button.tsx`, etc., where they fit).

---

**File key for this project (Flatmate Finance):** `PhU0bXlXGGPZPFhrksVWjl`  
**Wrong node (removed from app):** `31:2` — Settlements screenshot / export, not Home Screen.

**Correct Home Screen:** `50:2` — implemented in [`src/app/page.tsx`](../src/app/page.tsx).

- Figma: [Flatmate Finance — Home Screen](https://www.figma.com/design/PhU0bXlXGGPZPFhrksVWjl/Flatmate-Finance?node-id=50-2)
