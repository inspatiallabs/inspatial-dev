// @ts-ignore - Ignoring TS extension import error
import {DocumentType} from './document-type.ts';
// @ts-ignore - Ignoring TS extension import error
import {Document} from './document.ts';
// @ts-ignore - Ignoring TS extension import error
import {HTMLDocument} from '../html/document.ts';
// @ts-ignore - Ignoring TS extension import error
import {XMLDocument} from '../xml/document.ts';

/**
 * @implements globalThis.DOMImplementation
 */
export class DOMImplementation {
  /**
   * Creates a new DocumentType node
   * @param qualifiedName - The qualified name of the document type
   * @param publicId - The public identifier
   * @param systemId - The system identifier
   * @returns A new DocumentType node
   */
  createDocumentType(qualifiedName: string, publicId: string = '', systemId: string = ''): DocumentType {
    return new DocumentType(null, qualifiedName, publicId, systemId);
  }

  /**
   * Creates a new Document
   * @param namespace - The namespace URI of the document
   * @param qualifiedName - The qualified name of the document element
   * @param doctype - The document type
   * @returns A new Document node
   */
  createDocument(namespace: string | null, qualifiedName: string | null, doctype: DocumentType | null): XMLDocument {
    const document = new XMLDocument();
    
    if (doctype)
      document.appendChild(doctype);
    
    if (qualifiedName) {
      const element = document.createElementNS(namespace, qualifiedName, null);
      document.appendChild(element);
    }
    
    return document;
  }

  /**
   * Creates a new HTML document
   * @param title - Optional title for the document
   * @returns A new HTML document
   */
  createHTMLDocument(title?: string): HTMLDocument {
    const document = new HTMLDocument();
    
    if (title !== undefined) {
      const titleElement = document.createElement('title');
      titleElement.textContent = title;
      document.head.appendChild(titleElement);
    }
    
    return document;
  }
} 