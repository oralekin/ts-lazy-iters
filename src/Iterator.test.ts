import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { range, repeat } from "../src/iters";
import CArray from "./container/Array";
import { none } from "./Maybe";

describe("transformers", () => {
  test("map works", () => {
    const map_fn = jest.fn((n: number) => n * n);
    const iter = range(0, 100).map(map_fn);
    for (let i = 0; i < 100; i++) {
      expect(iter.next().unwrap()).toBe(i * i);
    }
    expect(iter.next()).toStrictEqual(none());

    expect(map_fn).toBeCalledTimes(100);
  });

  test("take works", () => {
    const iter = range(0).take(10);
    for (let i = 0; i < 10; i++) {
      expect(iter.next().unwrap()).toBe(i);
    }
    expect(iter.next()).toStrictEqual(none());
  });

  test("filter works", () => {
    const iter = range(0)
      .filter((v) => v % 2 === 0)
      .take(10);

    for (let i = 0; i < 10; i++) {
      expect(iter.next().unwrap()).toStrictEqual(i * 2);
    }
    expect(iter.next()).toStrictEqual(none());
  });

  test("filter works on finite iterator", () => {
    const iter = range(0)
      .take(10)
      .filter((v) => v % 2 === 0);

    for (let i = 0; i < 5; i++) {
      expect(iter.next().unwrap()).toStrictEqual(i * 2);
    }
    expect(iter.next()).toStrictEqual(none());
  });

  describe("zip", () => {
    test("works", () => {
      const iter = range(0)
        .filter((v) => v % 2 == 0)
        .zip(range(0).filter((v) => v % 2 == 1))
        .take(10);
      for (let i = 0; i < 10; i++) {
        expect(iter.next().unwrap()).toStrictEqual([i * 2, i * 2 + 1]);
      }
      expect(iter.next()).toStrictEqual(none());
    });

    test("stops when one ends", () => {
      const iter = range(0)
        .filter((v) => v % 2 == 0)
        .zip(
          range(0)
            .filter((v) => v % 2 == 1)
            .take(10)
        );
      for (let i = 0; i < 10; i++) {
        expect(iter.next().unwrap()).toStrictEqual([i * 2, i * 2 + 1]);
      }
      expect(iter.next()).toStrictEqual(none());
    });
  });

  test("enumerate works", () => {
    const iter = range(0).take(10).enumerate();
    for (let i = 0; i < 10; i++) {
      expect(iter.next().unwrap()).toStrictEqual([i, i]);
    }
    expect(iter.next()).toStrictEqual(none());
  });

  test("flatMap works", () => {
    const iter = range(1)
      .take(3)
      .flatMap((n) => repeat(n).take(n));
    expect(iter.next().unwrap()).toBe(1);
    expect(iter.next().unwrap()).toBe(2);
    expect(iter.next().unwrap()).toBe(2);
    expect(iter.next().unwrap()).toBe(3);
    expect(iter.next().unwrap()).toBe(3);
    expect(iter.next().unwrap()).toBe(3);
    expect(iter.next()).toStrictEqual(none());
    expect(iter.next()).toStrictEqual(none());
  });

  describe("inspect", () => {
    test("inspect works", () => {
      const fn = jest.fn();
      const iter = range(0, 10).inspect(fn);
      iter.any((_) => false);
      expect(fn).toBeCalledTimes(10);
    });

    test("runs in the right order", () => {
      const arr: number[] = [];
      const [fn1, fn2, fn3] = Array(3)
        .fill(0)
        .map((_, i) =>
          jest.fn((v) => {
            arr.push(i + 1);
            console.log("fn" + (i + 1) + " with " + v);
          })
        );
      range(0, 5)
        .inspect(fn1)
        .filter((n) => n > 1)
        .inspect(fn2)
        .forEach(fn3);
      //                   0  1  2        3        4
      expect(arr).toEqual([1, 1, 1, 2, 3, 1, 2, 3, 1, 2, 3]);
    });
  });

  test("chain works", () => {
    const iter = range(0, 3).chain(range(0, 3));
    expect(iter.collect_as(new CArray<number>())).toStrictEqual(new CArray(0,1,2,0,1,2));
    expect(iter.next()).toStrictEqual(none());
  });

  test("intersperse works", () => {
    const iter = range(0,3).map(n => `#${n}`).intersperse("btwn");
    expect(iter.next().unwrap()).toBe("#0");
    expect(iter.next().unwrap()).toBe("btwn");
    expect(iter.next().unwrap()).toBe("#1");
    expect(iter.next().unwrap()).toBe("btwn");
    expect(iter.next().unwrap()).toBe("#2");
    expect(iter.next()).toStrictEqual(none());
    expect(iter.next()).toStrictEqual(none());

  })
});

describe("consumers", () => {
  test("last works", () => {
    const iter = range(0).take(10);
    expect(iter.next().unwrap()).toBe(0);
    expect(iter.last().unwrap()).toBe(9);
    expect(iter.next()).toStrictEqual(none());
  });

  test("can take repeat", () => {
    const iter = repeat(10).take(3);
    expect(iter.next().unwrap()).toBe(10);
    expect(iter.next().unwrap()).toBe(10);
    expect(iter.next().unwrap()).toBe(10);
    expect(iter.next()).toStrictEqual(none());
  });

  test("skip works", () => {
    const iter = range(0).skip(10);
    expect(iter.next().unwrap()).toBe(10);
    expect(iter.next().unwrap()).toBe(11);
  });

  test("nth works", () => {
    const iter = range(0);
    expect(iter.nth(1).unwrap()).toBe(0);
    expect(iter.nth(5).unwrap()).toBe(5);
    expect(iter.nth(5).unwrap()).toBe(10);
  });

  describe(".any", () => {
    test("return false correctly", () => {
      const iter = range(0, 10);
      expect(iter.any((n) => n > 15)).toBe(false);
    });

    test("return true correctly", () => {
      const iter = range(0).take(10);
      expect(iter.any((n) => n > 5)).toBe(true);
    });
  });
  describe(".all", () => {
    test("return false correctly", () => {
      const iter = range(0).take(10);
      expect(iter.all((n) => n == 5)).toBe(false);
    });

    test("return true correctly", () => {
      const iter = range(0).take(10);
      expect(iter.all((n) => n > -1)).toBe(true);
    });
  });

  test("forEach calls correct number of times", () => {
    const fn = jest.fn();
    const iter = range(0, 10);
    iter.forEach(fn);
    expect(fn).toBeCalledTimes(10);
  });

  test("count works", () => {
    const iter = range(0).take(10);
    expect(iter.count()).toBe(10);
  });
});
