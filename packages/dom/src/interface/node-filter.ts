import {
  SHOW_ALL,
  SHOW_ELEMENT,
  SHOW_COMMENT,
  SHOW_CDATA_SECTION,
  SHOW_TEXT
} from '../shared/constants.ts';

export class NodeFilter {
  static get SHOW_ALL(): number { return SHOW_ALL; }
  static get SHOW_ELEMENT(): number { return SHOW_ELEMENT; }
  static get SHOW_COMMENT(): number { return SHOW_COMMENT; }
  static get SHOW_CDATA_SECTION(): number { return SHOW_CDATA_SECTION; }
  static get SHOW_TEXT(): number { return SHOW_TEXT; }
}
