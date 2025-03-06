// @ts-ignore - Ignoring TS extension import error
import {DOCUMENT_TYPE_NODE} from '../shared/constants.ts';
// @ts-ignore - Ignoring TS extension import error
import {documentTypeAsJSON} from '../shared/jsdon.ts';

// @ts-ignore - Ignoring TS extension import error
import {Node} from './node.ts';

/**
 * @implements globalThis.DocumentType
 */
export class DocumentType extends Node {
  /** Name of the document type */
  name: string;
  /** Public identifier of the document type */
  publicId: string;
  /** System identifier of the document type */
  systemId: string;
  
  /**
   * Create a new DocumentType node
   * @param ownerDocument - The document that owns this node
   * @param name - The name of the document type
   * @param publicId - The public identifier
   * @param systemId - The system identifier
   */
  constructor(ownerDocument: any, name: string, publicId: string = '', systemId: string = '') {
    super(ownerDocument, '#document-type', DOCUMENT_TYPE_NODE);
    this.name = name;
    this.publicId = publicId;
    this.systemId = systemId;
  }

  /**
   * Create a clone of this node
   * @param deep - Whether to clone children (not used for DocumentType)
   * @returns A copy of this DocumentType node
   */
  override cloneNode(deep?: boolean): DocumentType {
    const {ownerDocument, name, publicId, systemId} = this;
    return new DocumentType(ownerDocument, name, publicId, systemId);
  }

  /**
   * Convert to string representation
   * @returns String representation of this DocumentType
   */
  override toString(): string {
    const {name, publicId, systemId} = this;
    const hasPublic = 0 < publicId.length;
    const str = [name];
    if (hasPublic)
      str.push('PUBLIC', `"${publicId}"`);
    if (systemId.length) {
      if (!hasPublic)
        str.push('SYSTEM');
      str.push(`"${systemId}"`);
    }
    return `<!DOCTYPE ${str.join(' ')}>`;
  }

  /**
   * Convert to JSON representation
   * @returns JSON representation of this DocumentType
   */
  toJSON(): any[] {
    const json: any[] = [];
    documentTypeAsJSON(this, json);
    return json;
  }
}
