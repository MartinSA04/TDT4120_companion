"""Binary search — locate a target in a sorted list by halving the range."""

from __future__ import annotations

from collections.abc import Iterator

from algorithm_visualizer.core import Algorithm, Step, step


class BinarySearch(Algorithm):
    name = "Binary Search"
    description = (
        "Maintain a [lo, hi] window. Inspect the middle element; if it isn't "
        "the target, eliminate the half that can't contain it. O(log n)."
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
            f"Set window: lo = 0, hi = {hi}. Searching for target = {target}.",
            data,
            line=2,
            variables={"target": target, "lo": lo, "hi": hi, "n": n},
        )
        while lo <= hi:
            yield step(
                f"Window non-empty (lo = {lo} ≤ hi = {hi}); continue.",
                data,
                line=3,
                variables={"target": target, "lo": lo, "hi": hi},
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
                )
                return
            if data[mid] < target:
                yield step(
                    f"a[mid] = {data[mid]} < target: discard left half. New lo = mid + 1.",
                    data,
                    line=8,
                    variables={
                        "target": target,
                        "lo": lo,
                        "hi": hi,
                        "mid": mid,
                    },
                )
                lo = mid + 1
            else:
                yield step(
                    f"a[mid] = {data[mid]} > target: discard right half. New hi = mid - 1.",
                    data,
                    line=10,
                    variables={
                        "target": target,
                        "lo": lo,
                        "hi": hi,
                        "mid": mid,
                    },
                )
                hi = mid - 1
        yield step(
            f"Window empty (lo > hi): {target} is not in the list.",
            data,
            line=11,
            variables={"target": target, "lo": lo, "hi": hi, "result": -1},
        )
