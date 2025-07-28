import { createRenderer } from './create-renderer.ts'
import { isSignal, peek, bind } from '../signal.ts'
import { nop } from '../utils.ts'

const defaultRendererID = 'HTML'

export interface HTMLRendererOptions {
	rendererID?: string;
	selfClosingTags?: Set<string>;
}

export function HTMLRenderer(options: HTMLRendererOptions = {}) {
	const {
		rendererID = defaultRendererID,
		selfClosingTags = new Set([
			'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
			'link', 'meta', 'param', 'source', 'track', 'wbr'
		])
	} = options;

	interface HTMLNode {
		_isHTMLNode: true;
		tagName: string;
		children: HTMLNode[];
		props: Record<string, any>;
		text?: string;
		toString(): string;
	}

	function isNode(node: any): boolean {
		return typeof node === 'object' && node !== null && node._isHTMLNode;
	}

	function createNode(tagName: string): HTMLNode {
		return {
			_isHTMLNode: true,
			tagName,
			children: [],
			props: {},
			toString() {
				const props = Object.entries(this.props || {})
					.filter(([key, value]) => value != null && key !== 'children')
					.map(([key, value]) => {
						if (typeof value === 'boolean') {
							return value ? key : '';
						}
						return `${key}="${String(value).replace(/"/g, '&quot;')}"`;
					})
					.filter(Boolean)
					.join(' ');

				const propsStr = props ? ` ${props}` : '';
				
				if (selfClosingTags.has(tagName.toLowerCase())) {
					return `<${tagName}${propsStr} />`;
				}

				const childrenStr = (this.children || []).map(c => c.toString()).join('');
				return `<${tagName}${propsStr}>${childrenStr}</${tagName}>`;
			}
		};
	}

	function createTextNode(text: any): HTMLNode {
		const textContent = isSignal(text) ? peek(text) : text;
		return {
			_isHTMLNode: true,
			tagName: '#text',
			children: [],
			props: {},
			text: String(textContent || ''),
			toString() {
				return (this.text || '').replace(/[<>&"]/g, (match) => {
					switch (match) {
						case '<': return '&lt;';
						case '>': return '&gt;';
						case '&': return '&amp;';
						case '"': return '&quot;';
						default: return match;
					}
				});
			}
		};
	}

	function createAnchor(text?: string): HTMLNode {
		return createTextNode(text || '');
	}

	function createFragment(): HTMLNode {
		return {
			_isHTMLNode: true,
			tagName: '#fragment',
			children: [],
			props: {},
			toString() {
				return (this.children || []).map(c => c.toString()).join('');
			}
		};
	}

	function removeNode(node: HTMLNode): void {
		// HTML renderer doesn't need to track removal for string generation
	}

	function appendNode(parent: HTMLNode, ...nodes: HTMLNode[]): void {
		if (parent.children) {
			parent.children.push(...nodes);
		}
	}

	function insertBefore(node: HTMLNode, ref: HTMLNode): void {
		// Simple implementation for HTML renderer
		if (ref.parent && (ref.parent as any).children) {
			const index = (ref.parent as any).children.indexOf(ref);
			if (index >= 0) {
				(ref.parent as any).children.splice(index, 0, node);
			}
		}
	}

	function setProps(node: HTMLNode, props: Record<string, any>): void {
		Object.assign(node.props || {}, props);
	}

	const nodeOps = {
		isNode,
		createNode,
		createAnchor,
		createTextNode,
		createFragment,
		setProps,
		insertBefore,
		appendNode,
		removeNode
	};

	return createRenderer(nodeOps, rendererID);
}

export { defaultRendererID } 