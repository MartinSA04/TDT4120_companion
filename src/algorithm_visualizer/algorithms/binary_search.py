"""Binary search — locate a target in a sorted list by halving the range."""

from __future__ import annotations

from collections.abc import Iterator

from algorithm_visualizer.core import Algorithm, Step, step


class BinarySearch(Algorithm):
    name = "Binary Search"
    description = (
        "Maintain a [lo, hi] window. Inspect the middle; if it isn't the target, "
        "eliminate the half that can't possibly contain it. O(log n)."
    )
    view_kind = "search"

    code = """
    def binary_search(a: list[int], target: int) -> int:
        lo, hi = 0, len(a) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if a[mid] == target:
                return mid
            if a[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return -1
    """

    def default_data(self) -> list[int]:
        return list(range(2, 41, 2))

    def run(self, data: list[int]) -> Iterator[Step]:
        n = len(data)
        target = data[(n * 3) // 4]
        lo, hi = 0, n - 1
        yield step(
            f"Initial window: lo = 0, hi = {hi}. Searching for target = {target}.",
            data,
            line=2,
            variables={"target": target, "lo": lo, "hi": hi, "n": n},
            windows={"frame": (lo, hi)},
        )
        while lo <= hi:
            yield step(
                f"Window non-empty (lo = {lo} ≤ hi = {hi}); continue searching.",
                data,
                line=3,
                variables={"target": target, "lo": lo, "hi": hi},
                windows={"frame": (lo, hi)},
            )
            mid = (lo + hi) // 2
            yield step(
                f"mid = (lo + hi) // 2 = {mid}. Inspecting a[mid] = {data[mid]}.",
                data,
                line=4,
                variables={
                    "target": target,
                    "lo": lo,
                    "hi": hi,
                    "mid": mid,
                    "a[mid]": data[mid],
                },
                windows={"frame": (lo, hi)},
            )
            if data[mid] == target:
                yield step(
                    f"a[mid] == target — found {target} at index {mid}.",
                    data,
                    line=6,
                    variables={
                        "target": target,
                        "lo": lo,
                        "hi": hi,
                        "mid": mid,
                        "result": mid,
                    },
                    found=[mid],
                    windows={"frame": (lo, hi)},
                )
                return
            if data[mid] < target:
                yield step(
                    f"a[mid] = {data[mid]} < target: discard the left half.",
                    data,
                    line=8,
                    variables={
                        "target": target,
                        "lo": lo,
                        "hi": hi,
                        "mid": mid,
                        "eliminated": "left",
                    },
                    windows={"frame": (lo, hi)},
                )
                lo = mid + 1
            else:
                yield step(
                    f"a[mid] = {data[mid]} > target: discard the right half.",
                    data,
                    line=10,
                    variables={
                        "target": target,
                        "lo": lo,
                        "hi": hi,
                        "mid": mid,
                        "eliminated": "right",
                    },
                    windows={"frame": (lo, hi)},
                )
                hi = mid - 1
        yield step(
            f"Window collapsed (lo > hi): {target} is not in the list.",
            data,
            line=11,
            variables={"target": target, "lo": lo, "hi": hi, "result": -1},
        )
