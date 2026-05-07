"""Selection sort — find the minimum and swap it into place."""

from __future__ import annotations

from collections.abc import Iterator

from algorithm_visualizer.core import Algorithm, Step, step


class SelectionSort(Algorithm):
    name = "Selection Sort"
    description = (
        "Build a sorted prefix by repeatedly scanning the unsorted suffix for "
        "its minimum, then swapping that minimum into the next slot."
    )
    view_kind = "selection"

    code = """
    def selection_sort(a: list[int]) -> list[int]:
        n = len(a)
        for i in range(n):
            m = i
            for j in range(i + 1, n):
                if a[j] < a[m]:
                    m = j
            a[i], a[m] = a[m], a[i]
        return a
    """

    def run(self, data: list[int]) -> Iterator[Step]:
        n = len(data)
        yield step(
            f"Read length: n = {n}. We'll place the minimum of a[i:] at index i each pass.",
            data,
            line=2,
            variables={"n": n},
        )
        for i in range(n):
            sorted_prefix = list(range(i))
            m = i
            yield step(
                f"Outer pass i = {i}: searching a[{i}:] for its minimum.",
                data,
                line=3,
                variables={"n": n, "i": i, "m": m, "a[m]": data[m]},
                pointers={"i": i},
                pivot=m,
                sorted=sorted_prefix,
                windows={"unsorted": (i, n - 1)} if i < n else {},
            )
            yield step(
                f"Tentatively m = i = {i}; smallest seen so far is a[m] = {data[m]}.",
                data,
                line=4,
                variables={"n": n, "i": i, "m": m, "a[m]": data[m]},
                pointers={"i": i},
                pivot=m,
                sorted=sorted_prefix,
            )
            for j in range(i + 1, n):
                yield step(
                    f"Compare a[j] = {data[j]} against current min a[m] = {data[m]}.",
                    data,
                    line=6,
                    variables={
                        "n": n,
                        "i": i,
                        "m": m,
                        "j": j,
                        "a[j]": data[j],
                        "a[m]": data[m],
                    },
                    pointers={"i": i, "j": j},
                    compare=j,
                    pivot=m,
                    sorted=sorted_prefix,
                )
                if data[j] < data[m]:
                    m = j
                    yield step(
                        f"a[j] < a[m]: new minimum is a[{m}] = {data[m]}.",
                        data,
                        line=7,
                        variables={
                            "n": n,
                            "i": i,
                            "m": m,
                            "j": j,
                            "a[m]": data[m],
                        },
                        pointers={"i": i, "j": j},
                        pivot=m,
                        sorted=sorted_prefix,
                    )
            if m != i:
                data[i], data[m] = data[m], data[i]
                yield step(
                    f"Swap a[{i}] and a[{m}]: minimum lands in the sorted prefix.",
                    data,
                    line=8,
                    variables={"n": n, "i": i, "m": m, "a[i]": data[i]},
                    pointers={"i": i},
                    swap=[i, m],
                    sorted=list(range(i + 1)),
                )
            else:
                yield step(
                    f"a[{i}] was already the minimum — no swap needed.",
                    data,
                    line=8,
                    variables={"n": n, "i": i, "m": m, "a[i]": data[i]},
                    pointers={"i": i},
                    sorted=list(range(i + 1)),
                )
        yield step("All elements placed — sorted.", data, line=9, sorted=list(range(n)))
