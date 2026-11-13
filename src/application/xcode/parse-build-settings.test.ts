import { describe, expect, it } from "vitest";

import { appPathFromBuildSettings, parseBuildSettings } from "./parse-build-settings.js";

describe("parse-build-settings", () => {
  it("parses key = value lines", () => {
    const text = `
    BUILD_DIR = /tmp/Build
    BUILT_PRODUCTS_DIR = /tmp/Build/Products/Release
    WRAPPER_NAME = CozyBrewApp.app
`;
    const s = parseBuildSettings(text);
    expect(s.BUILT_PRODUCTS_DIR).toBe("/tmp/Build/Products/Release");
    expect(appPathFromBuildSettings(s)).toBe("/tmp/Build/Products/Release/CozyBrewApp.app");
  });

  it("uses FULL_PRODUCT_NAME when WRAPPER_NAME missing", () => {
    const s = {
      BUILT_PRODUCTS_DIR: "/Products",
      FULL_PRODUCT_NAME: "Foo.app",
    };
    expect(appPathFromBuildSettings(s)).toBe("/Products/Foo.app");
  });

  it("prefers xcode.productName over merged framework WRAPPER_NAME", () => {
    const s = {
      BUILT_PRODUCTS_DIR: "/Products/Release",
      WRAPPER_NAME: "CozyBrewCore.framework",
      FULL_PRODUCT_NAME: "CozyBrewCore.framework",
    };
    expect(appPathFromBuildSettings(s)).toBeNull();
    expect(appPathFromBuildSettings(s, "CozyBrewApp.app")).toBe(
      "/Products/Release/CozyBrewApp.app",
    );
  });
});
