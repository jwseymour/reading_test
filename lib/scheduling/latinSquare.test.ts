import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isBalancedLatinSquare,
  latinSquareOrders,
  orderForSession,
} from "./latinSquare.ts";

describe("latin square", () => {
  it("balances conditions across positions", () => {
    const ids = ["a", "b", "c", "d"];
    const square = latinSquareOrders(ids);
    assert.equal(square.length, 4);
    assert.equal(isBalancedLatinSquare(square), true);
  });

  it("rotates by session index", () => {
    const ids = ["a", "b", "c"];
    assert.equal(orderForSession(ids, 0)[0], "a");
    assert.equal(orderForSession(ids, 1)[0], "b");
    assert.equal(orderForSession(ids, 3)[0], "a");
  });
});
