// @ts-ignore - Ignoring TS extension import error
import {CDATA_SECTION_NODE} from '../shared/constants.ts';
// @ts-ignore - Ignoring TS extension import error
import {VALUE} from '../shared/symbols.ts';

// @ts-ignore - Ignoring TS extension import error
import {CharacterData} from './character-data.ts';

/**
 * @implements globalThis.CDATASection
 */
export class CDATASection extends CharacterData {
  constructor(ownerDocument: any, data: string = '') {
    super(ownerDocument, '#cdatasection', CDATA_SECTION_NODE, data);
  }

  // @ts-ignore - Method exists in parent class
  cloneNode(): CDATASection {
    // @ts-ignore - Symbol property access
    const {ownerDocument, [VALUE]: data} = this;
    return new CDATASection(ownerDocument, data);
  }

  // @ts-ignore - Method exists in parent class
  toString(): string { 
    // @ts-ignore - Symbol property access
    return `<![CDATA[${this[VALUE]}]]>`; 
  }
}
