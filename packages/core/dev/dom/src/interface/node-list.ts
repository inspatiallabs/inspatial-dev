// https://dom.spec.whatwg.org/#interface-nodelist

/**
 * @implements globalThis.NodeList
 */
export class NodeList extends Array {
  item(i: number): Node | null { return i < this.length ? this[i] : null; }
}
