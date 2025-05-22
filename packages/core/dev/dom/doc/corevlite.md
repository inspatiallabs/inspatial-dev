## InDOM vs InDOM (Lite)

### InDOM (Lite)
- Indom Lite is designed to work everywhere unlike InDOM it is designed to be the lightest possible and minimal implemnetation of the DOMoptimized for performance and universal rendering bringing the DOM to platforms with the most smallest specs like Watches.
  Unlike InDOM Core, InDOM Lite is designed to;

1. Zero-dependency core (no XML parser, no innerHTML, no deep cloneNode).
2. Tag names are lower-cased; events / attributes are never hard-coded.
3. Tiny memory-footprint – target < 8 MB RAM / < 500 MHz CPU bring the DOM to places like smart watches.
4. No reliance on the browser’s global Node, Document and types.

Because InDOM (Lite) does not ship an XML Parser, innerHTML and cloneNode it is recommended to always build nodes via `createElement(…)`.
