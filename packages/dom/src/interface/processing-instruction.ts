// @ts-ignore - Ignoring TS extension import error
import {PROCESSING_INSTRUCTION_NODE} from '../shared/constants.ts';
// @ts-ignore - Ignoring TS extension import error
import {CharacterData} from './character-data.ts';

/**
 * Represents a processing instruction in an XML document
 * @implements globalThis.ProcessingInstruction
 */
export class ProcessingInstruction extends CharacterData {
  /**
   * The target of this processing instruction
   */
  readonly target: string;

  /**
   * Creates a new ProcessingInstruction
   * @param ownerDocument - The document that owns this processing instruction
   * @param target - The target of this processing instruction
   * @param data - The content of this processing instruction
   */
  constructor(ownerDocument: any, target: string, data: string) {
    super(ownerDocument, target, PROCESSING_INSTRUCTION_NODE, data);
    this.target = target;
  }

  /**
   * Returns a string representation of this processing instruction
   * @returns A string representation
   */
  override toString(): string {
    return `<?${this.target} ${this.data}?>`;
  }
} 