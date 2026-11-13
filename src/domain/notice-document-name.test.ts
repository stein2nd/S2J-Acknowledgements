import { describe, expect, it } from "vitest";

import type { AckConfig } from "./ack-config.js";
import { NOTICE_GENERIC_NAME_HINT, resolveNoticeDocumentName } from "./notice-document-name.js";
import { SPDX_GENERIC_DOCUMENT_NAME } from "./spdx-anonymize.js";

const base: AckConfig = {
  preset: "dir",
  output: "ACKNOWLEDGEMENTS.md",
};

describe("resolveNoticeDocumentName", () => {
  it("prefers pipeline.noticeProductName over xcode.productName", () => {
    const config: AckConfig = {
      ...base,
      pipeline: { noticeProductName: "My Plugin" },
      xcode: { productName: "Other.app" },
    };
    const r = resolveNoticeDocumentName(config);
    expect(r).toEqual({
      documentName: "My Plugin",
      isGeneric: false,
      source: "pipeline.noticeProductName",
    });
  });

  it("uses xcode.productName when noticeProductName is unset", () => {
    const config: AckConfig = {
      ...base,
      preset: "macos-app",
      xcode: { productName: "CozyBrewApp.app" },
    };
    const r = resolveNoticeDocumentName(config);
    expect(r.documentName).toBe("CozyBrewApp");
    expect(r.isGeneric).toBe(false);
    expect(r.source).toBe("xcode.productName");
  });

  it("falls back to generic host-sbom", () => {
    const r = resolveNoticeDocumentName(base);
    expect(r.documentName).toBe(SPDX_GENERIC_DOCUMENT_NAME);
    expect(r.isGeneric).toBe(true);
    expect(r.source).toBe("generic");
  });

  it("documents hint for generic case", () => {
    expect(NOTICE_GENERIC_NAME_HINT).toContain("pipeline.noticeProductName");
  });
});
