import React, { useState, useEffect, useRef } from "react";
import {
  Search, Moon, Sun, Play, Pause, RotateCcw, SkipForward,
  BarChart2, GitBranch, Layers, Network, Code, Activity,
  List, Link2, Home, ChevronRight, Plus, Minus,
  Shuffle, Menu, Zap, BookOpen, ArrowRight,
  Route, GitMerge, Cpu, ArrowUpDown, Database, GitFork, Share2,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type View =
  | "dashboard" | "sorting" | "stack" | "queue" | "linkedlist"
  | "tree" | "bst" | "binarytree" | "threadedbst"
  | "graph" | "dijkstra" | "kruskal" | "prim" | "topo"
  | "complexity" | "practice";

type SortAlgo = "bubble" | "selection" | "insertion" | "quick";
type GraphAlgo = "bfs" | "dfs";
type TreeAlgo = "inorder" | "preorder" | "levelorder";

type SortStep = { arr: number[]; comparing: number[]; swapped: number[]; sorted: number[]; description: string };
type GraphStep = { visited: number[]; current: number; frontier: number[]; description: string };
type TreeStep = { visited: number[]; current: number; description: string };
type DijkStep = { dist: number[]; visited: number[]; current: number; relaxing: [number, number] | null; description: string };
type KruskalStep = { mstEdges: number[]; checkedEdge: number; accepted: boolean | null; totalWeight: number; description: string };
type PrimStep = { mstEdges: number[]; inMST: number[]; checkedEdge: number | null; totalWeight: number; description: string };
type TopoStep = { inDegree: number[]; queue: number[]; result: number[]; current: number; description: string };
type BSTStep = { path: number[]; current: number; found: boolean; description: string; insertSide?: "left" | "right" };
type ThreadedStep = { visited: number[]; current: number; usingThread: boolean; description: string };

// ─── Sort Step Generators ─────────────────────────────────────────────────────
function bubbleSteps(arr: number[]): SortStep[] {
  const steps: SortStep[] = []; const a = [...arr]; const done = new Set<number>(); const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ arr: [...a], comparing: [j, j + 1], swapped: [], sorted: [...done], description: `Comparing a[${j}]=${a[j]} and a[${j + 1}]=${a[j + 1]}${a[j] > a[j + 1] ? " → Swap needed!" : " → No swap"}` });
      if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; steps.push({ arr: [...a], comparing: [], swapped: [j, j + 1], sorted: [...done], description: `Swapped → a[${j}]=${a[j]}, a[${j + 1}]=${a[j + 1]}` }); }
    }
    done.add(n - 1 - i);
  }
  done.add(0);
  steps.push({ arr: [...a], comparing: [], swapped: [], sorted: [...done], description: "✓ Array is fully sorted!" });
  return steps;
}
function selectionSteps(arr: number[]): SortStep[] {
  const steps: SortStep[] = []; const a = [...arr]; const done = new Set<number>(); const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps.push({ arr: [...a], comparing: [minIdx, j], swapped: [], sorted: [...done], description: `Min search: a[${j}]=${a[j]} ${a[j] < a[minIdx] ? "< " : "≥ "}current min ${a[minIdx]}${a[j] < a[minIdx] ? " → New min!" : ""}` });
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) { [a[i], a[minIdx]] = [a[minIdx], a[i]]; steps.push({ arr: [...a], comparing: [], swapped: [i, minIdx], sorted: [...done], description: `Placed min ${a[i]} at index ${i}` }); }
    done.add(i);
  }
  done.add(n - 1);
  steps.push({ arr: [...a], comparing: [], swapped: [], sorted: [...done], description: "✓ Array is fully sorted!" });
  return steps;
}
function insertionSteps(arr: number[]): SortStep[] {
  const steps: SortStep[] = []; const a = [...arr]; const done = new Set<number>([0]); const n = a.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    steps.push({ arr: [...a], comparing: [i], swapped: [], sorted: [...done], description: `Inserting a[${i}]=${a[i]} into sorted portion [0..${i - 1}]` });
    while (j > 0 && a[j - 1] > a[j]) {
      steps.push({ arr: [...a], comparing: [j - 1, j], swapped: [], sorted: [...done], description: `a[${j - 1}]=${a[j - 1]} > a[${j}]=${a[j]} → Shift right` });
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      steps.push({ arr: [...a], comparing: [], swapped: [j - 1, j], sorted: [...done], description: `Shifted → a[${j - 1}]=${a[j - 1]}` });
      j--;
    }
    done.add(i);
  }
  steps.push({ arr: [...a], comparing: [], swapped: [], sorted: [...done], description: "✓ Array is fully sorted!" });
  return steps;
}
function quickSteps(arr: number[]): SortStep[] {
  const steps: SortStep[] = []; const a = [...arr]; const done = new Set<number>();
  function part(lo: number, hi: number): number {
    const pv = a[hi]; let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      steps.push({ arr: [...a], comparing: [j, hi], swapped: [], sorted: [...done], description: `Pivot=${pv}: a[${j}]=${a[j]} ${a[j] <= pv ? "≤" : ">"} pivot` });
      if (a[j] <= pv) { i++; if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; steps.push({ arr: [...a], comparing: [], swapped: [i, j], sorted: [...done], description: `a[${j}] ≤ pivot → Swap a[${i}] & a[${j}]` }); } }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]]; done.add(i + 1);
    steps.push({ arr: [...a], comparing: [], swapped: [i + 1, hi], sorted: [...done], description: `Pivot ${pv} placed at final position ${i + 1}` });
    return i + 1;
  }
  function qs(lo: number, hi: number) { if (lo < hi) { const p = part(lo, hi); qs(lo, p - 1); qs(p + 1, hi); } else if (lo === hi) done.add(lo); }
  qs(0, a.length - 1);
  steps.push({ arr: [...a], comparing: [], swapped: [], sorted: [...done], description: "✓ Array is fully sorted!" });
  return steps;
}
function getSteps(algo: SortAlgo, arr: number[]): SortStep[] {
  switch (algo) {
    case "bubble": return bubbleSteps(arr);
    case "selection": return selectionSteps(arr);
    case "insertion": return insertionSteps(arr);
    case "quick": return quickSteps(arr);
  }
}

// ─── Graph Data (shared by BFS/DFS/Dijkstra/Kruskal/Prim) ────────────────────
const GN = [
  { id: 0, cx: 200, cy: 48, label: "A" },
  { id: 1, cx: 88, cy: 138, label: "B" },
  { id: 2, cx: 312, cy: 138, label: "C" },
  { id: 3, cx: 40, cy: 238, label: "D" },
  { id: 4, cx: 155, cy: 238, label: "E" },
  { id: 5, cx: 245, cy: 238, label: "F" },
  { id: 6, cx: 360, cy: 238, label: "G" },
];
const GE = [
  { f: 0, t: 1, w: 4 }, { f: 0, t: 2, w: 7 },
  { f: 1, t: 3, w: 2 }, { f: 1, t: 4, w: 5 },
  { f: 2, t: 5, w: 3 }, { f: 2, t: 6, w: 6 },
  { f: 4, t: 5, w: 1 },
];
function buildAdj() {
  const adj = new Map<number, number[]>();
  GN.forEach(n => adj.set(n.id, []));
  GE.forEach(e => { adj.get(e.f)!.push(e.t); adj.get(e.t)!.push(e.f); });
  return adj;
}
function buildWeightedAdj() {
  const adj = new Map<number, [number, number][]>();
  GN.forEach(n => adj.set(n.id, []));
  GE.forEach((e, idx) => { adj.get(e.f)!.push([e.t, e.w]); adj.get(e.t)!.push([e.f, e.w]); });
  return adj;
}

// ─── BFS / DFS Traversals ─────────────────────────────────────────────────────
function bfsTraversal(): GraphStep[] {
  const adj = buildAdj(); const steps: GraphStep[] = [];
  const vis = new Set<number>([0]); const q = [0];
  while (q.length) {
    const cur = q.shift()!;
    steps.push({ visited: [...vis], current: cur, frontier: [...q], description: `Visiting ${GN[cur].label} | Queue: [${q.map(x => GN[x].label).join(", ") || "empty"}]` });
    for (const nb of adj.get(cur)!) { if (!vis.has(nb)) { vis.add(nb); q.push(nb); steps.push({ visited: [...vis], current: cur, frontier: [...q], description: `Discovered ${GN[nb].label} from ${GN[cur].label} → Added to queue` }); } }
  }
  return steps;
}
function dfsTraversal(): GraphStep[] {
  const adj = buildAdj(); const steps: GraphStep[] = [];
  const vis = new Set<number>(); const stk = [0];
  while (stk.length) {
    const cur = stk.pop()!; if (vis.has(cur)) continue; vis.add(cur);
    steps.push({ visited: [...vis], current: cur, frontier: [...stk], description: `Visiting ${GN[cur].label} | Stack: [${stk.map(x => GN[x].label).join(", ") || "empty"}]` });
    for (const nb of [...(adj.get(cur) || [])].reverse()) { if (!vis.has(nb)) { stk.push(nb); steps.push({ visited: [...vis], current: cur, frontier: [...stk], description: `Pushed ${GN[nb].label} onto DFS stack` }); } }
  }
  return steps;
}

// ─── Dijkstra's Algorithm ─────────────────────────────────────────────────────
function dijkstraTraversal(): DijkStep[] {
  const INF = 9999; const n = GN.length;
  const dist = Array(n).fill(INF); dist[0] = 0;
  const vis = new Set<number>();
  const adj = buildWeightedAdj();
  const steps: DijkStep[] = [];
  steps.push({ dist: [...dist], visited: [], current: 0, relaxing: null, description: "Initialize: dist[A]=0, all others=∞. Starting from node A." });
  for (let iter = 0; iter < n; iter++) {
    let u = -1;
    for (let i = 0; i < n; i++) { if (!vis.has(i) && dist[i] < INF && (u === -1 || dist[i] < dist[u])) u = i; }
    if (u === -1) break;
    vis.add(u);
    steps.push({ dist: [...dist], visited: [...vis], current: u, relaxing: null, description: `Pick ${GN[u].label} (dist=${dist[u]}) — minimum distance among unvisited nodes` });
    for (const [v, w] of adj.get(u)!) {
      if (!vis.has(v)) {
        const nd = dist[u] + w;
        const better = nd < dist[v];
        steps.push({ dist: [...dist], visited: [...vis], current: u, relaxing: [u, v], description: `Relax ${GN[u].label}→${GN[v].label}: ${dist[u]}+${w}=${nd} ${better ? `< ${dist[v] === INF ? "∞" : dist[v]} → Update!` : `≥ ${dist[v]} → No update`}` });
        if (better) { dist[v] = nd; steps.push({ dist: [...dist], visited: [...vis], current: u, relaxing: [u, v], description: `Updated dist[${GN[v].label}] = ${nd}` }); }
      }
    }
  }
  steps.push({ dist: [...dist], visited: [...vis], current: -1, relaxing: null, description: `✓ Shortest paths from A: ${GN.map((n, i) => `${n.label}=${dist[i]}`).join(", ")}` });
  return steps;
}

// ─── Kruskal's Algorithm ──────────────────────────────────────────────────────
function kruskalTraversal(): KruskalStep[] {
  const sorted = [...GE].map((e, i) => ({ ...e, idx: i })).sort((a, b) => a.w - b.w);
  const parent = Array.from({ length: GN.length }, (_, i) => i);
  function find(x: number): number { return parent[x] === x ? x : (parent[x] = find(parent[x])); }
  function unite(a: number, b: number) { parent[find(a)] = find(b); }
  const steps: KruskalStep[] = [];
  const mstEdges: number[] = [];
  let totalWeight = 0;
  steps.push({ mstEdges: [], checkedEdge: -1, accepted: null, totalWeight: 0, description: `Sort edges by weight: ${sorted.map(e => `(${GN[e.f].label}-${GN[e.t].label}:${e.w})`).join(", ")}` });
  for (const e of sorted) {
    const cycle = find(e.f) === find(e.t);
    steps.push({ mstEdges: [...mstEdges], checkedEdge: e.idx, accepted: null, totalWeight, description: `Check edge ${GN[e.f].label}-${GN[e.t].label} (w=${e.w}): ${cycle ? "Creates a cycle → REJECT" : "Safe to add → ACCEPT"}` });
    if (!cycle) {
      unite(e.f, e.t); mstEdges.push(e.idx); totalWeight += e.w;
      steps.push({ mstEdges: [...mstEdges], checkedEdge: e.idx, accepted: true, totalWeight, description: `Added ${GN[e.f].label}-${GN[e.t].label} to MST. Total MST weight: ${totalWeight}` });
    } else {
      steps.push({ mstEdges: [...mstEdges], checkedEdge: e.idx, accepted: false, totalWeight, description: `Rejected ${GN[e.f].label}-${GN[e.t].label} (would create cycle)` });
    }
    if (mstEdges.length === GN.length - 1) break;
  }
  steps.push({ mstEdges: [...mstEdges], checkedEdge: -1, accepted: true, totalWeight, description: `✓ Kruskal's MST complete! ${mstEdges.length} edges, total weight = ${totalWeight}` });
  return steps;
}

// ─── Prim's Algorithm ─────────────────────────────────────────────────────────
function primTraversal(): PrimStep[] {
  const n = GN.length;
  const adjW = new Map<number, [number, number, number][]>();
  GN.forEach(node => adjW.set(node.id, []));
  GE.forEach((e, idx) => { adjW.get(e.f)!.push([e.t, e.w, idx]); adjW.get(e.t)!.push([e.f, e.w, idx]); });
  const inMST = new Set<number>([0]);
  const mstEdges: number[] = [];
  let totalWeight = 0;
  const steps: PrimStep[] = [];
  steps.push({ mstEdges: [], inMST: [0], checkedEdge: null, totalWeight: 0, description: `Start from node ${GN[0].label}. Grow MST by always picking the minimum weight crossing edge.` });
  while (inMST.size < n) {
    let minW = Infinity, minIdx = -1, minTo = -1;
    for (const u of inMST) { for (const [v, w, idx] of adjW.get(u)!) { if (!inMST.has(v) && w < minW) { minW = w; minIdx = idx; minTo = v; } } }
    if (minIdx === -1) break;
    const e = GE[minIdx];
    inMST.add(minTo); mstEdges.push(minIdx); totalWeight += minW;
    steps.push({ mstEdges: [...mstEdges], inMST: [...inMST], checkedEdge: minIdx, totalWeight, description: `Add minimum edge ${GN[e.f].label}-${GN[e.t].label} (w=${minW}) to MST. Total weight: ${totalWeight}` });
  }
  steps.push({ mstEdges: [...mstEdges], inMST: [...inMST], checkedEdge: null, totalWeight, description: `✓ Prim's MST complete! All ${n} nodes connected. Total weight: ${totalWeight}` });
  return steps;
}

// ─── Topological Sort (Kahn's BFS) ────────────────────────────────────────────
const TOPO_NODES = [
  { id: 0, cx: 55, cy: 140, label: "A", name: "Math" },
  { id: 1, cx: 180, cy: 72, label: "B", name: "Physics" },
  { id: 2, cx: 180, cy: 208, label: "C", name: "CS 101" },
  { id: 3, cx: 305, cy: 72, label: "D", name: "Algorithms" },
  { id: 4, cx: 305, cy: 208, label: "E", name: "Data Struct." },
  { id: 5, cx: 390, cy: 140, label: "F", name: "OS" },
];
const TOPO_EDGES = [
  { f: 0, t: 1 }, { f: 0, t: 2 },
  { f: 1, t: 3 }, { f: 2, t: 3 }, { f: 2, t: 4 },
  { f: 3, t: 5 }, { f: 4, t: 5 },
];
function topoSortTraversal(): TopoStep[] {
  const n = TOPO_NODES.length;
  const inDeg = Array(n).fill(0);
  TOPO_EDGES.forEach(e => inDeg[e.t]++);
  const queue: number[] = []; inDeg.forEach((d, i) => { if (d === 0) queue.push(i); });
  const result: number[] = [];
  const steps: TopoStep[] = [];
  steps.push({ inDegree: [...inDeg], queue: [...queue], result: [], current: -1, description: `Compute in-degrees. Nodes with in-degree 0: [${queue.map(q => TOPO_NODES[q].label).join(", ")}] → Start queue` });
  while (queue.length) {
    const cur = queue.shift()!; result.push(cur);
    steps.push({ inDegree: [...inDeg], queue: [...queue], result: [...result], current: cur, description: `Process ${TOPO_NODES[cur].label} (${TOPO_NODES[cur].name}) → Add to result. Decrement neighbor in-degrees.` });
    for (const e of TOPO_EDGES.filter(e => e.f === cur)) {
      inDeg[e.t]--;
      if (inDeg[e.t] === 0) { queue.push(e.t); steps.push({ inDegree: [...inDeg], queue: [...queue], result: [...result], current: cur, description: `${TOPO_NODES[e.t].label} in-degree → 0: Added to queue` }); }
      else { steps.push({ inDegree: [...inDeg], queue: [...queue], result: [...result], current: cur, description: `${TOPO_NODES[e.t].label} in-degree: ${inDeg[e.t] + 1} → ${inDeg[e.t]}` }); }
    }
  }
  steps.push({ inDegree: [...inDeg], queue: [], result: [...result], current: -1, description: `✓ Topological order: ${result.map(i => TOPO_NODES[i].label).join(" → ")}` });
  return steps;
}

// ─── Binary Search Tree ───────────────────────────────────────────────────────
const BST_NODES = [
  { id: 0, val: 50, cx: 200, cy: 32, left: 1, right: 2 },
  { id: 1, val: 30, cx: 108, cy: 112, left: 3, right: 4 },
  { id: 2, val: 70, cx: 292, cy: 112, left: 5, right: 6 },
  { id: 3, val: 20, cx: 56, cy: 196, left: -1, right: -1 },
  { id: 4, val: 40, cx: 158, cy: 196, left: -1, right: -1 },
  { id: 5, val: 60, cx: 242, cy: 196, left: -1, right: -1 },
  { id: 6, val: 80, cx: 344, cy: 196, left: -1, right: -1 },
];
const BST_EDGES = [
  { p: 0, c: 1 }, { p: 0, c: 2 },
  { p: 1, c: 3 }, { p: 1, c: 4 },
  { p: 2, c: 5 }, { p: 2, c: 6 },
];
function bstSearchSteps(target: number): BSTStep[] {
  const steps: BSTStep[] = []; const path: number[] = [];
  steps.push({ path: [], current: 0, found: false, description: `Search for ${target}: Start at root (${BST_NODES[0].val})` });
  let cur = 0;
  while (cur !== -1) {
    path.push(cur);
    const node = BST_NODES[cur];
    if (target === node.val) { steps.push({ path: [...path], current: cur, found: true, description: `Found ${target}! Node at depth ${path.length - 1}.` }); return steps; }
    if (target < node.val) { steps.push({ path: [...path], current: cur, found: false, description: `${target} < ${node.val} → Go Left` }); cur = node.left; }
    else { steps.push({ path: [...path], current: cur, found: false, description: `${target} > ${node.val} → Go Right` }); cur = node.right; }
    if (cur === -1) steps.push({ path: [...path], current: -1, found: false, description: `${target} not found in BST (reached NULL)` });
  }
  return steps;
}
function bstInsertSteps(val: number): BSTStep[] {
  const steps: BSTStep[] = []; const path: number[] = [];
  steps.push({ path: [], current: 0, found: false, description: `Insert ${val}: Start at root (${BST_NODES[0].val})` });
  let cur = 0;
  while (cur !== -1) {
    path.push(cur);
    const node = BST_NODES[cur];
    if (val === node.val) { steps.push({ path: [...path], current: cur, found: true, description: `${val} already exists in BST!` }); return steps; }
    if (val < node.val) {
      steps.push({ path: [...path], current: cur, found: false, description: `${val} < ${node.val} → Go Left` });
      if (node.left === -1) { steps.push({ path: [...path], current: cur, found: true, insertSide: "left", description: `Insert ${val} as LEFT child of ${node.val} ✓` }); return steps; }
      cur = node.left;
    } else {
      steps.push({ path: [...path], current: cur, found: false, description: `${val} > ${node.val} → Go Right` });
      if (node.right === -1) { steps.push({ path: [...path], current: cur, found: true, insertSide: "right", description: `Insert ${val} as RIGHT child of ${node.val} ✓` }); return steps; }
      cur = node.right;
    }
  }
  return steps;
}

// ─── Threaded Binary Tree ─────────────────────────────────────────────────────
// Right-threaded: null right pointers point to inorder successor
// Inorder: 20(3)→30(1)→40(4)→50(0)→60(5)→70(2)→80(6)
const RIGHT_THREADS = [
  { from: 3, to: 1 },  // 20 → 30
  { from: 4, to: 0 },  // 40 → 50
  { from: 5, to: 2 },  // 60 → 70
];
function threadedTraversalSteps(): ThreadedStep[] {
  const steps: ThreadedStep[] = [];
  const visited: number[] = [];
  const INORDER_IDS = [3, 1, 4, 0, 5, 2, 6]; // 20,30,40,50,60,70,80
  for (let i = 0; i < INORDER_IDS.length; i++) {
    const id = INORDER_IDS[i];
    const node = BST_NODES[id];
    visited.push(id);
    steps.push({ visited: [...visited], current: id, usingThread: false, description: `Visit node ${node.val} (inorder position ${i + 1} of ${INORDER_IDS.length})` });
    if (i < INORDER_IDS.length - 1) {
      const thread = RIGHT_THREADS.find(t => t.from === id);
      if (thread) { steps.push({ visited: [...visited], current: id, usingThread: true, description: `Follow RIGHT THREAD from ${node.val} → ${BST_NODES[thread.to].val} (no recursion/stack needed!)` }); }
      else if (node.right !== -1) { steps.push({ visited: [...visited], current: id, usingThread: false, description: `Follow actual right child ${node.val} → ${BST_NODES[node.right].val}, then go leftmost` }); }
    }
  }
  steps.push({ visited: [...visited], current: -1, usingThread: false, description: `✓ Threaded inorder complete: ${INORDER_IDS.map(id => BST_NODES[id].val).join(" → ")}. Zero stack space used!` });
  return steps;
}

// ─── Tree Data (existing traversal view) ─────────────────────────────────────
const TN = [
  { id: 0, val: 1, cx: 200, cy: 34 }, { id: 1, val: 2, cx: 108, cy: 118 },
  { id: 2, val: 3, cx: 292, cy: 118 }, { id: 3, val: 4, cx: 56, cy: 210 },
  { id: 4, val: 5, cx: 162, cy: 210 }, { id: 5, val: 6, cx: 238, cy: 210 },
  { id: 6, val: 7, cx: 344, cy: 210 },
];
const TCHILDREN: Record<number, number[]> = { 0: [1, 2], 1: [3, 4], 2: [5, 6] };
const TEDGES = [{ p: 0, c: 1 }, { p: 0, c: 2 }, { p: 1, c: 3 }, { p: 1, c: 4 }, { p: 2, c: 5 }, { p: 2, c: 6 }];
function inorderTraversal(): TreeStep[] {
  const steps: TreeStep[] = []; const vis: number[] = [];
  function go(id: number | undefined) { if (id === undefined) return; go(TCHILDREN[id]?.[0]); vis.push(id); steps.push({ visited: [...vis], current: id, description: `Inorder Visit: node ${TN[id].val} (Left → Root → Right)` }); go(TCHILDREN[id]?.[1]); }
  go(0); return steps;
}
function preorderTraversal(): TreeStep[] {
  const steps: TreeStep[] = []; const vis: number[] = [];
  function go(id: number | undefined) { if (id === undefined) return; vis.push(id); steps.push({ visited: [...vis], current: id, description: `Preorder Visit: node ${TN[id].val} (Root → Left → Right)` }); go(TCHILDREN[id]?.[0]); go(TCHILDREN[id]?.[1]); }
  go(0); return steps;
}
function levelorderTraversal(): TreeStep[] {
  const steps: TreeStep[] = []; const vis: number[] = []; const q = [0];
  while (q.length) { const id = q.shift()!; vis.push(id); steps.push({ visited: [...vis], current: id, description: `BFS Visit: node ${TN[id].val} at Level ${Math.floor(Math.log2(id + 1))}` }); TCHILDREN[id]?.forEach(c => q.push(c)); }
  return steps;
}

// ─── Complexity Data ──────────────────────────────────────────────────────────
const CDATA = [
  { n: "1", "O(1)": 1, "O(log n)": 0, "O(n)": 1, "O(n log n)": 0, "O(n²)": 1 },
  { n: "4", "O(1)": 1, "O(log n)": 2, "O(n)": 4, "O(n log n)": 8, "O(n²)": 16 },
  { n: "8", "O(1)": 1, "O(log n)": 3, "O(n)": 8, "O(n log n)": 24, "O(n²)": 64 },
  { n: "16", "O(1)": 1, "O(log n)": 4, "O(n)": 16, "O(n log n)": 64, "O(n²)": 256 },
  { n: "32", "O(1)": 1, "O(log n)": 5, "O(n)": 32, "O(n log n)": 160, "O(n²)": 480 },
];
const ALGO_TABLE = [
  { name: "Bubble Sort", time: "O(n²)", space: "O(1)", best: "O(n)", worst: "O(n²)", stable: true },
  { name: "Selection Sort", time: "O(n²)", space: "O(1)", best: "O(n²)", worst: "O(n²)", stable: false },
  { name: "Insertion Sort", time: "O(n²)", space: "O(1)", best: "O(n)", worst: "O(n²)", stable: true },
  { name: "Quick Sort", time: "O(n log n)", space: "O(log n)", best: "O(n log n)", worst: "O(n²)", stable: false },
  { name: "Merge Sort", time: "O(n log n)", space: "O(n)", best: "O(n log n)", worst: "O(n log n)", stable: true },
  { name: "Heap Sort", time: "O(n log n)", space: "O(1)", best: "O(n log n)", worst: "O(n log n)", stable: false },
  { name: "Binary Search", time: "O(log n)", space: "O(1)", best: "O(1)", worst: "O(log n)", stable: false },
  { name: "BFS / DFS", time: "O(V+E)", space: "O(V)", best: "O(V+E)", worst: "O(V+E)", stable: false },
  { name: "Dijkstra's", time: "O(V²)", space: "O(V)", best: "O(V²)", worst: "O(V²)", stable: false },
  { name: "Kruskal's MST", time: "O(E log E)", space: "O(V)", best: "O(E log E)", worst: "O(E log E)", stable: false },
  { name: "Prim's MST", time: "O(V²)", space: "O(V)", best: "O(V²)", worst: "O(V²)", stable: false },
  { name: "Topological Sort", time: "O(V+E)", space: "O(V)", best: "O(V+E)", worst: "O(V+E)", stable: false },
  { name: "BST Search/Insert", time: "O(log n)", space: "O(1)", best: "O(1)", worst: "O(n)", stable: false },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_ARR = [64, 34, 25, 12, 22, 11, 90, 45, 67, 38, 53, 17];
const SORT_ALGO_INFO: Record<SortAlgo, { label: string; time: string; space: string; best: string }> = {
  bubble: { label: "Bubble Sort", time: "O(n²)", space: "O(1)", best: "O(n)" },
  selection: { label: "Selection Sort", time: "O(n²)", space: "O(1)", best: "O(n²)" },
  insertion: { label: "Insertion Sort", time: "O(n²)", space: "O(1)", best: "O(n)" },
  quick: { label: "Quick Sort", time: "O(n log n)", space: "O(log n)", best: "O(n log n)" },
};

const NAV_SECTIONS = [
  { label: null, items: [{ id: "dashboard", label: "Dashboard", icon: Home }] },
  { label: "Data Structures", items: [
    { id: "sorting", label: "Sorting Algorithms", icon: BarChart2 },
    { id: "stack", label: "Stack (LIFO)", icon: Layers },
    { id: "queue", label: "Queue (FIFO)", icon: List },
    { id: "linkedlist", label: "Linked List", icon: Link2 },
  ]},
  { label: "Tree Structures", items: [
    { id: "tree", label: "Tree Traversal", icon: GitBranch },
    { id: "bst", label: "Binary Search Tree", icon: Database },
    { id: "binarytree", label: "Binary Tree", icon: GitFork },
    { id: "threadedbst", label: "Threaded Binary Tree", icon: Share2 },
  ]},
  { label: "Graph Algorithms", items: [
    { id: "graph", label: "BFS / DFS", icon: Network },
    { id: "dijkstra", label: "Dijkstra's Algorithm", icon: Route },
    { id: "kruskal", label: "Kruskal's MST", icon: GitMerge },
    { id: "prim", label: "Prim's MST", icon: Cpu },
    { id: "topo", label: "Topological Sort", icon: ArrowUpDown },
  ]},
  { label: "Analysis", items: [
    { id: "complexity", label: "Big-O Complexity", icon: Activity },
    { id: "practice", label: "Practice Mode", icon: Code },
  ]},
] as const;

const CATEGORIES = [
  { id: "sorting", label: "Sorting Algorithms", icon: BarChart2, desc: "Bubble, Merge, Quick, Selection Sort", complexity: "O(n²) — O(n log n)", color: "from-blue-500/15 to-cyan-500/10", accent: "#60a5fa", tag: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: "stack", label: "Stack (LIFO)", icon: Layers, desc: "Push, Pop, Peek — Last In First Out", complexity: "O(1) all operations", color: "from-violet-500/15 to-purple-500/10", accent: "#a78bfa", tag: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  { id: "queue", label: "Queue (FIFO)", icon: List, desc: "Enqueue, Dequeue — First In First Out", complexity: "O(1) all operations", color: "from-emerald-500/15 to-teal-500/10", accent: "#34d399", tag: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { id: "linkedlist", label: "Linked List", icon: Link2, desc: "Insert, Delete, Traverse, Reverse", complexity: "O(n) traversal", color: "from-orange-500/15 to-amber-500/10", accent: "#fb923c", tag: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { id: "tree", label: "Tree Traversal", icon: GitBranch, desc: "Inorder, Preorder, BFS Level-Order", complexity: "O(n) traversal", color: "from-cyan-500/15 to-sky-500/10", accent: "#22d3ee", tag: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  { id: "bst", label: "Binary Search Tree", icon: Database, desc: "Insert, Search — sorted binary tree", complexity: "O(log n) avg", color: "from-teal-500/15 to-green-500/10", accent: "#2dd4bf", tag: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
  { id: "binarytree", label: "Binary Tree", icon: GitFork, desc: "Perfect, Complete, Full tree types", complexity: "O(n) height ops", color: "from-sky-500/15 to-blue-500/10", accent: "#38bdf8", tag: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  { id: "threadedbst", label: "Threaded Binary Tree", icon: Share2, desc: "Right-threaded inorder traversal", complexity: "O(n) no stack", color: "from-lime-500/15 to-green-500/10", accent: "#a3e635", tag: "bg-lime-500/10 text-lime-400 border-lime-500/20" },
  { id: "graph", label: "Graph BFS / DFS", icon: Network, desc: "BFS, DFS, Weighted Edges", complexity: "O(V + E)", color: "from-rose-500/15 to-pink-500/10", accent: "#fb7185", tag: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  { id: "dijkstra", label: "Dijkstra's Algorithm", icon: Route, desc: "Single-source shortest paths", complexity: "O(V²)", color: "from-amber-500/15 to-yellow-500/10", accent: "#fbbf24", tag: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { id: "kruskal", label: "Kruskal's MST", icon: GitMerge, desc: "Minimum Spanning Tree via Union-Find", complexity: "O(E log E)", color: "from-fuchsia-500/15 to-pink-500/10", accent: "#e879f9", tag: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20" },
  { id: "prim", label: "Prim's MST", icon: Cpu, desc: "MST growing from a start node", complexity: "O(V²)", color: "from-indigo-500/15 to-blue-500/10", accent: "#818cf8", tag: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { id: "topo", label: "Topological Sort", icon: ArrowUpDown, desc: "Linear ordering of a DAG via Kahn's", complexity: "O(V + E)", color: "from-green-500/15 to-emerald-500/10", accent: "#4ade80", tag: "bg-green-500/10 text-green-400 border-green-500/20" },
  { id: "complexity", label: "Complexity Analysis", icon: Activity, desc: "Big-O, Big-Ω, algorithm comparison", complexity: "O(1) to O(n!)", color: "from-indigo-500/15 to-blue-500/10", accent: "#818cf8", tag: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { id: "practice", label: "Practice Mode", icon: Code, desc: "Custom input, run any algorithm", complexity: "Interactive", color: "from-amber-500/15 to-yellow-500/10", accent: "#fbbf24", tag: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [view, setView] = useState<View>("dashboard");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sort state
  const [sortAlgo, setSortAlgo] = useState<SortAlgo>("bubble");
  const [sortArr, setSortArr] = useState<number[]>(DEFAULT_ARR);
  const [sortSteps, setSortSteps] = useState<SortStep[]>(() => getSteps("bubble", DEFAULT_ARR));
  const [sortIdx, setSortIdx] = useState(0);
  const [sortPlaying, setSortPlaying] = useState(false);
  const [speed, setSpeed] = useState(380);
  const sortTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stack / Queue / Linked List state
  const [stack, setStack] = useState([4, 15, 7, 3]);
  const [stackInput, setStackInput] = useState("");
  const [stackAnim, setStackAnim] = useState<"push" | "pop" | null>(null);
  const [queue, setQueue] = useState([10, 25, 8, 42]);
  const [queueInput, setQueueInput] = useState("");
  const [queueAnim, setQueueAnim] = useState<"enq" | "deq" | null>(null);
  const [ll, setLl] = useState([5, 12, 8, 20, 3]);
  const [llInput, setLlInput] = useState("");
  const [llHighlight, setLlHighlight] = useState<number | null>(null);

  // Tree state
  const [treeAlgo, setTreeAlgo] = useState<TreeAlgo>("inorder");
  const [treeSteps, setTreeSteps] = useState<TreeStep[]>(() => inorderTraversal());
  const [treeIdx, setTreeIdx] = useState(0);
  const [treePlaying, setTreePlaying] = useState(false);
  const treeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // BST state
  const [bstInput, setBstInput] = useState("35");
  const [bstMode, setBstMode] = useState<"search" | "insert">("search");
  const [bstSteps, setBstSteps] = useState<BSTStep[]>([]);
  const [bstIdx, setBstIdx] = useState(0);
  const [bstPlaying, setBstPlaying] = useState(false);
  const bstTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Binary Tree type tab
  const [btTab, setBtTab] = useState<"perfect" | "complete" | "full">("perfect");

  // Threaded BST state
  const [threadedSteps] = useState<ThreadedStep[]>(() => threadedTraversalSteps());
  const [threadedIdx, setThreadedIdx] = useState(0);
  const [threadedPlaying, setThreadedPlaying] = useState(false);
  const threadedTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Graph / BFS / DFS state
  const [graphAlgo, setGraphAlgo] = useState<GraphAlgo>("bfs");
  const [graphSteps, setGraphSteps] = useState<GraphStep[]>(() => bfsTraversal());
  const [graphIdx, setGraphIdx] = useState(0);
  const [graphPlaying, setGraphPlaying] = useState(false);
  const graphTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Dijkstra state
  const [dijkSteps] = useState<DijkStep[]>(() => dijkstraTraversal());
  const [dijkIdx, setDijkIdx] = useState(0);
  const [dijkPlaying, setDijkPlaying] = useState(false);
  const dijkTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Kruskal state
  const [kruskalSteps] = useState<KruskalStep[]>(() => kruskalTraversal());
  const [kruskalIdx, setKruskalIdx] = useState(0);
  const [kruskalPlaying, setKruskalPlaying] = useState(false);
  const kruskalTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Prim state
  const [primSteps] = useState<PrimStep[]>(() => primTraversal());
  const [primIdx, setPrimIdx] = useState(0);
  const [primPlaying, setPrimPlaying] = useState(false);
  const primTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Topo state
  const [topoSteps] = useState<TopoStep[]>(() => topoSortTraversal());
  const [topoIdx, setTopoIdx] = useState(0);
  const [topoPlaying, setTopoPlaying] = useState(false);
  const topoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Practice state
  const [practiceInput, setPracticeInput] = useState("45, 23, 78, 12, 56, 34, 89, 67");
  const [practiceAlgo, setPracticeAlgo] = useState<SortAlgo>("bubble");
  const [practiceSteps, setPracticeSteps] = useState<SortStep[]>([]);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practicePlaying, setPracticePlaying] = useState(false);
  const practiceTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { document.documentElement.classList.toggle("dark", isDark); }, [isDark]);

  function makeIntervalEffect(playing: boolean, idx: number, total: number, setIdx: React.Dispatch<React.SetStateAction<number>>, setPlaying: React.Dispatch<React.SetStateAction<boolean>>, timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>, ms: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    if (playing) { timerRef.current = setInterval(() => { setIdx(i => { if (i >= total - 1) { setPlaying(false); return i; } return i + 1; }); }, ms); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }

  useEffect(() => makeIntervalEffect(sortPlaying, sortIdx, sortSteps.length, setSortIdx, setSortPlaying, sortTimer, speed), [sortPlaying, speed, sortSteps.length]);
  useEffect(() => makeIntervalEffect(treePlaying, treeIdx, treeSteps.length, setTreeIdx, setTreePlaying, treeTimer, 700), [treePlaying, treeSteps.length]);
  useEffect(() => makeIntervalEffect(bstPlaying, bstIdx, bstSteps.length, setBstIdx, setBstPlaying, bstTimer, 750), [bstPlaying, bstSteps.length]);
  useEffect(() => makeIntervalEffect(threadedPlaying, threadedIdx, threadedSteps.length, setThreadedIdx, setThreadedPlaying, threadedTimer, 800), [threadedPlaying, threadedSteps.length]);
  useEffect(() => makeIntervalEffect(graphPlaying, graphIdx, graphSteps.length, setGraphIdx, setGraphPlaying, graphTimer, 720), [graphPlaying, graphSteps.length]);
  useEffect(() => makeIntervalEffect(dijkPlaying, dijkIdx, dijkSteps.length, setDijkIdx, setDijkPlaying, dijkTimer, 850), [dijkPlaying, dijkSteps.length]);
  useEffect(() => makeIntervalEffect(kruskalPlaying, kruskalIdx, kruskalSteps.length, setKruskalIdx, setKruskalPlaying, kruskalTimer, 850), [kruskalPlaying, kruskalSteps.length]);
  useEffect(() => makeIntervalEffect(primPlaying, primIdx, primSteps.length, setPrimIdx, setPrimPlaying, primTimer, 850), [primPlaying, primSteps.length]);
  useEffect(() => makeIntervalEffect(topoPlaying, topoIdx, topoSteps.length, setTopoIdx, setTopoPlaying, topoTimer, 800), [topoPlaying, topoSteps.length]);
  useEffect(() => makeIntervalEffect(practicePlaying, practiceIdx, practiceSteps.length, setPracticeIdx, setPracticePlaying, practiceTimer, speed), [practicePlaying, speed, practiceSteps.length]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function changeSortAlgo(algo: SortAlgo) { setSortAlgo(algo); const s = getSteps(algo, sortArr); setSortSteps(s); setSortIdx(0); setSortPlaying(false); }
  function randomizeSort() { const arr = Array.from({ length: 12 }, () => Math.floor(Math.random() * 85) + 10); setSortArr(arr); setSortSteps(getSteps(sortAlgo, arr)); setSortIdx(0); setSortPlaying(false); }
  function changeTreeAlgo(algo: TreeAlgo) { setTreeAlgo(algo); const s = algo === "inorder" ? inorderTraversal() : algo === "preorder" ? preorderTraversal() : levelorderTraversal(); setTreeSteps(s); setTreeIdx(0); setTreePlaying(false); }
  function changeGraphAlgo(algo: GraphAlgo) { setGraphAlgo(algo); setGraphSteps(algo === "bfs" ? bfsTraversal() : dfsTraversal()); setGraphIdx(0); setGraphPlaying(false); }
  function stackPush() { const v = parseInt(stackInput); if (isNaN(v)) return; setStackAnim("push"); setStack(s => [...s, v]); setStackInput(""); setTimeout(() => setStackAnim(null), 600); }
  function stackPop() { if (!stack.length) return; setStackAnim("pop"); setTimeout(() => { setStack(s => s.slice(0, -1)); setStackAnim(null); }, 300); }
  function enqueue() { const v = parseInt(queueInput); if (isNaN(v)) return; setQueueAnim("enq"); setQueue(q => [...q, v]); setQueueInput(""); setTimeout(() => setQueueAnim(null), 600); }
  function dequeue() { if (!queue.length) return; setQueueAnim("deq"); setTimeout(() => { setQueue(q => q.slice(1)); setQueueAnim(null); }, 300); }
  function llInsert() { const v = parseInt(llInput); if (isNaN(v)) return; setLl(l => [v, ...l]); setLlInput(""); setLlHighlight(0); setTimeout(() => setLlHighlight(null), 900); }
  function llDelete() { if (!ll.length) return; setLlHighlight(ll.length - 1); setTimeout(() => { setLl(l => l.slice(0, -1)); setLlHighlight(null); }, 500); }
  function runBST() { const v = parseInt(bstInput); if (isNaN(v)) return; const s = bstMode === "search" ? bstSearchSteps(v) : bstInsertSteps(v); setBstSteps(s); setBstIdx(0); setBstPlaying(false); }
  function runPractice() { const nums = practiceInput.split(/[,\s]+/).map(Number).filter(n => !isNaN(n) && n > 0 && n <= 999); if (nums.length < 2) return; const s = getSteps(practiceAlgo, nums); setPracticeSteps(s); setPracticeIdx(0); setPracticePlaying(false); }

  // ── Derived ───────────────────────────────────────────────────────────────
  const sortStep = sortSteps[sortIdx] ?? { arr: sortArr, comparing: [], swapped: [], sorted: [], description: "Select an algorithm and press Play" };
  const graphStep = graphSteps[graphIdx];
  const treeStep = treeSteps[treeIdx];
  const bstStep = bstSteps[bstIdx];
  const dijkStep = dijkSteps[dijkIdx];
  const kruskalStep = kruskalSteps[kruskalIdx];
  const primStep = primSteps[primIdx];
  const topoStep = topoSteps[topoIdx];
  const threadedStep = threadedSteps[threadedIdx];
  const practiceStep = practiceSteps[practiceIdx];
  const maxSortVal = Math.max(...sortStep.arr, 1);
  const maxPracticeVal = practiceStep ? Math.max(...practiceStep.arr, 1) : 1;
  const filteredCats = CATEGORIES.filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase()));

  // ── UI Helpers ────────────────────────────────────────────────────────────
  function card(children: React.ReactNode, className = "") {
    return <div className={`rounded-xl border border-border bg-card/80 backdrop-blur-sm ${className}`}>{children}</div>;
  }
  function sectionHeader(title: string, subtitle: string, icon: React.ReactNode) {
    return (
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary mt-0.5">{icon}</div>
        <div><h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>{title}</h1><p className="text-sm text-muted-foreground">{subtitle}</p></div>
      </div>
    );
  }
  function infoRow(label: string, val: string, col = "text-primary") {
    return <div className="flex justify-between"><span className="text-xs text-muted-foreground">{label}</span><span className={`text-xs font-mono font-semibold ${col}`}>{val}</span></div>;
  }

  // Shared graph SVG (for BFS/DFS/Dijkstra/Kruskal/Prim)
  function GraphSVG({ edgeColor, nodeColor, edgeWidth }: {
    edgeColor: (ei: number) => string;
    nodeColor: (id: number) => string;
    edgeWidth?: (ei: number) => number;
  }) {
    return (
      <svg viewBox="0 0 400 290" className="w-full h-56">
        {GE.map((e, i) => {
          const fn = GN[e.f]; const tn = GN[e.t];
          const mx = (fn.cx + tn.cx) / 2; const my = (fn.cy + tn.cy) / 2;
          return (
            <g key={i}>
              <line x1={fn.cx} y1={fn.cy} x2={tn.cx} y2={tn.cy} stroke={edgeColor(i)} strokeWidth={edgeWidth ? edgeWidth(i) : 1.5} className="transition-all duration-300" />
              <rect x={mx - 9} y={my - 9} width={18} height={14} rx={3} fill="#0a0d1a" />
              <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#64748b" fontWeight="600">{e.w}</text>
            </g>
          );
        })}
        {GN.map(n => {
          const col = nodeColor(n.id);
          return (
            <g key={n.id}>
              <circle cx={n.cx} cy={n.cy} r={22} fill={col} stroke={col === "#0f172a" ? "#334155" : col} strokeWidth={2} className="transition-all duration-300" style={{ filter: col !== "#0f172a" ? `drop-shadow(0 0 6px ${col}55)` : "none" }} />
              <text x={n.cx} y={n.cy} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" fill={col === "#fbbf24" ? "#1c1917" : "#f8fafc"}>{n.label}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  // Shared BST SVG
  function BstSVG({ pathIds = [], currentId = -1, foundId = -1, threadHighlight = -1, showThreads = false }: { pathIds?: number[]; currentId?: number; foundId?: number; threadHighlight?: number; showThreads?: boolean }) {
    return (
      <svg viewBox="0 0 400 250" className="w-full h-48">
        {BST_EDGES.map((e, i) => {
          const p = BST_NODES[e.p]; const c = BST_NODES[e.c];
          const active = pathIds.includes(e.p) && pathIds.includes(e.c);
          return <line key={i} x1={p.cx} y1={p.cy} x2={c.cx} y2={c.cy} stroke={active ? "#60a5fa" : "#1e293b"} strokeWidth={active ? 2 : 1.5} className="transition-all duration-300" />;
        })}
        {showThreads && RIGHT_THREADS.map((t, i) => {
          const fn = BST_NODES[t.from]; const tn = BST_NODES[t.to];
          const active = t.from === threadHighlight;
          const cx = (fn.cx + tn.cx) / 2; const cy = Math.min(fn.cy, tn.cy) - 38;
          return (
            <path key={i} d={`M ${fn.cx} ${fn.cy} Q ${cx} ${cy} ${tn.cx} ${tn.cy}`}
              fill="none" stroke={active ? "#a78bfa" : "#334155"} strokeWidth={active ? 2 : 1.2}
              strokeDasharray="5,3" className="transition-all duration-300"
              markerEnd="url(#threadArrow)"
            />
          );
        })}
        <defs>
          <marker id="threadArrow" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="#6d28d9" />
          </marker>
        </defs>
        {BST_NODES.map(n => {
          const inPath = pathIds.includes(n.id);
          const isCur = n.id === currentId;
          const isFound = n.id === foundId;
          return (
            <g key={n.id}>
              <circle cx={n.cx} cy={n.cy} r={20}
                fill={isFound ? "#10b981" : isCur ? "#fbbf24" : inPath ? "#2563eb" : "#0f172a"}
                stroke={isFound ? "#34d399" : isCur ? "#f59e0b" : inPath ? "#60a5fa" : "#334155"}
                strokeWidth={isCur || isFound ? 3 : 2} className="transition-all duration-300" />
              <text x={n.cx} y={n.cy} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="700" fill={isCur && !isFound ? "#1c1917" : "#f8fafc"}>{n.val}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  function AnimControls({ idx, total, playing, onPlay, onPause, onNext, onReset, showSpeed = false }: {
    idx: number; total: number; playing: boolean;
    onPlay: () => void; onPause: () => void; onNext: () => void; onReset: () => void; showSpeed?: boolean;
  }) {
    return (
      <div className="flex flex-col gap-3 pt-4 border-t border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={onReset} className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors" title="Reset"><RotateCcw size={15} /></button>
          <button onClick={playing ? onPause : onPlay} disabled={total === 0} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center gap-2 text-sm font-semibold disabled:opacity-40">
            {playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
          </button>
          <button onClick={onNext} disabled={idx >= total - 1 || total === 0} className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors disabled:opacity-40" title="Next Step"><SkipForward size={15} /></button>
          <span className="text-xs text-muted-foreground font-mono ml-1">Step {total > 0 ? idx + 1 : 0} / {total}</span>
          {total > 0 && <div className="flex-1 min-w-[100px] h-1 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((idx + 1) / total) * 100}%` }} /></div>}
        </div>
        {showSpeed && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-8">Fast</span>
            <input type="range" min={80} max={700} step={40} value={780 - speed} onChange={e => setSpeed(780 - parseInt(e.target.value))} className="flex-1 h-1.5 accent-blue-400" />
            <span className="text-xs text-muted-foreground w-8">Slow</span>
          </div>
        )}
      </div>
    );
  }

  function SortBars({ step, maxVal }: { step: SortStep; maxVal: number }) {
    return (
      <div className="flex items-end gap-[3px] h-48 px-1">
        {step.arr.map((val, i) => {
          const isComp = step.comparing.includes(i), isSwap = step.swapped.includes(i), isSorted = step.sorted.includes(i);
          return (
            <div key={i} className="flex-1 flex flex-col items-center min-w-0 group">
              <span className="text-[9px] font-mono text-muted-foreground mb-0.5 opacity-70 group-hover:opacity-100">{val}</span>
              <div style={{ height: `${Math.max((val / maxVal) * 172, 6)}px` }}
                className={`w-full rounded-t-sm transition-all duration-200 ${isSwap ? "bg-rose-400 shadow-lg shadow-rose-500/40" : isComp ? "bg-amber-400 shadow-lg shadow-amber-500/40" : isSorted ? "bg-emerald-400 shadow-md shadow-emerald-500/30" : "bg-blue-500 dark:bg-blue-400 opacity-75"}`} />
            </div>
          );
        })}
      </div>
    );
  }

  // ── Views ──────────────────────────────────────────────────────────────────

  function Dashboard() {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-blue-600/10 via-violet-600/5 to-transparent p-6 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4"><Zap size={12} /> Premium DSA Learning Platform</div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-2 leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              DSA Visualizer <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Pro</span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm lg:text-base mb-5">Master Data Structures & Algorithms through interactive step-by-step animations. 15 topics, 30+ algorithms, fully visualized.</p>
            <div className="flex flex-wrap gap-3">
              {[{ label: "15 Topics", icon: <BookOpen size={13} /> }, { label: "30+ Algorithms", icon: <Zap size={13} /> }, { label: "Step-by-Step", icon: <ChevronRight size={13} /> }, { label: "Complexity Charts", icon: <Activity size={13} /> }].map(s => (
                <span key={s.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground font-medium">{s.icon} {s.label}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search algorithms, data structures..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCats.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} onClick={() => setView(cat.id as View)} className={`text-left p-5 rounded-xl border border-border bg-gradient-to-br ${cat.color} hover:border-border/60 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30 transition-all duration-200 group relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" style={{ background: cat.accent }} />
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ background: cat.accent + "22" }}><Icon size={18} style={{ color: cat.accent }} /></div>
                  <h3 className="font-bold text-foreground text-sm mb-1 leading-snug" style={{ fontFamily: "Outfit, sans-serif" }}>{cat.label}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{cat.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cat.tag}`}>{cat.complexity}</span>
                    <ArrowRight size={13} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function Sorting() {
    const info = SORT_ALGO_INFO[sortAlgo];
    return (
      <div className="space-y-5">
        {sectionHeader("Sorting Algorithms", "Watch algorithms sort arrays step-by-step with color-coded comparisons and swaps", <BarChart2 size={18} />)}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["bubble", "selection", "insertion", "quick"] as SortAlgo[]).map(a => (
              <button key={a} onClick={() => changeSortAlgo(a)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sortAlgo === a ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>{SORT_ALGO_INFO[a].label.replace(" Sort", "")}</button>
            ))}
          </div>
          <button onClick={randomizeSort} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors text-sm"><Shuffle size={14} /> Randomize</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {card(<div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm">Array Visualization</h3>
              <div className="flex gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" /> Comparing</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-400 inline-block" /> Swapped</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" /> Sorted</span>
              </div>
            </div>
            <SortBars step={sortStep} maxVal={maxSortVal} />
            <AnimControls idx={sortIdx} total={sortSteps.length} playing={sortPlaying} onPlay={() => { if (sortIdx >= sortSteps.length - 1) setSortIdx(0); setSortPlaying(true); }} onPause={() => setSortPlaying(false)} onNext={() => setSortIdx(i => Math.min(i + 1, sortSteps.length - 1))} onReset={() => { setSortIdx(0); setSortPlaying(false); }} showSpeed />
          </div>, "lg:col-span-2")}
          <div className="space-y-4">
            {card(<div className="p-5"><h3 className="font-semibold text-foreground text-sm mb-3">Step Explanation</h3><div className="min-h-[56px] p-3 rounded-lg bg-muted/60 border border-border"><p className="text-sm text-foreground leading-relaxed">{sortStep.description}</p></div><div className="mt-3 space-y-2">{infoRow("Comparisons done", sortIdx.toString(), "text-primary")}{infoRow("Elements sorted", sortStep.sorted.length.toString(), "text-emerald-400")}</div></div>)}
            {card(<div className="p-5 space-y-3"><h3 className="font-semibold text-foreground text-sm">{info.label}</h3>{infoRow("Average Time", info.time, "text-amber-400")}{infoRow("Best Case", info.best, "text-emerald-400")}{infoRow("Space", info.space, "text-blue-400")}</div>)}
          </div>
        </div>
      </div>
    );
  }

  function Stack() {
    return (
      <div className="space-y-5">
        {sectionHeader("Stack (LIFO)", "Last In, First Out — push elements onto the top, pop from the top", <Layers size={18} />)}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {card(<div className="p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-foreground text-sm">Stack Visualization</h3><span className="text-xs text-muted-foreground font-mono">Top ↑</span></div>
            <div className="flex flex-col-reverse gap-2 min-h-[260px] items-center justify-start pt-4">
              {stack.length === 0 && <p className="text-muted-foreground text-sm italic">Stack is empty</p>}
              {stack.map((val, i) => {
                const isTop = i === stack.length - 1;
                return (
                  <div key={`${i}-${val}`} className={`w-52 h-12 flex items-center justify-between px-4 rounded-lg border-2 font-mono font-semibold text-sm transition-all duration-300 ${isTop ? stackAnim === "push" ? "border-emerald-400 bg-emerald-400/10 text-emerald-300 scale-105" : stackAnim === "pop" ? "border-rose-400 bg-rose-400/10 text-rose-300 opacity-50 scale-95" : "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-secondary-foreground"}`}>
                    <span className="text-xs text-muted-foreground font-normal">[{i}]</span>
                    <span>{val}</span>
                    {isTop && <span className="text-[10px] text-primary font-normal">← TOP</span>}
                  </div>
                );
              })}
            </div>
            <div className="w-52 mx-auto h-1 bg-primary/40 rounded-full mt-2 mb-1" />
            <p className="text-center text-xs text-muted-foreground">Base of Stack</p>
          </div>)}
          {card(<div className="p-6 space-y-5">
            <h3 className="font-semibold text-foreground text-sm">Operations</h3>
            <div className="space-y-3">
              <div className="flex gap-2"><input value={stackInput} onChange={e => setStackInput(e.target.value)} onKeyDown={e => e.key === "Enter" && stackPush()} placeholder="Enter value..." className="flex-1 px-3 py-2 rounded-lg bg-input-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" type="number" />
                <button onClick={stackPush} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-1.5"><Plus size={14} /> Push</button></div>
              <button onClick={stackPop} disabled={!stack.length} className="w-full px-4 py-2 rounded-lg bg-rose-500/80 text-white text-sm font-semibold hover:bg-rose-500 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"><Minus size={14} /> Pop</button>
            </div>
            <div className="space-y-2 pt-2 border-t border-border">{[{ label: "Size", val: stack.length.toString() }, { label: "Top", val: stack.length ? stack[stack.length - 1].toString() : "—" }, { label: "Is Empty", val: stack.length === 0 ? "Yes" : "No" }, { label: "Push / Pop", val: "O(1)" }].map(r => <div key={r.label}>{infoRow(r.label, r.val)}</div>)}</div>
            <div className="p-3 rounded-lg bg-muted/60 border border-border"><p className="text-xs text-muted-foreground leading-relaxed"><strong className="text-foreground">Use cases:</strong> Function call stack, undo operations, expression evaluation, backtracking.</p></div>
          </div>)}
        </div>
      </div>
    );
  }

  function Queue() {
    return (
      <div className="space-y-5">
        {sectionHeader("Queue (FIFO)", "First In, First Out — enqueue at rear, dequeue from front", <List size={18} />)}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {card(<div className="p-6">
            <div className="flex items-center justify-between mb-6"><span className="text-xs text-muted-foreground font-mono flex items-center gap-1"><ArrowRight size={12} /> FRONT</span><h3 className="font-semibold text-foreground text-sm">Queue</h3><span className="text-xs text-muted-foreground font-mono flex items-center gap-1">REAR <ArrowRight size={12} /></span></div>
            <div className="flex gap-2 items-center justify-center min-h-[120px] overflow-x-auto py-4">
              {queue.length === 0 && <p className="text-muted-foreground text-sm italic">Queue is empty</p>}
              {queue.map((val, i) => {
                const isFront = i === 0, isRear = i === queue.length - 1;
                return (
                  <div key={`${i}-${val}`} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-base transition-all duration-300 ${isFront && queueAnim === "deq" ? "border-rose-400 bg-rose-400/10 text-rose-300 opacity-50 scale-90" : isRear && queueAnim === "enq" ? "border-emerald-400 bg-emerald-400/10 text-emerald-300 scale-105" : isFront ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-secondary-foreground"}`}>{val}</div>
                    <span className="text-[10px] text-muted-foreground font-mono">{isFront ? "FRONT" : isRear ? "REAR" : i}</span>
                  </div>
                );
              })}
            </div>
          </div>)}
          {card(<div className="p-6 space-y-5">
            <h3 className="font-semibold text-foreground text-sm">Operations</h3>
            <div className="space-y-3">
              <div className="flex gap-2"><input value={queueInput} onChange={e => setQueueInput(e.target.value)} onKeyDown={e => e.key === "Enter" && enqueue()} placeholder="Enter value..." className="flex-1 px-3 py-2 rounded-lg bg-input-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" type="number" />
                <button onClick={enqueue} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-1.5"><Plus size={14} /> Enqueue</button></div>
              <button onClick={dequeue} disabled={!queue.length} className="w-full px-4 py-2 rounded-lg bg-rose-500/80 text-white text-sm font-semibold hover:bg-rose-500 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"><Minus size={14} /> Dequeue</button>
            </div>
            <div className="space-y-2 pt-2 border-t border-border">{[{ label: "Size", val: queue.length.toString() }, { label: "Front", val: queue.length ? queue[0].toString() : "—" }, { label: "Rear", val: queue.length ? queue[queue.length - 1].toString() : "—" }, { label: "Enqueue / Dequeue", val: "O(1)" }].map(r => <div key={r.label}>{infoRow(r.label, r.val)}</div>)}</div>
            <div className="p-3 rounded-lg bg-muted/60 border border-border"><p className="text-xs text-muted-foreground leading-relaxed"><strong className="text-foreground">Use cases:</strong> BFS traversal, CPU scheduling, print queues, network packet handling.</p></div>
          </div>)}
        </div>
      </div>
    );
  }

  function LinkedList() {
    return (
      <div className="space-y-5">
        {sectionHeader("Linked List", "Dynamic node-based structure — each node holds data and a pointer to next", <Link2 size={18} />)}
        {card(<div className="p-6">
          <div className="flex items-center justify-between mb-6"><h3 className="font-semibold text-foreground text-sm">Singly Linked List</h3><span className="text-xs text-muted-foreground font-mono">HEAD → ... → NULL</span></div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 min-h-[100px]">
            {ll.length === 0 && <p className="text-muted-foreground text-sm italic">List is empty — NULL</p>}
            {ll.map((val, i) => (
              <div key={`${i}-${val}`} className="flex items-center gap-2 flex-shrink-0">
                <div className={`flex items-stretch rounded-lg border-2 overflow-hidden transition-all duration-300 ${llHighlight === i ? i === 0 ? "border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105" : "border-rose-400 shadow-lg shadow-rose-500/20 opacity-60" : i === 0 ? "border-primary" : "border-border"}`}>
                  <div className={`px-4 py-3 font-mono font-bold text-sm ${llHighlight === i ? i === 0 ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300" : i === 0 ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>{val}</div>
                  <div className="px-2 py-3 bg-muted/40 border-l border-border flex items-center"><span className="text-[10px] text-muted-foreground font-mono">next</span></div>
                </div>
                {i < ll.length - 1 ? <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" /> : <div className="flex items-center gap-1.5 flex-shrink-0"><ArrowRight size={16} className="text-muted-foreground" /><span className="font-mono text-xs text-muted-foreground px-2 py-1 rounded border border-border bg-secondary">NULL</span></div>}
              </div>
            ))}
          </div>
          {ll.length > 0 && <div className="mt-2 text-xs text-muted-foreground font-mono">HEAD → {ll.join(" → ")} → NULL &nbsp;|&nbsp; Length: {ll.length}</div>}
        </div>)}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {card(<div className="p-5 space-y-3"><h3 className="font-semibold text-foreground text-sm">Insert at Head</h3><div className="flex gap-2"><input value={llInput} onChange={e => setLlInput(e.target.value)} onKeyDown={e => e.key === "Enter" && llInsert()} placeholder="Value..." className="flex-1 px-3 py-2 rounded-lg bg-input-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" type="number" /><button onClick={llInsert} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors">Insert</button></div><button onClick={llDelete} disabled={!ll.length} className="w-full px-4 py-2 rounded-lg bg-rose-500/80 text-white text-sm font-semibold hover:bg-rose-500 transition-colors disabled:opacity-40">Delete Tail</button></div>)}
          {card(<div className="p-5 space-y-2"><h3 className="font-semibold text-foreground text-sm mb-3">Complexities</h3>{[{ op: "Insert Head", val: "O(1)" }, { op: "Insert Tail", val: "O(n)" }, { op: "Search", val: "O(n)" }, { op: "Delete", val: "O(n)" }, { op: "Access [i]", val: "O(n)" }].map(r => <div key={r.op}>{infoRow(r.op, r.val)}</div>)}</div>)}
        </div>
      </div>
    );
  }

  function Tree() {
    const step = treeSteps[treeIdx];
    return (
      <div className="space-y-5">
        {sectionHeader("Tree Traversal", "Navigate binary tree nodes using different systematic strategies", <GitBranch size={18} />)}
        <div className="flex gap-2 flex-wrap">
          {([["inorder", "Inorder (L→Root→R)"], ["preorder", "Preorder (Root→L→R)"], ["levelorder", "Level Order (BFS)"]] as [TreeAlgo, string][]).map(([a, label]) => (
            <button key={a} onClick={() => changeTreeAlgo(a)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${treeAlgo === a ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>{label}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {card(<div className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-4">Binary Tree</h3>
            <div className="rounded-lg bg-gray-950/40 dark:bg-black/30 p-2">
              <svg viewBox="0 0 400 260" className="w-full h-48">
                {TEDGES.map((e, i) => { const p = TN[e.p]; const c = TN[e.c]; const both = step?.visited.includes(e.p) && step?.visited.includes(e.c); return <line key={i} x1={p.cx} y1={p.cy} x2={c.cx} y2={c.cy} stroke={both ? "#60a5fa" : "#1e293b"} strokeWidth={both ? 2 : 1.5} className="transition-all duration-300" />; })}
                {TN.map(n => { const isVis = step?.visited.includes(n.id); const isCur = step?.current === n.id; return (<g key={n.id}><circle cx={n.cx} cy={n.cy} r={20} fill={isCur ? "#fbbf24" : isVis ? "#3b82f6" : "#0f172a"} stroke={isCur ? "#f59e0b" : isVis ? "#60a5fa" : "#334155"} strokeWidth={isCur ? 3 : 2} className="transition-all duration-300" /><text x={n.cx} y={n.cy} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" fill={isCur ? "#1c1917" : "#f8fafc"}>{n.val}</text></g>); })}
              </svg>
            </div>
            <div className="mt-3 flex gap-3 text-[10px] font-mono"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Current</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Visited</span></div>
            <AnimControls idx={treeIdx} total={treeSteps.length} playing={treePlaying} onPlay={() => { if (treeIdx >= treeSteps.length - 1) setTreeIdx(0); setTreePlaying(true); }} onPause={() => setTreePlaying(false)} onNext={() => setTreeIdx(i => Math.min(i + 1, treeSteps.length - 1))} onReset={() => { setTreeIdx(0); setTreePlaying(false); }} />
          </div>, "lg:col-span-2")}
          <div className="space-y-4">
            {card(<div className="p-5"><h3 className="font-semibold text-foreground text-sm mb-3">Current Step</h3><div className="p-3 rounded-lg bg-muted/60 border border-border min-h-[60px]"><p className="text-sm text-foreground">{step?.description || "Press Play to start traversal"}</p></div><div className="mt-3"><p className="text-xs text-muted-foreground mb-1">Visit order:</p><div className="flex flex-wrap gap-1">{(step?.visited || []).map(id => <span key={id} className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${step?.current === id ? "bg-amber-400 text-amber-900" : "bg-blue-500/20 text-blue-300"}`}>{TN[id].val}</span>)}</div></div></div>)}
            {card(<div className="p-5 space-y-2"><h3 className="font-semibold text-foreground text-sm mb-1">Orders Reference</h3><div className="text-xs space-y-2 font-mono"><div className="p-2 rounded bg-muted/40"><span className="text-foreground font-semibold">Inorder:</span> 4,2,5,1,6,3,7</div><div className="p-2 rounded bg-muted/40"><span className="text-foreground font-semibold">Preorder:</span> 1,2,4,5,3,6,7</div><div className="p-2 rounded bg-muted/40"><span className="text-foreground font-semibold">BFS:</span> 1,2,3,4,5,6,7</div></div></div>)}
          </div>
        </div>
      </div>
    );
  }

  // ── NEW: Binary Search Tree ───────────────────────────────────────────────
  function BST() {
    const step = bstSteps[bstIdx];
    const pathIds = step?.path ?? [];
    const currentId = step?.current ?? -1;
    const foundId = step?.found ? currentId : -1;
    return (
      <div className="space-y-5">
        {sectionHeader("Binary Search Tree", "Ordered binary tree — left child < parent < right child. O(log n) average search.", <Database size={18} />)}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {card(<div className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-4">BST Visualization [20, 30, 40, 50, 60, 70, 80]</h3>
            <div className="rounded-lg bg-gray-950/40 dark:bg-black/30 p-2"><BstSVG pathIds={pathIds} currentId={currentId} foundId={foundId} /></div>
            <div className="mt-3 flex gap-4 text-[10px] font-mono flex-wrap">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Current</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Path</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Found/Inserted</span>
            </div>
            <AnimControls idx={bstIdx} total={bstSteps.length} playing={bstPlaying} onPlay={() => { if (bstIdx >= bstSteps.length - 1) setBstIdx(0); setBstPlaying(true); }} onPause={() => setBstPlaying(false)} onNext={() => setBstIdx(i => Math.min(i + 1, bstSteps.length - 1))} onReset={() => { setBstIdx(0); setBstPlaying(false); }} />
          </div>, "lg:col-span-2")}
          <div className="space-y-4">
            {card(<div className="p-5 space-y-4">
              <h3 className="font-semibold text-foreground text-sm">Operation</h3>
              <div className="flex gap-2">
                {(["search", "insert"] as const).map(m => <button key={m} onClick={() => setBstMode(m)} className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${bstMode === m ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>{m}</button>)}
              </div>
              <div className="flex gap-2">
                <input value={bstInput} onChange={e => setBstInput(e.target.value)} onKeyDown={e => e.key === "Enter" && runBST()} placeholder="Value (1-99)..." className="flex-1 px-3 py-2 rounded-lg bg-input-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" type="number" />
                <button onClick={runBST} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"><Play size={14} /></button>
              </div>
              {step && <div className="p-3 rounded-lg bg-muted/60 border border-border min-h-[56px]"><p className="text-sm text-foreground">{step.description}</p></div>}
            </div>)}
            {card(<div className="p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-sm mb-2">BST Properties</h3>
              {infoRow("Search (avg)", "O(log n)", "text-emerald-400")}
              {infoRow("Search (worst)", "O(n)", "text-rose-400")}
              {infoRow("Insert (avg)", "O(log n)", "text-emerald-400")}
              {infoRow("Delete (avg)", "O(log n)", "text-emerald-400")}
              {infoRow("Space", "O(n)", "text-blue-400")}
              <div className="pt-2 border-t border-border text-xs text-muted-foreground leading-relaxed">Left subtree values &lt; root &lt; right subtree. Inorder traversal gives sorted order.</div>
            </div>)}
          </div>
        </div>
      </div>
    );
  }

  // ── NEW: Binary Tree ──────────────────────────────────────────────────────
  function BinaryTree() {
    const tabs = [
      { key: "perfect", label: "Perfect", desc: "All internal nodes have exactly 2 children, all leaves at the same level.", highlight: [0, 1, 2, 3, 4, 5, 6], formula: "Nodes = 2ʰ⁺¹ − 1", detail: "Height h=2, Nodes=7, Leaves=4, Level 0: 1 node, Level 1: 2, Level 2: 4" },
      { key: "complete", label: "Complete", desc: "All levels fully filled except possibly the last, which is filled left-to-right.", highlight: [0, 1, 2, 3, 4, 5], formula: "Max nodes = 2ʰ⁺¹ − 1", detail: "Height h=2, Nodes=6, Last level fills left-to-right" },
      { key: "full", label: "Full", desc: "Every node has exactly 0 or 2 children — no node has exactly 1 child.", highlight: [0, 1, 2, 3, 4, 5, 6], formula: "Leaves = internal + 1", detail: "This tree is full: root has 2, each internal has 2, leaves have 0" },
    ] as const;
    const active = tabs.find(t => t.key === btTab)!;
    return (
      <div className="space-y-5">
        {sectionHeader("Binary Tree", "A tree where each node has at most 2 children — understand Perfect, Complete, and Full types", <GitFork size={18} />)}
        <div className="flex gap-2">
          {tabs.map(t => <button key={t.key} onClick={() => setBtTab(t.key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${btTab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>{t.label} Binary Tree</button>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {card(<div className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-4">{active.label} Binary Tree</h3>
            <div className="rounded-lg bg-gray-950/40 dark:bg-black/30 p-2">
              <svg viewBox="0 0 400 260" className="w-full h-48">
                {TEDGES.map((e, i) => { const p = TN[e.p]; const c = TN[e.c]; const show = active.highlight.includes(e.p) && active.highlight.includes(e.c); return <line key={i} x1={p.cx} y1={p.cy} x2={c.cx} y2={c.cy} stroke={show ? "#60a5fa" : "#0f172a"} strokeWidth={show ? 2 : 0} />; })}
                {TN.map(n => { const vis = active.highlight.includes(n.id); return (<g key={n.id}><circle cx={n.cx} cy={n.cy} r={20} fill={vis ? "#2563eb" : "#0c1228"} stroke={vis ? "#60a5fa" : "#1e293b"} strokeWidth={vis ? 2 : 1} className="transition-all duration-300" /><text x={n.cx} y={n.cy} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" fill={vis ? "#f8fafc" : "#334155"}>{n.val}</text></g>); })}
              </svg>
            </div>
            <div className="mt-3 p-2 rounded bg-muted/40 font-mono text-xs text-center text-primary">{active.formula}</div>
          </div>, "lg:col-span-2")}
          <div className="space-y-4">
            {card(<div className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">{active.label} — Definition</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{active.desc}</p>
              <div className="p-3 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground leading-relaxed">{active.detail}</div>
            </div>)}
            {card(<div className="p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-sm mb-2">General Properties</h3>
              {infoRow("Max nodes at level h", "2ʰ", "text-blue-400")}
              {infoRow("Max nodes (height h)", "2ʰ⁺¹ − 1", "text-violet-400")}
              {infoRow("Min height for n nodes", "⌊log₂ n⌋", "text-emerald-400")}
              {infoRow("Height of this tree", "2", "text-amber-400")}
              {infoRow("Traversal time", "O(n)", "text-primary")}
            </div>)}
          </div>
        </div>
      </div>
    );
  }

  // ── NEW: Threaded Binary Tree ─────────────────────────────────────────────
  function ThreadedBST() {
    const step = threadedSteps[threadedIdx];
    const threadHighlight = step?.usingThread ? step.current : -1;
    return (
      <div className="space-y-5">
        {sectionHeader("Threaded Binary Tree", "Null right pointers replaced by threads to inorder successors — traverse without a stack", <Share2 size={18} />)}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {card(<div className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-1">Right-Threaded BST</h3>
            <p className="text-xs text-muted-foreground mb-4">Dashed arcs = thread pointers (right null → inorder successor)</p>
            <div className="rounded-lg bg-gray-950/40 dark:bg-black/30 p-2">
              <BstSVG pathIds={step?.visited ?? []} currentId={step?.current ?? -1} foundId={-1} threadHighlight={threadHighlight} showThreads />
            </div>
            <div className="mt-3 flex gap-4 text-[10px] font-mono flex-wrap">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Current</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Visited</span>
              <span className="flex items-center gap-1 text-violet-400">- - - Thread pointer</span>
            </div>
            <AnimControls idx={threadedIdx} total={threadedSteps.length} playing={threadedPlaying} onPlay={() => { if (threadedIdx >= threadedSteps.length - 1) setThreadedIdx(0); setThreadedPlaying(true); }} onPause={() => setThreadedPlaying(false)} onNext={() => setThreadedIdx(i => Math.min(i + 1, threadedSteps.length - 1))} onReset={() => { setThreadedIdx(0); setThreadedPlaying(false); }} />
          </div>, "lg:col-span-2")}
          <div className="space-y-4">
            {card(<div className="p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">Current Step</h3>
              <div className="p-3 rounded-lg bg-muted/60 border border-border min-h-[60px]"><p className="text-sm text-foreground">{step?.description || "Press Play to begin threaded traversal"}</p></div>
              {step?.usingThread && <div className="mt-2 p-2 rounded bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 font-semibold">↻ Thread pointer used! (No stack needed)</div>}
              <div className="mt-3"><p className="text-xs text-muted-foreground mb-1">Visited:</p><div className="flex flex-wrap gap-1">{(step?.visited ?? []).map(id => <span key={id} className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${step?.current === id ? "bg-amber-400 text-amber-900" : "bg-blue-500/20 text-blue-300"}`}>{BST_NODES[id].val}</span>)}</div></div>
            </div>)}
            {card(<div className="p-5 space-y-2">
              <h3 className="font-semibold text-foreground text-sm mb-2">Threading Concept</h3>
              <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <div className="p-2 rounded bg-muted/40"><strong className="text-foreground">Right thread:</strong> If right child is NULL, store inorder successor</div>
                <div className="p-2 rounded bg-muted/40"><strong className="text-foreground">Benefit:</strong> O(n) inorder traversal with O(1) extra space</div>
                <div className="p-2 rounded bg-muted/40"><strong className="text-foreground">Standard:</strong> Requires O(n) stack space</div>
              </div>
              {infoRow("Traversal Time", "O(n)", "text-emerald-400")}
              {infoRow("Extra Space", "O(1)", "text-emerald-400")}
              {infoRow("Stack required", "No", "text-emerald-400")}
              <div className="text-xs font-mono text-muted-foreground pt-1">Threads: 20→30, 40→50, 60→70</div>
            </div>)}
          </div>
        </div>
      </div>
    );
  }

  // ── Existing: Graph BFS/DFS ───────────────────────────────────────────────
  function Graph() {
    const step = graphSteps[graphIdx];
    return (
      <div className="space-y-5">
        {sectionHeader("Graph BFS / DFS", "Traverse weighted graphs with BFS (queue) or DFS (stack) strategies", <Network size={18} />)}
        <div className="flex gap-2">
          {([["bfs", "BFS — Breadth First"], ["dfs", "DFS — Depth First"]] as [GraphAlgo, string][]).map(([a, label]) => (
            <button key={a} onClick={() => changeGraphAlgo(a)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${graphAlgo === a ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>{label}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {card(<div className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-4">Graph Canvas</h3>
            <div className="rounded-lg bg-gray-950/40 dark:bg-black/30 p-2">
              <GraphSVG
                edgeColor={i => { const e = GE[i]; return (step?.visited.includes(e.f) && step?.visited.includes(e.t)) ? "#3b82f6" : "#1e293b"; }}
                nodeColor={id => step?.current === id ? "#fbbf24" : step?.visited.includes(id) ? "#2563eb" : step?.frontier.includes(id) ? "#7c3aed" : "#0f172a"}
              />
            </div>
            <div className="mt-3 flex gap-4 text-[10px] font-mono flex-wrap">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Current</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Visited</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" /> Queue/Stack</span>
            </div>
            <AnimControls idx={graphIdx} total={graphSteps.length} playing={graphPlaying} onPlay={() => { if (graphIdx >= graphSteps.length - 1) setGraphIdx(0); setGraphPlaying(true); }} onPause={() => setGraphPlaying(false)} onNext={() => setGraphIdx(i => Math.min(i + 1, graphSteps.length - 1))} onReset={() => { setGraphIdx(0); setGraphPlaying(false); }} />
          </div>, "lg:col-span-2")}
          <div className="space-y-4">
            {card(<div className="p-5"><h3 className="font-semibold text-foreground text-sm mb-3">Step Info</h3><div className="p-3 rounded-lg bg-muted/60 border border-border min-h-[60px]"><p className="text-sm text-foreground">{step?.description || "Press Play to begin"}</p></div><div className="mt-3 space-y-2"><div><p className="text-xs text-muted-foreground mb-1">Visited:</p><div className="flex flex-wrap gap-1">{(step?.visited || []).map(id => <span key={id} className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${step?.current === id ? "bg-amber-400 text-amber-900" : "bg-blue-600/30 text-blue-300"}`}>{GN[id].label}</span>)}</div></div><div><p className="text-xs text-muted-foreground mb-1">{graphAlgo === "bfs" ? "Queue" : "Stack"}:</p><div className="flex flex-wrap gap-1">{(step?.frontier || []).map((id, i) => <span key={i} className="px-2 py-0.5 rounded font-mono text-xs bg-violet-500/20 text-violet-300">{GN[id].label}</span>)}{!(step?.frontier?.length) && <span className="text-xs text-muted-foreground italic">empty</span>}</div></div></div></div>)}
            {card(<div className="p-5 space-y-2"><h3 className="font-semibold text-foreground text-sm mb-2">Info</h3>{infoRow("Data structure", graphAlgo === "bfs" ? "Queue (FIFO)" : "Stack (LIFO)")}{infoRow("Time", "O(V + E)")}{infoRow("Space", "O(V)")}{infoRow("Nodes (V)", GN.length.toString())}{infoRow("Edges (E)", GE.length.toString())}</div>)}
          </div>
        </div>
      </div>
    );
  }

  // ── NEW: Dijkstra ─────────────────────────────────────────────────────────
  function Dijkstra() {
    const step = dijkStep;
    const INF = 9999;
    return (
      <div className="space-y-5">
        {sectionHeader("Dijkstra's Algorithm", "Single-source shortest path on a weighted graph using a greedy approach", <Route size={18} />)}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {card(<div className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-4">Weighted Graph — Source: A</h3>
            <div className="rounded-lg bg-gray-950/40 dark:bg-black/30 p-2">
              <GraphSVG
                edgeColor={i => { const e = GE[i]; if (step?.relaxing && ((step.relaxing[0] === e.f && step.relaxing[1] === e.t) || (step.relaxing[0] === e.t && step.relaxing[1] === e.f))) return "#fbbf24"; return (step?.visited.includes(e.f) && step?.visited.includes(e.t)) ? "#10b981" : "#1e293b"; }}
                edgeWidth={i => { const e = GE[i]; if (step?.relaxing && ((step.relaxing[0] === e.f && step.relaxing[1] === e.t) || (step.relaxing[0] === e.t && step.relaxing[1] === e.f))) return 2.5; return 1.5; }}
                nodeColor={id => step?.current === id ? "#fbbf24" : step?.visited.includes(id) ? "#10b981" : "#0f172a"}
              />
            </div>
            <div className="mt-3 flex gap-3 text-[10px] font-mono flex-wrap">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Processing</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Finalized</span>
              <span className="flex items-center gap-1 text-amber-400">— Relaxing edge</span>
            </div>
            <AnimControls idx={dijkIdx} total={dijkSteps.length} playing={dijkPlaying} onPlay={() => { if (dijkIdx >= dijkSteps.length - 1) setDijkIdx(0); setDijkPlaying(true); }} onPause={() => setDijkPlaying(false)} onNext={() => setDijkIdx(i => Math.min(i + 1, dijkSteps.length - 1))} onReset={() => { setDijkIdx(0); setDijkPlaying(false); }} />
          </div>, "lg:col-span-2")}
          <div className="space-y-4">
            {card(<div className="p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">Distance Table</h3>
              <div className="space-y-1.5">
                {GN.map(n => {
                  const d = step?.dist[n.id] ?? INF;
                  const finalized = step?.visited.includes(n.id);
                  const isCur = step?.current === n.id;
                  return (
                    <div key={n.id} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${isCur ? "bg-amber-400/10 border border-amber-400/30" : finalized ? "bg-emerald-400/10 border border-emerald-400/20" : "bg-muted/40 border border-transparent"}`}>
                      <span className="font-bold text-foreground w-6">{n.label}</span>
                      <span className={`font-mono font-semibold ${finalized ? "text-emerald-400" : isCur ? "text-amber-400" : d === INF ? "text-muted-foreground" : "text-blue-400"}`}>{d === INF ? "∞" : d}</span>
                      <span className="text-muted-foreground text-[10px]">{finalized ? "✓" : isCur ? "→" : ""}</span>
                    </div>
                  );
                })}
              </div>
            </div>)}
            {card(<div className="p-5"><h3 className="font-semibold text-foreground text-sm mb-3">Step</h3><div className="p-3 rounded-lg bg-muted/60 border border-border min-h-[56px]"><p className="text-xs text-foreground leading-relaxed">{step?.description || "Press Play to start"}</p></div><div className="mt-3 space-y-1">{infoRow("Time", "O(V²) simple", "text-amber-400")}{infoRow("Space", "O(V)")}{infoRow("Works for", "Non-negative weights")}</div></div>)}
          </div>
        </div>
      </div>
    );
  }

  // ── NEW: Kruskal ──────────────────────────────────────────────────────────
  function Kruskal() {
    const step = kruskalStep;
    return (
      <div className="space-y-5">
        {sectionHeader("Kruskal's Algorithm", "Minimum Spanning Tree via greedy edge selection and Union-Find cycle detection", <GitMerge size={18} />)}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {card(<div className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-4">Graph — Building MST</h3>
            <div className="rounded-lg bg-gray-950/40 dark:bg-black/30 p-2">
              <GraphSVG
                edgeColor={i => { if (!step) return "#1e293b"; if (step.mstEdges.includes(i)) return "#10b981"; if (step.checkedEdge === i) return step.accepted === false ? "#f87171" : "#fbbf24"; return "#1e293b"; }}
                edgeWidth={i => { if (!step) return 1.5; if (step.mstEdges.includes(i)) return 2.5; if (step.checkedEdge === i) return 2; return 1.5; }}
                nodeColor={id => { if (!step) return "#0f172a"; const inMST = step.mstEdges.some(ei => GE[ei].f === id || GE[ei].t === id); return inMST ? "#10b981" : "#0f172a"; }}
              />
            </div>
            <div className="mt-3 flex gap-3 text-[10px] font-mono flex-wrap">
              <span className="flex items-center gap-1 text-emerald-400">— MST edge</span>
              <span className="flex items-center gap-1 text-amber-400">— Checking</span>
              <span className="flex items-center gap-1 text-rose-400">— Rejected</span>
            </div>
            <AnimControls idx={kruskalIdx} total={kruskalSteps.length} playing={kruskalPlaying} onPlay={() => { if (kruskalIdx >= kruskalSteps.length - 1) setKruskalIdx(0); setKruskalPlaying(true); }} onPause={() => setKruskalPlaying(false)} onNext={() => setKruskalIdx(i => Math.min(i + 1, kruskalSteps.length - 1))} onReset={() => { setKruskalIdx(0); setKruskalPlaying(false); }} />
          </div>, "lg:col-span-2")}
          <div className="space-y-4">
            {card(<div className="p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">Edge Queue (sorted by weight)</h3>
              <div className="space-y-1">
                {[...GE].map((e, i) => ({ ...e, idx: i })).sort((a, b) => a.w - b.w).map(e => (
                  <div key={e.idx} className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all ${step?.mstEdges.includes(e.idx) ? "bg-emerald-500/10 border border-emerald-500/20" : step?.checkedEdge === e.idx ? step.accepted === false ? "bg-rose-500/10 border border-rose-500/20" : "bg-amber-500/10 border border-amber-500/20" : "bg-muted/30 border border-transparent"}`}>
                    <span className="font-bold text-foreground w-12 font-mono">{GN[e.f].label}-{GN[e.t].label}</span>
                    <span className="font-mono text-primary">w={e.w}</span>
                    <span className="ml-auto text-[10px]">{step?.mstEdges.includes(e.idx) ? "✓ MST" : step?.checkedEdge === e.idx ? step.accepted === false ? "✗ Skip" : "→" : ""}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border">{infoRow("MST Weight", (step?.totalWeight ?? 0).toString(), "text-emerald-400")}{infoRow("MST Edges", (step?.mstEdges.length ?? 0).toString(), "text-primary")}</div>
            </div>)}
            {card(<div className="p-5"><h3 className="font-semibold text-foreground text-sm mb-3">Step</h3><div className="p-3 rounded-lg bg-muted/60 border border-border min-h-[56px]"><p className="text-xs text-foreground leading-relaxed">{step?.description || "Press Play"}</p></div><div className="mt-3 space-y-1">{infoRow("Time", "O(E log E)")}{infoRow("Space", "O(V)")}{infoRow("Uses", "Union-Find")}</div></div>)}
          </div>
        </div>
      </div>
    );
  }

  // ── NEW: Prim ─────────────────────────────────────────────────────────────
  function Prim() {
    const step = primStep;
    return (
      <div className="space-y-5">
        {sectionHeader("Prim's Algorithm", "Minimum Spanning Tree by greedily adding the cheapest crossing edge from the growing MST", <Cpu size={18} />)}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {card(<div className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-4">Graph — Growing MST from A</h3>
            <div className="rounded-lg bg-gray-950/40 dark:bg-black/30 p-2">
              <GraphSVG
                edgeColor={i => { if (!step) return "#1e293b"; if (step.mstEdges.includes(i)) return "#10b981"; if (step.checkedEdge === i) return "#fbbf24"; return "#1e293b"; }}
                edgeWidth={i => { if (!step) return 1.5; if (step.mstEdges.includes(i)) return 2.5; if (step.checkedEdge === i) return 2; return 1.5; }}
                nodeColor={id => { if (!step) return "#0f172a"; if (step.inMST.includes(id)) return "#10b981"; return "#0f172a"; }}
              />
            </div>
            <div className="mt-3 flex gap-3 text-[10px] font-mono flex-wrap">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> In MST</span>
              <span className="flex items-center gap-1 text-amber-400">— Min edge added</span>
            </div>
            <AnimControls idx={primIdx} total={primSteps.length} playing={primPlaying} onPlay={() => { if (primIdx >= primSteps.length - 1) setPrimIdx(0); setPrimPlaying(true); }} onPause={() => setPrimPlaying(false)} onNext={() => setPrimIdx(i => Math.min(i + 1, primSteps.length - 1))} onReset={() => { setPrimIdx(0); setPrimPlaying(false); }} />
          </div>, "lg:col-span-2")}
          <div className="space-y-4">
            {card(<div className="p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">MST Progress</h3>
              <div className="space-y-1.5">
                {GN.map(n => <div key={n.id} className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all ${step?.inMST.includes(n.id) ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-muted/30 border border-transparent"}`}><span className="font-bold w-5 text-foreground">{n.label}</span><span className="text-muted-foreground">{step?.inMST.includes(n.id) ? "In MST ✓" : "Not yet added"}</span></div>)}
              </div>
              <div className="mt-3 pt-3 border-t border-border">{infoRow("MST Total Weight", (step?.totalWeight ?? 0).toString(), "text-emerald-400")}{infoRow("Nodes in MST", (step?.inMST.length ?? 0).toString(), "text-primary")}</div>
            </div>)}
            {card(<div className="p-5"><h3 className="font-semibold text-foreground text-sm mb-3">Step</h3><div className="p-3 rounded-lg bg-muted/60 border border-border min-h-[56px]"><p className="text-xs text-foreground leading-relaxed">{step?.description || "Press Play"}</p></div><div className="mt-3 space-y-1">{infoRow("Time", "O(V²) simple")}{infoRow("Space", "O(V)")}{infoRow("vs Kruskal", "Better for dense")}</div></div>)}
          </div>
        </div>
      </div>
    );
  }

  // ── NEW: Topological Sort ─────────────────────────────────────────────────
  function Topo() {
    const step = topoStep;
    return (
      <div className="space-y-5">
        {sectionHeader("Topological Sort", "Linear ordering of a Directed Acyclic Graph (DAG) using Kahn's BFS algorithm", <ArrowUpDown size={18} />)}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {card(<div className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-1">Course Prerequisite DAG</h3>
            <p className="text-xs text-muted-foreground mb-4">Arrows show dependencies (A must be taken before B and C, etc.)</p>
            <div className="rounded-lg bg-gray-950/40 dark:bg-black/30 p-2">
              <svg viewBox="0 0 440 280" className="w-full h-52">
                <defs>
                  <marker id="topoArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#334155" /></marker>
                  <marker id="topoArrowActive" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#60a5fa" /></marker>
                </defs>
                {TOPO_EDGES.map((e, i) => {
                  const fn = TOPO_NODES[e.f]; const tn = TOPO_NODES[e.t];
                  const dx = tn.cx - fn.cx; const dy = tn.cy - fn.cy;
                  const len = Math.sqrt(dx * dx + dy * dy); const r = 24;
                  const x1 = fn.cx + (dx / len) * r; const y1 = fn.cy + (dy / len) * r;
                  const x2 = tn.cx - (dx / len) * (r + 8); const y2 = tn.cy - (dy / len) * (r + 8);
                  const active = step?.result.includes(e.f) && step?.result.includes(e.t);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={active ? "#60a5fa" : "#334155"} strokeWidth={active ? 2 : 1.5} markerEnd={active ? "url(#topoArrowActive)" : "url(#topoArrow)"} className="transition-all duration-300" />;
                })}
                {TOPO_NODES.map(n => {
                  const inResult = step?.result.includes(n.id); const isCur = step?.current === n.id; const inQueue = step?.queue.includes(n.id);
                  return (
                    <g key={n.id}>
                      <circle cx={n.cx} cy={n.cy} r={24} fill={isCur ? "#fbbf24" : inResult ? "#2563eb" : inQueue ? "#7c3aed" : "#0f172a"} stroke={isCur ? "#f59e0b" : inResult ? "#60a5fa" : inQueue ? "#a78bfa" : "#334155"} strokeWidth={isCur ? 3 : 2} className="transition-all duration-300" />
                      <text x={n.cx} y={n.cy - 5} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" fill={isCur ? "#1c1917" : "#f8fafc"}>{n.label}</text>
                      <text x={n.cx} y={n.cy + 9} textAnchor="middle" dominantBaseline="central" fontSize="7" fill={isCur ? "#44403c" : "#64748b"}>{n.name}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="mt-3 flex gap-3 text-[10px] font-mono flex-wrap">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Processing</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Done</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-600 inline-block" /> In Queue</span>
            </div>
            <AnimControls idx={topoIdx} total={topoSteps.length} playing={topoPlaying} onPlay={() => { if (topoIdx >= topoSteps.length - 1) setTopoIdx(0); setTopoPlaying(true); }} onPause={() => setTopoPlaying(false)} onNext={() => setTopoIdx(i => Math.min(i + 1, topoSteps.length - 1))} onReset={() => { setTopoIdx(0); setTopoPlaying(false); }} />
          </div>, "lg:col-span-2")}
          <div className="space-y-4">
            {card(<div className="p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">Kahn's Algorithm State</h3>
              <div className="space-y-2">
                <div><p className="text-xs text-muted-foreground mb-1">In-Degrees:</p><div className="grid grid-cols-3 gap-1">{TOPO_NODES.map(n => <div key={n.id} className={`text-center px-2 py-1 rounded text-xs font-mono transition-all ${step?.result.includes(n.id) ? "bg-blue-600/20 text-blue-300" : "bg-muted/40 text-foreground"}`}><span className="font-bold">{n.label}:</span> {step?.inDegree[n.id] ?? 0}</div>)}</div></div>
                <div><p className="text-xs text-muted-foreground mb-1">Queue:</p><div className="flex flex-wrap gap-1">{(step?.queue || []).map((id, i) => <span key={i} className="px-2 py-0.5 rounded font-mono text-xs bg-violet-500/20 text-violet-300">{TOPO_NODES[id].label}</span>)}{!(step?.queue?.length) && <span className="text-xs text-muted-foreground italic">empty</span>}</div></div>
                <div><p className="text-xs text-muted-foreground mb-1">Result order:</p><div className="flex flex-wrap gap-1">{(step?.result || []).map((id, i) => <span key={i} className="px-2 py-0.5 rounded font-mono text-xs bg-blue-600/30 text-blue-300 font-bold">{TOPO_NODES[id].label}</span>)}</div></div>
              </div>
            </div>)}
            {card(<div className="p-5"><h3 className="font-semibold text-foreground text-sm mb-3">Step</h3><div className="p-3 rounded-lg bg-muted/60 border border-border min-h-[56px]"><p className="text-xs text-foreground leading-relaxed">{step?.description || "Press Play"}</p></div><div className="mt-3 space-y-1">{infoRow("Time", "O(V + E)")}{infoRow("Space", "O(V)")}{infoRow("Requires", "DAG (no cycles)")}</div></div>)}
          </div>
        </div>
      </div>
    );
  }

  function Complexity() {
    const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f87171"];
    const LINES = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)"] as const;
    return (
      <div className="space-y-5">
        {sectionHeader("Big-O Complexity Analysis", "Compare time and space complexity across all algorithms", <Activity size={18} />)}
        {card(<div className="p-5"><h3 className="font-semibold text-foreground text-sm mb-4">Growth Rate Comparison</h3><ResponsiveContainer width="100%" height={240}><LineChart data={CDATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="n" tick={{ fontSize: 11, fill: "#64748b" }} /><YAxis tick={{ fontSize: 11, fill: "#64748b" }} /><Tooltip contentStyle={{ background: "#0d1130", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: 12 }} labelStyle={{ color: "#dde4f5" }} /><Legend wrapperStyle={{ fontSize: 12 }} />{LINES.map((key, i) => <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />)}</LineChart></ResponsiveContainer></div>)}
        {card(<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Algorithm</th><th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average</th><th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Best</th><th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Worst</th><th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Space</th><th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stable</th></tr></thead><tbody>{ALGO_TABLE.map((row, i) => (<tr key={row.name} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}><td className="px-4 py-3 font-medium text-foreground text-sm">{row.name}</td><td className="px-3 py-3 text-center"><span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{row.time}</span></td><td className="px-3 py-3 text-center"><span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{row.best}</span></td><td className="px-3 py-3 text-center"><span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">{row.worst}</span></td><td className="px-3 py-3 text-center"><span className="font-mono text-xs text-blue-400">{row.space}</span></td><td className="px-3 py-3 text-center"><span className={`text-xs font-semibold ${row.stable ? "text-emerald-400" : "text-rose-400"}`}>{row.stable ? "Yes" : "No"}</span></td></tr>))}</tbody></table></div>)}
      </div>
    );
  }

  function Practice() {
    return (
      <div className="space-y-5">
        {sectionHeader("Practice Mode", "Input your own array and watch any algorithm sort it step-by-step", <Code size={18} />)}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {card(<div className="p-5 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Configure Your Run</h3>
            <div><label className="text-xs font-semibold text-muted-foreground mb-2 block">Input Array (comma-separated)</label><textarea value={practiceInput} onChange={e => setPracticeInput(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-foreground text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" rows={3} /></div>
            <div><label className="text-xs font-semibold text-muted-foreground mb-2 block">Algorithm</label><div className="grid grid-cols-2 gap-2">{(["bubble", "selection", "insertion", "quick"] as SortAlgo[]).map(a => <button key={a} onClick={() => setPracticeAlgo(a)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${practiceAlgo === a ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>{SORT_ALGO_INFO[a].label}</button>)}</div></div>
            <button onClick={runPractice} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"><Zap size={15} /> Run Algorithm</button>
            {practiceSteps.length > 0 && <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><p className="text-xs text-emerald-400 font-semibold">✓ {practiceSteps.length} steps generated</p></div>}
          </div>)}
          {card(<div className="p-5">
            <h3 className="font-semibold text-foreground text-sm mb-4">Visualization</h3>
            {practiceSteps.length === 0 ? <div className="h-48 flex items-center justify-center text-muted-foreground text-sm italic">Enter array and click Run Algorithm</div> : <SortBars step={practiceStep ?? practiceSteps[0]} maxVal={maxPracticeVal} />}
            <AnimControls idx={practiceIdx} total={practiceSteps.length} playing={practicePlaying} onPlay={() => { if (practiceIdx >= practiceSteps.length - 1) setPracticeIdx(0); setPracticePlaying(true); }} onPause={() => setPracticePlaying(false)} onNext={() => setPracticeIdx(i => Math.min(i + 1, practiceSteps.length - 1))} onReset={() => { setPracticeIdx(0); setPracticePlaying(false); }} showSpeed />
          </div>, "lg:col-span-2")}
        </div>
        {practiceSteps.length > 0 && card(<div className="p-5"><div className="flex items-center gap-3 mb-2"><h3 className="font-semibold text-foreground text-sm">Step Explanation</h3><div className="flex gap-3 text-[10px] font-mono ml-auto"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" /> Comparing</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-400 inline-block" /> Swapped</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" /> Sorted</span></div></div><div className="p-3 rounded-lg bg-muted/60 border border-border"><p className="text-sm text-foreground">{practiceStep?.description || "—"}</p></div></div>)}
      </div>
    );
  }

  // ── View map & render ─────────────────────────────────────────────────────
  const viewMap: Record<View, () => React.ReactElement> = {
    dashboard: Dashboard, sorting: Sorting, stack: Stack, queue: Queue, linkedlist: LinkedList,
    tree: Tree, bst: BST, binarytree: BinaryTree, threadedbst: ThreadedBST,
    graph: Graph, dijkstra: Dijkstra, kruskal: Kruskal, prim: Prim, topo: Topo,
    complexity: Complexity, practice: Practice,
  };

  // Flat nav list for breadcrumb lookup
  const ALL_NAV = NAV_SECTIONS.flatMap(s => s.items);

  return (
    <div className={`${isDark ? "dark" : ""} flex h-screen overflow-hidden`} style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-60" : "w-0 lg:w-16"} flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-hidden`}>
          <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0"><Zap size={16} className="text-primary-foreground" /></div>
            {sidebarOpen && <div className="overflow-hidden"><p className="font-extrabold text-sm text-foreground leading-none whitespace-nowrap" style={{ fontFamily: "Outfit, sans-serif" }}>DSA Visualizer</p><p className="text-[10px] text-muted-foreground">Pro Edition</p></div>}
          </div>

          <nav className="flex-1 overflow-y-auto py-2 px-2 [scrollbar-width:thin]">
            {NAV_SECTIONS.map((section, si) => (
              <div key={si} className="mb-1">
                {section.label && sidebarOpen && (
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 pt-3 pb-1">{section.label}</p>
                )}
                {section.label && !sidebarOpen && <div className="h-px bg-sidebar-border my-1.5 mx-2" />}
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const Icon = item.icon; const active = view === item.id;
                    return (
                      <button key={item.id} onClick={() => setView(item.id as View)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${active ? "bg-primary/10 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"}`}>
                        <Icon size={15} className={`flex-shrink-0 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                        {sidebarOpen && <span className="truncate whitespace-nowrap text-xs">{item.label}</span>}
                        {active && sidebarOpen && <ChevronRight size={11} className="ml-auto text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {sidebarOpen && (
            <div className="px-4 py-3 border-t border-sidebar-border">
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">© {new Date().getFullYear()} DSA Visualizer Pro<br />All Rights Reserved.</p>
            </div>
          )}
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header className="h-14 border-b border-border flex items-center gap-3 px-4 flex-shrink-0 bg-card/50 backdrop-blur-sm">
            <button onClick={() => setSidebarOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><Menu size={16} /></button>
            <div className="flex-1 relative max-w-sm hidden sm:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search algorithms..." className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-input-background border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                <span>DSA</span><ChevronRight size={12} />
                <span className="text-foreground font-medium">{ALL_NAV.find(n => n.id === view)?.label || view}</span>
              </div>
              <button onClick={() => setIsDark(d => !d)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Toggle dark mode">
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 lg:p-6 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] hover:[scrollbar-color:var(--muted-foreground)_transparent]">
            {viewMap[view]()}
            <footer className="mt-10 pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} DSA Visualizer Pro — All Rights Reserved.</p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
