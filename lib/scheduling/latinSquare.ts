/**
 * Latin square over conditions × sessions so each condition appears equally
 * often in each ordinal position.
 */

export function latinSquareOrders(
  conditionIds: string[],
): string[][] {
  const n = conditionIds.length;
  if (n === 0) return [];
  const orders: string[][] = [];
  for (let row = 0; row < n; row++) {
    const order: string[] = [];
    for (let col = 0; col < n; col++) {
      order.push(conditionIds[(row + col) % n]!);
    }
    orders.push(order);
  }
  return orders;
}

/** Session k (0-based) uses row k % n of the square. */
export function orderForSession(
  conditionIds: string[],
  sessionIndex: number,
): string[] {
  const square = latinSquareOrders(conditionIds);
  if (square.length === 0) return [];
  return square[((sessionIndex % square.length) + square.length) % square.length]!;
}

/** Verify each condition appears once per row and once per column position across the square. */
export function isBalancedLatinSquare(orders: string[][]): boolean {
  if (orders.length === 0) return true;
  const n = orders.length;
  if (!orders.every((row) => row.length === n)) return false;
  for (const row of orders) {
    if (new Set(row).size !== n) return false;
  }
  for (let col = 0; col < n; col++) {
    const seen = new Set<string>();
    for (let row = 0; row < n; row++) {
      seen.add(orders[row]![col]!);
    }
    if (seen.size !== n) return false;
  }
  return true;
}
