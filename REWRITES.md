# Module rewrites

Every module in this guide is to be rewritten from a blank page, the way TFE4146 module 01
«Energibånd og ladningsbærere» was rewritten in October 2026. The old modules read like
encyclopedia articles: they went straight through the topic and stated things instead of
explaining them. Editing them sentence by sentence did not fix that. This file tracks which
modules have been rewritten and which remain.

## How a rewrite is done

Follow `WRITING.md` §9 in the framework repo (with §2, how a module teaches): start from a blank
page, build intuition before the math with sims and figures designed alongside the text, have an
independent agent review the draft, and show the maintainer the new module side by side with the
current one. Nothing is committed until the maintainer approves it.

Statuses: **to rewrite**, **in review** (a draft exists outside this repo and is with the
maintainer), **rewritten** (approved and committed).

## Status

| Module | Status | Notes |
|---|---|---|
| 01 Algoritmer og kompleksitet | **rewritten** | Rewritten from scratch with a new stepper, two sims and a figure; approved and committed 2026-10-20. The same commit moves the whole guide to the lecturer’s range notation `A[1 : n]`. |
| 02 Datastrukturer | **rewritten** | Rewritten from scratch with two sims for the stack and the queue, a list stepper, a hash-table sim, a table-doubling sim and two figures; approved after round 1 and committed 2026-10-21. |
| 03 Problemer og reduksjoner | **rewritten** | Rewritten from scratch with a CLIQUE sim, a reduction figure and two steppers (the recursive Insertion-Sort as a ladder, Largest-Group); approved after round 2 and committed 2026-10-21. Round 2 tells the clique example as people who know each other, since graphs come later. |
| 04 Splitt og hersk | **rewritten** | Rewritten from scratch with steppers for Merge, Merge-Sort (the calls as a tree) and Partition, a Quicksort-tree sim and a recursion-tree sim for the master theorem; approved after round 1 and committed 2026-10-22. |
| 05 Rangering i lineær tid | **rewritten** | Rewritten from scratch with a sim of the sorting bound as a game against the «kjiping», a decision-tree figure, a Randomized-Select stepper and a sim of it as one path down the Quicksort tree, a median-of-medians figure, a Counting-Sort stepper, a Radix-Sort sim with both failure modes and a Bucket-Sort sim; approved after round 1 and committed 2026-10-22. |
| 06 Rotfaste trestrukturer | **rewritten** | Rewritten from scratch with steppers for Tree-Insert, Inorder-Tree-Walk, Max-Heap-Extract-Max, Max-Heap-Insert and Heapsort, a sim of insertion order and height, a sim of the two ways to build a heap, and three figures; approved after round 2 and committed 2026-10-23. Round 2 puts the subject first where round 1 used inverted word order. |
| 07 Dynamisk programmering | **rewritten** | Rewritten from scratch with a sim of Cut-Rod's calls (without and with storage, and as the subproblem graph), steppers for Bottom-Up-Cut-Rod, LCS-Length with Print-LCS and Knapsack′, and three figures; approved after round 1 and committed 2026-10-24. |
| 08 Grådighet | **rewritten** | Rewritten from scratch with a sim of three greedy rules for aktivitetsutvalg, steppers for Recursive-Activity-Selector, Decode-PFC and Huffman, and four figures (the exchange of activities, binary and continuous knapsack, prefix-free codes, the Huffman swap); approved after round 1 and committed 2026-10-24. |
| 09 Traversering av grafer | **rewritten** | Rewritten from scratch with a sim of the to-do list on a street grid (oldest first, newest first or by hand), steppers for DFS (with the parentheses as a time row), Topological-Sort, Strongly-Connected-Components and BFS with Print-Path, and three figures (the graph in memory, edge classes, the component graph); approved after round 1 and committed 2026-10-24. |
| 10 Minimale spenntrær | **rewritten** | Rewritten from scratch around one village after a snowfall, with a sim for plowing by hand, a sim of the cut as a river the reader moves farms across, steppers for MST-Kruskal (with the river round u's tree), Connected-Components on disjoint sets (the village and the pointer forest together) and MST-Prim (with the river round the tree), and a figure of the exchange proof; approved after round 1 and committed 2026-10-24. |
| 11 Korteste vei fra én til alle | to rewrite |  |
| 12 Korteste vei fra alle til alle | to rewrite |  |
| 13 Maksimal flyt | to rewrite |  |
| 14 NP-kompletthet | to rewrite |  |
| 15 NP-komplette problemer | to rewrite |  |

The module structure was surveyed against the syllabus on 2026-10-19 and needs no change.
