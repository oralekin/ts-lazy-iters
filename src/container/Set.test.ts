import { expect, test } from "@jest/globals";
import { range } from "../iters";
import CSet from "./Set";

test("collecting into set works", () => {
  const iter = range(0)
    .map((n) => n % 7)
    .take(10);
  const arr = iter.collect_as(new CSet<number>());
  expect(arr).toStrictEqual(new CSet([0, 1, 2, 3, 4, 5, 6]));
});
