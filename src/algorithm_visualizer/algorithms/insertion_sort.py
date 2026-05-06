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
            yield step(
                f"i = {i}: lift the key out of a[i]. Sorted prefix is a[:{i}].",
                data,
                line=3,
                variables={"n": n, "i": i, "key": key},
                pointers={"i": i},
                sorted=list(range(i)),
                floating={i: key},
                windows={"key_origin": (i, i)},
            )
            j = i - 1
            yield step(
                f"j = {j}: scan left looking for where the key should drop in.",
                data,
                line=4,
                variables={"n": n, "i": i, "key": key, "j": j},
                pointers={"j": j},
                sorted=list(range(i)),
                floating={j + 1: key},
                windows={"key_origin": (i, i)},
            )
            while j >= 0 and data[j] > key:
                yield step(
                    f"a[j] = {data[j]} > key = {key} — shift a[j] right into a[j+1].",
                    data,
                    line=5,
                    variables={
                        "n": n,
                        "i": i,
                        "key": key,
                        "j": j,
                        "a[j]": data[j],
                    },
                    pointers={"j": j, "j+1": j + 1},
                    compare=j,
                    sorted=list(range(i)),
                    floating={j + 1: key},
                    windows={"key_origin": (i, i)},
                )
                data[j + 1] = data[j]
                yield step(
                    f"Shifted: a[{j + 1}] now holds {data[j + 1]}. Decrement j.",
                    data,
                    line=6,
                    variables={"n": n, "i": i, "key": key, "j": j},
                    pointers={"j": j, "j+1": j + 1},
                    swap=[j + 1],
                    sorted=list(range(i)),
                    floating={j + 1: key},
                    windows={"key_origin": (i, i)},
                )
                j -= 1
            data[j + 1] = key
            yield step(
                f"Drop the key into a[{j + 1}]. Sorted prefix grows to a[:{i + 1}].",
                data,
                line=8,
                variables={"n": n, "i": i, "key": key, "j": j},
                pointers={"key→": j + 1},
                swap=[j + 1],
                sorted=list(range(i + 1)),
            )
        yield step("All elements inserted — list is sorted.", data, line=9, sorted=list(range(n)))
