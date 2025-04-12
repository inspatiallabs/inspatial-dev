/**
 * # DocumentType Testing
 * @summary Tests for DOCTYPE node parsing, serialization, and creation
 *
 * These tests verify that DOCTYPE declarations are correctly parsed,
 * serialized to strings, converted to JSON, and can be created programmatically.
 */
import { describe, it, assert } from "@inspatial/test";
import { InSpatialDOM, parseJSON } from "../index.ts";

describe("DocumentType", () => {
  describe("PUBLIC DOCTYPE declarations", () => {
    it("should correctly parse PUBLIC DOCTYPE declarations with IDs", () => {
      // GIVEN an HTML document with a PUBLIC DOCTYPE declaration
      const { document } = InSpatialDOM(
        `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN"
            "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd"><html></html>`
      );
      const doctype = document.firstChild;

      // THEN it should extract the correct publicId and systemId
      assert(
        doctype.publicId === "-//W3C//DTD XHTML Basic 1.1//EN",
        "DOCTYPE should have the correct publicId"
      );
      assert(
        doctype.systemId ===
          "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd",
        "DOCTYPE should have the correct systemId"
      );
    });

    it("should correctly serialize PUBLIC DOCTYPE declarations to string", () => {
      // GIVEN an HTML document with a PUBLIC DOCTYPE declaration
      const { document } = InSpatialDOM(
        `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN"
            "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd"><html></html>`
      );

      // WHEN converting the document to string
      const docString = document.toString();

      // THEN it should have the correctly formatted DOCTYPE declaration
      assert(
        docString ===
          '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd"><html></html>',
        "Document string should contain correctly formatted DOCTYPE declaration"
      );
    });

    it("should correctly serialize and parse PUBLIC DOCTYPE declarations to/from JSON", () => {
      // GIVEN an HTML document with a PUBLIC DOCTYPE declaration
      const { document } = InSpatialDOM(
        `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN"
            "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd"><html></html>`
      );

      // WHEN serializing to JSON and parsing back
      const jsonString = JSON.stringify(document);
      const parsedDocument = parseJSON(jsonString);

      // THEN the serialized JSON should have the correct structure
      assert(
        jsonString ===
          `[9,10,"html","-//W3C//DTD XHTML Basic 1.1//EN","http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd",1,"html",-2]`,
        "JSON serialization should contain DOCTYPE information in the correct format"
      );

      // AND the parsed document should have the correct DOCTYPE declaration
      assert(
        parsedDocument.firstChild.toString() ===
          '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
        "Re-parsed document should have the correct DOCTYPE declaration"
      );
    });
  });

  describe("SYSTEM DOCTYPE declarations", () => {
    it("should correctly parse SYSTEM DOCTYPE declarations", () => {
      // GIVEN an HTML document with a SYSTEM DOCTYPE declaration
      const { document } = InSpatialDOM(
        `<!DOCTYPE math SYSTEM 
          "http://www.w3.org/Math/DTD/mathml1/mathml.dtd"><html></html>`
      );
      const doctype = document.firstChild;

      // THEN it should extract the correct systemId
      assert(
        doctype.systemId === "http://www.w3.org/Math/DTD/mathml1/mathml.dtd",
        "DOCTYPE should have the correct systemId"
      );
    });

    it("should correctly serialize SYSTEM DOCTYPE declarations to string", () => {
      // GIVEN an HTML document with a SYSTEM DOCTYPE declaration
      const { document } = InSpatialDOM(
        `<!DOCTYPE math SYSTEM 
          "http://www.w3.org/Math/DTD/mathml1/mathml.dtd"><html></html>`
      );

      // WHEN converting the document to string
      const docString = document.toString();

      // THEN it should have the correctly formatted DOCTYPE declaration
      assert(
        docString ===
          '<!DOCTYPE math SYSTEM "http://www.w3.org/Math/DTD/mathml1/mathml.dtd"><html></html>',
        "Document string should contain correctly formatted SYSTEM DOCTYPE declaration"
      );
    });

    it("should correctly serialize and parse SYSTEM DOCTYPE declarations to/from JSON", () => {
      // GIVEN an HTML document with a SYSTEM DOCTYPE declaration
      const { document } = InSpatialDOM(
        `<!DOCTYPE math SYSTEM 
          "http://www.w3.org/Math/DTD/mathml1/mathml.dtd"><html></html>`
      );

      // WHEN serializing to JSON and parsing back
      const jsonString = JSON.stringify(document);
      const parsedDocument = parseJSON(jsonString);

      // THEN the serialized JSON should have the correct structure
      assert(
        jsonString ===
          `[9,10,"math","http://www.w3.org/Math/DTD/mathml1/mathml.dtd",1,"html",-2]`,
        "JSON serialization should contain DOCTYPE information in the correct format"
      );

      // AND the parsed document should have the correct DOCTYPE declaration
      assert(
        parsedDocument.firstChild.toString() ===
          '<!DOCTYPE math SYSTEM "http://www.w3.org/Math/DTD/mathml1/mathml.dtd">',
        "Re-parsed document should have the correct DOCTYPE declaration"
      );
    });
  });

  describe("DocumentType creation", () => {
    it("should allow programmatic creation of DOCTYPE nodes", () => {
      // GIVEN a document with methods to create DocumentType nodes
      const { document } = InSpatialDOM("<html></html>");

      // WHEN creating a DOCTYPE node programmatically
      const doctype = document.createDocumentType(
        "svg",
        "-//W3C//DTD SVG 1.0//EN",
        "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd"
      );

      // THEN it should create a properly formatted DOCTYPE node
      assert(
        doctype.toString() ===
          '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">',
        "Programmatically created DOCTYPE node should have the correct string representation"
      );
    });
  });
});
