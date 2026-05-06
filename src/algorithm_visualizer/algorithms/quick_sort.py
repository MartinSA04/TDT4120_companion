"""Quick sort — partition around a pivot, recurse on each side."""

from __future__ import annotations

from collections.abc import Iterator

from algorithm_visualizer.core import Algorithm, Step, step


class QuickSort(Algorithm):
    name = "Quick Sort"
    description = (
        "Choose a pivot (here: rightmost), partition into ≤ pivot / > pivot, "
        "place the pivot between them, then recurse on each side."
    )

    code = """
    def quick_sort(a: list[int], lo: int = 0, hi: int | None = None) -> None:
        if hi is None:
            hi = len(a) - 1
        if lo >= hi:
            return
        pivot = a[hi]
        i = lo - 1
        for j in range(lo, hi):
            if a[j] <= pivot:
                i += 1
                a[i], a[j] = a[j], a[i]
        a[i + 1], a[hi] = a[hi], a[i + 1]
        quick_sort(a, lo, i)
        quick_sort(a, i + 2, hi)
    """

    def run(self, data: list[int]) -> Iterator[Step]:
        n = len(data)
        yield step(
            "Initial call: lo = 0, hi will default to len(a) - 1.",
            data,
            line=2,
            variables={"n": n, "lo": 0, "hi": n - 1},
        )
        yield from self._sort(data, 0, n - 1, sorted_set=set())
        yield step("Done — list is sorted.", data, line=2, sorted=list(range(n)))

    def _sort(
        self,
        data: list[int],
        lo: int,
        hi: int,
        sorted_set: set[int],
    ) -> Iterator[Step]:
        sorted_list = sorted(sorted_set)
        if lo >= hi:
            if lo == hi:
                sorted_set.add(lo)
                yield step(
                    f"Single element a[{lo}] is trivially sorted.",
                    data,
                    line=5,
                    variables={"lo": lo, "hi": hi},
                    pointers={"lo/hi": lo},
                    sorted=sorted(sorted_set),
                )
            return

        pivot = data[hi]
        yield step(
            f"Partition window [{lo}..{hi}]. Pivot = a[hi] = {pivot}.",
            data,
            line=6,
            variables={"lo": lo, "hi": hi, "pivot": pivot},
            pointers={"lo": lo, "hi": hi},
            pivot=hi,
            sorted=sorted_list,
        )

        i = lo - 1
        yield step(
            f"i = {i}: boundary of the ≤ pivot region (none yet).",
            data,
            line=7,
            variables={"lo": lo, "hi": hi, "pivot": pivot, "i": i},
            pointers={"lo": lo, "hi": hi},
            pivot=hi,
            sorted=sorted_list,
        )

        for j in range(lo, hi):
            yield step(
                f"j = {j}: compare a[j] = {data[j]} with pivot {pivot}.",
                data,
                line=9,
                variables={
                    "lo": lo,
                    "hi": hi,
                    "pivot": pivot,
                    "i": i,
                    "j": j,
                    "a[j]": data[j],
                },
                pointers={"i": max(i, lo), "j": j, "hi": hi},
                compare=j,
                pivot=hi,
                sorted=sorted_list,
            )
            if data[j] <= pivot:
                i += 1
                if i != j:
                    data[i], data[j] = data[j], data[i]
                    yield step(
                        f"a[j] ≤ pivot: grow ≤-region by swapping a[{i}] and a[{j}].",
                        data,
                        line=11,
                        variables={
                            "lo": lo,
                            "hi": hi,
                            "pivot": pivot,
                            "i": i,
                            "j": j,
                        },
                        pointers={"i": i, "j": j, "hi": hi},
                        swap=[i, j],
                        pivot=hi,
                        sorted=sorted_list,
                    )
                else:
                    yield step(
                        "a[j] ≤ pivot: i and j coincide, no swap needed.",
                        data,
                        line=10,
                        variables={
                            "lo": lo,
                            "hi": hi,
                            "pivot": pivot,
                            "i": i,
                            "j": j,
                        },
                        pointers={"i": i, "j": j, "hi": hi},
                        pivot=hi,
                        sorted=sorted_list,
                    )

        data[i + 1], data[hi] = data[hi], data[i + 1]
        sorted_set.add(i + 1)
        yield step(
            f"Place pivot between the two regions at a[{i + 1}].",
            data,
            line=12,
            variables={"lo": lo, "hi": hi, "pivot": pivot, "i": i},
            pointers={"pivot→": i + 1},
            swap=[i + 1],
            sorted=sorted(sorted_set),
        )

        yield from self._sort(data, lo, i, sorted_set)
        yield from self._sort(data, i + 2, hi, sorted_set)
