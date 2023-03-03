import { expect, test } from "@jest/globals";
import { range } from "../iters";
import CArray from "./Array";

test("collecting into array works", () => {
    const iter = range(0).take(10);
    const arr = iter.collect_as(new CArray<number>());
    expect(arr).toStrictEqual(new CArray(10).fill(0).map((_, i) => i));
  })
  
  