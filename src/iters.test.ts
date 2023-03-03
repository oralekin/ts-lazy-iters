import { expect, jest, test } from "@jest/globals";
import { empty, once, range, repeat } from "./iters";
import { none } from "./Maybe";

test("repeat iterator returns some values", () => {
  const value = "some value";
  const iter = repeat(value);
  expect(iter.next().unwrap()).toBe(value);
  expect(iter.next().unwrap()).toBe(value);
  expect(iter.next().unwrap()).toBe(value);
  expect(iter.next().unwrap()).toBe(value);
  expect(iter.next().unwrap()).toBe(value);
  expect(iter.next().unwrap()).toBe(value);
});

test("range iterator works", () => {
  const iter = range(0, 100);
  for (let i = 0; i < 100; i++) {
    expect(iter.next().unwrap()).toBe(i);
  }
  expect(iter.next()).toStrictEqual(none());
});

test("once iterator works", () => {
  const iter = once("some value");
  expect(iter.next().unwrap()).toBe("some value");
  expect(iter.next()).toStrictEqual(none());
});

test("none iterator works", () => {
  const iter = empty();
  expect(iter.next()).toStrictEqual(none());
})