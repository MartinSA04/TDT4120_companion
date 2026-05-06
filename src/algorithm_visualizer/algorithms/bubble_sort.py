"""Bubble sort — repeatedly swap adjacent out-of-order pairs."""

from __future__ import annotations

from collections.abc import Iterator

from algorithm_visualizer.core import Algorithm, Step, step


class BubbleSort(Algorithm):
    name = "Bubble Sort"
    description = (
        "Walk the list comparing each adjacent pair; swap if out of order. "
        "After pass i, the i largest elements are locked in at the end."
    )
    view_kind = "bubble"

    code = """
    def bubble_sort(a: list[int]) -> list[int]:
        n = len(a)
        for i in range(n):
            for j in range(n - i - 1):
                if a[j] > a[j + 1]:
                    a[j], a[j + 1] = a[j + 1], a[j]
        return a
    """

    def run(self, data: list[int]) -> Iterator[Step]:
        n = len(data)
        yield step(
            f"Read length: n = {n}. The largest unsorted element will bubble right each pass.",
            data,
            line=2,
            variables={"n": n},
        )
        for i in range(n):
            sorted_tail = list(range(n - i, n))
            yield step(
                f"Pass i = {i}: scan up to index {n - i - 1}. "
                f"The last {i} element(s) are already in place.",
                data,
                line=3,
                variables={"n": n, "i": i},
                pointers={"i": i} if i < n else {},
                sorted=sorted_tail,
            )
            if n - i - 1 == 0:
                break
            for j in range(n - i - 1):
                yield step(
                    f"Compare a[j] = {data[j]} with a[j+1] = {data[j + 1]}.",
                    data,
                    line=5,
                    variables={
                        "n": n,
                        "i": i,
                        "j": j,
                        "a[j]": data[j],
                        "a[j+1]": data[j + 1],
                    },
                    pointers={"j": j, "j+1": j + 1},
                    compare=[j, j + 1],
                    sorted=sorted_tail,
                )
                if data[j] > data[j + 1]:
                    data[j], data[j + 1] = data[j + 1], data[j]
                    yield step(
                        f"a[j] > a[j+1] — swap: {data[j + 1]} ↔ {data[j]}.",
                        data,
                        line=6,
                        variables={
                            "n": n,
                            "i": i,
                            "j": j,
                            "a[j]": data[j],
                            "a[j+1]": data[j + 1],
                        },
                        pointers={"j": j, "j+1": j + 1},
                        swap=[j, j + 1],
                        sorted=sorted_tail,
                    )
        yield step(
            "All passes complete — the list is sorted.",
            data,
            line=7,
            variables={"n": n},
            sorted=list(range(n)),
        )
