import { describe, it, assert } from "@inspatial/test";

// Test suite for CDATA section handling
// Using TDD principles to ensure comprehensive test coverage

describe("CDATA Section Handling", () => {
  it("should correctly parse and clone CDATA sections", () => {
    // Use xml parsing because CDATA is treated like a comment in html parsing
    let document = new DOMParser().parseFromString(
      "<html><body><![CDATA[test]]>text</body></html>",
      "text/xml"
    );

    const lastChild = document.documentElement?.lastChild;
    if (lastChild) {
      const [cdata, text] = Array.from(lastChild.childNodes) as [
        CDATASection,
        Text
      ];

      assert(
        cdata !== null && text !== null,
        "CDATA and text nodes should not be null"
      );
      assert(JSON.stringify(cdata.cloneNode()) === '[4,"test"]');
      assert(JSON.stringify(text.cloneNode()) === '[3,"text"]');

      assert(document.documentElement.textContent === "testtext");

      assert(text.data === "text");
      assert(text.nodeValue === "text");
      assert(text.textContent === "text");

      assert(cdata.data === "test");
      assert(cdata.nodeValue === "test");
      assert(cdata.textContent === "test");

      cdata.data = "data";
      assert(cdata.data === "data");
      assert(cdata.nodeValue === "data");
      assert(cdata.textContent === "data");

      cdata.nodeValue = "nodeValue";
      assert(cdata.data === "nodeValue");
      assert(cdata.nodeValue === "nodeValue");
      assert(cdata.textContent === "nodeValue");
    }
  });

  it("should correctly serialize XML with CDATA sections", () => {
    // Use xml parsing because CDATA is treated like a comment in html parsing
    let document = new DOMParser().parseFromString(
      '<?xml version="1.0" encoding="utf-8"?><html><body><![CDATA[cdata with a <div> tag]]></body></html>',
      "text/xml"
    );
    assert(
      document.toString() ===
        '<?xml version="1.0" encoding="utf-8"?><html><body><![CDATA[cdata with a <div> tag]]></body></html>'
    );

    document = new DOMParser().parseFromString(
      '<?xml version="1.0" encoding="utf-8"?><html><body><script>/*<![CDATA[*/test/*]]>*/</script></body></html>',
      "text/xml"
    );
    assert(
      document.toString() ===
        '<?xml version="1.0" encoding="utf-8"?><html><body><script>/*<![CDATA[*/test/*]]>*/</script></body></html>'
    );
  });
});
