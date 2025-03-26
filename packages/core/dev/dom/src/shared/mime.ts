const voidElements = { test: () => true };
const textOnlyElements = /^(?:plaintext|script|style|textarea|title|xmp)$/i;

export const Mime = {
  "text/html": {
    docType: "<!DOCTYPE html>",
    ignoreCase: true,
    voidElements:
      /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i,
    textOnlyElements,
  },
  "image/svg+xml": {
    docType: '<?xml version="1.0" encoding="utf-8"?>',
    ignoreCase: false,
    voidElements,
    textOnlyElements,
  },
  "text/xml": {
    docType: '<?xml version="1.0" encoding="utf-8"?>',
    ignoreCase: false,
    voidElements,
    textOnlyElements,
  },
  "application/xml": {
    docType: '<?xml version="1.0" encoding="utf-8"?>',
    ignoreCase: false,
    voidElements,
    textOnlyElements,
  },
  "application/xhtml+xml": {
    docType: '<?xml version="1.0" encoding="utf-8"?>',
    ignoreCase: false,
    voidElements,
    textOnlyElements,
  },
};
