// @ts-ignore - Ignoring TS extension import error
import {COMMENT_NODE} from '../shared/constants.ts';
// @ts-ignore - Ignoring TS extension import error
import {VALUE} from '../shared/symbols.ts';

// @ts-ignore - Ignoring TS extension import error
import {CharacterData} from './character-data.ts';

/**
 * @implements globalThis.Comment
 */
export class Comment extends CharacterData {
  constructor(ownerDocument: any, data: string = '') {
    super(ownerDocument, '#comment', COMMENT_NODE, data);
  }

  // @ts-ignore - Method exists in parent class
  cloneNode(): Comment {
    // @ts-ignore - Symbol property access
    const {ownerDocument, [VALUE]: data} = this;
    return new Comment(ownerDocument, data);
  }

  // @ts-ignore - Method exists in parent class
  toString(): string { 
    // @ts-ignore - Symbol property access
    return `<!--${this[VALUE]}-->`; 
  }
}
