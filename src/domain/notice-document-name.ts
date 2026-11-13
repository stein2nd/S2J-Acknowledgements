import type { AckConfig } from "./ack-config.js";
import { SPDX_GENERIC_DOCUMENT_NAME, spdxDocumentNameFromProductName } from "./spdx-anonymize.js";

export type NoticeDocumentNameSource =
  | "pipeline.noticeProductName"
  | "xcode.productName"
  | "generic";

export type NoticeDocumentNameResolution = {
  documentName: string;
  isGeneric: boolean;
  source: NoticeDocumentNameSource;
};

export const NOTICE_GENERIC_NAME_HINT =
  "set pipeline.noticeProductName (or xcode.productName for macOS apps) for a product-specific OSS Notice title";

/** Resolve SPDX document / onot Notice title from host config. */
export function resolveNoticeDocumentName(config: AckConfig): NoticeDocumentNameResolution {
  const explicit = config.pipeline?.noticeProductName?.trim();
  if (explicit) {
    return {
      documentName: explicit,
      isGeneric: false,
      source: "pipeline.noticeProductName",
    };
  }

  const productName = config.xcode?.productName?.trim();
  if (productName) {
    return {
      documentName: spdxDocumentNameFromProductName(productName),
      isGeneric: false,
      source: "xcode.productName",
    };
  }

  return {
    documentName: SPDX_GENERIC_DOCUMENT_NAME,
    isGeneric: true,
    source: "generic",
  };
}

export function warnIfGenericNoticeDocumentName(resolution: NoticeDocumentNameResolution): void {
  if (!resolution.isGeneric) return;
  console.error(
    `warn: SPDX document name is generic (${SPDX_GENERIC_DOCUMENT_NAME}); ${NOTICE_GENERIC_NAME_HINT}`,
  );
}
