"""Insertion sort — grow a sorted prefix one element at a time."""

from __future__ import annotations

from collections.abc import Iterator

from algorithm_visualizer.core import Algorithm, Step, step


class InsertionSort(Algorithm):
    name = "Insertion Sort"
    description = (
        "Take each new element as the 'key', lift it out, then slide cells right "
        "across the sorted prefix until the key drops into its place."
    )
    view_kind = "insertion"

    code = """
    def insertion_sort(a: list[int]) -> list[int]:
        for i in range(1, len(a)):
            key = a[i]
            j = i - 1
            while j >= 0 and a[j] > key:
                a[j + 1] = a[j]
                j -= 1
            a[j + 1] = key
        return a
    """

    def run(self, data: list[int]) -> Iterator[Step]:
        n = len(data)
        yield step(
            "Treat a[0] as a sorted prefix of length 1. We'll insert each later element into it.",
            data,
            line=2,
            variables={"n": n},
            sorted=[0],
        )
        for i in range(1, n):
            key = data[i]
            # `gap` is the index conceptually empty because the key was lifted
            # out of it. It migrates left every time we shift a cell right.
            gap = i
            yield step(
                f"i = {i}: lift the key out of a[i]. Sorted prefix is a[:{i}].",
                data,
                line=3,
                variables={"n": n, "i": i, "key": key},
                pointers={"i": i},
                sorted=list(range(i)),
                floating={gap: key},
                windows={"gap": (gap, gap)},
            )
            j = i - 1
            yield step(
                f"j = {j}: scan left looking for where the key should drop in.",
                data,
                line=4,
                variables={"n": n, "i": i, "key": key, "j": j},
                pointers={"j": j},
                sorted=list(range(i)),
                floating={gap: key},
                windows={"gap": (gap, gap)},
            )
            while j >= 0 and data[j] > key:
                yield step(
                    f"a[j] = {data[j]} > key = {key} — shift a[j] right into the gap a[{gap}].",
                    data,
                    line=5,
                    variables={
                        "n": n,
                        "i": i,
                        "key": key,
                        "j": j,
                        "a[j]": data[j],
                    },
                    pointers={"j": j},
                    compare=j,
                    sorted=list(range(i)),
                    floating={gap: key},
                    windows={"gap": (gap, gap)},
                )
                data[j + 1] = data[j]
                # The gap moves to j: a[j]'s value just got copied to a[j+1],
                # so a[j] is now the empty slot that the key is hovering over.
                gap = j
                yield step(
                    f"Shifted: a[{j + 1}] now holds {data[j + 1]}. Gap is now at a[{gap}].",
                    data,
                    line=6,
                    variables={"n": n, "i": i, "key": key, "j": j},
                    pointers={"j": j},
                    swap=[j + 1],
                    sorted=list(range(i)),
                    floating={gap: key},
                    windows={"gap": (gap, gap)},
                )
                j -= 1
            # Loop exit: gap == j + 1, which is where the key drops in.
            data[j + 1] = key
            yield step(
                f"Drop the key into the gap at a[{j + 1}]. Sorted prefix grows to a[:{i + 1}].",
                data,
                line=8,
                variables={"n": n, "i": i, "key": key, "j": j},
                pointers={"key→": j + 1},
                swap=[j + 1],
                sorted=list(range(i + 1)),
            )
        yield step("All elements inserted — list is sorted.", data, line=9, sorted=list(range(n)))
