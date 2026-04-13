## 2025-05-14 - Optimization of groupPodcastsByThread
**Learning:** Using `JSON.parse(JSON.stringify())` for deep cloning is a major performance bottleneck in utility functions that process large collections (e.g., podcast feeds). Additionally, parsing dates inside a `.sort()` comparator leads to redundant computations ((N \log N)$ parsings).
**Action:** Use shallow cloning with the spread operator (`{...item}`) and pre-calculate numeric timestamps in an initial (N)$ pass to keep the sort phase lightning-fast.
