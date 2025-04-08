// https://dom.spec.whatwg.org/#interface-nodelist

/**
 * @implements globalThis.NodeList
 */
export class NodeList extends Array {
  item(i: number) { return i < this.length ? this[i] : null; }
}
