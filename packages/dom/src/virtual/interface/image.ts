// @ts-ignore - Ignoring TS extension import error
import { HTMLImageElement } from "../html/image-element.ts";
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";

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
          (this as any).height = width || 0;
          (this as any).width = width || 0;
          break;
        case 2:
          (this as any).height = height || 0;
          (this as any).width = width || 0;
          break;
      }
    }
  }

  return Image;
};

// Register the Image class
const tagName = "img";
registerHTMLClass(tagName, HTMLImageElement);
