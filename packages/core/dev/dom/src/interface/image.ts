// @ts-ignore - Ignoring TS extension import error
import {HTMLImageElement} from '../html/image-element.ts';
// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html.ts';

/**
 * Creates an Image class factory for the given document
 * @param ownerDocument - The document that owns the Image class
 * @returns A constructor for Image objects
 */
export const ImageClass = (ownerDocument: any) => {
  /**
   * @implements globalThis.Image
   */
  class Image extends HTMLImageElement {
    /**
     * Constructor for the Image class
     * @param width - Optional width of the image
     * @param height - Optional height of the image
     */
    constructor(width?: number, height?: number) {
      super(ownerDocument);
      switch (arguments.length) {
        case 1:
          this.height = width;
          this.width = width;
          break;
        case 2:
          this.height = height!;
          this.width = width!;
          break;
      }
    }
  }

  return Image;
};

// Register the Image class
const tagName = 'img';
registerHTMLClass(tagName, HTMLImageElement);
