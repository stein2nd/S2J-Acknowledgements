import { describe, expect, it } from "vitest";

import { derivedDataRootFromAppPath, pickSingleApp } from "./derived-data.js";

describe("derived-data", () => {
  it("extracts DerivedData folder from app path", () => {
    const app =
      "/Users/me/Library/Developer/Xcode/DerivedData/CozyBrew-abc/Build/Products/Release/CozyBrew.app";
    expect(derivedDataRootFromAppPath(app)).toBe(
      "/Users/me/Library/Developer/Xcode/DerivedData/CozyBrew-abc",
    );
  });

  it("picks newest single app", () => {
    const picked = pickSingleApp([
      { path: "/a/old.app", mtimeMs: 1 },
      { path: "/b/new.app", mtimeMs: 100 },
    ]);
    expect(picked.ok && picked.path).toBe("/b/new.app");
  });

  it("fails on ambiguous mtime tie", () => {
    const picked = pickSingleApp([
      { path: "/a/one.app", mtimeMs: 10 },
      { path: "/b/two.app", mtimeMs: 10 },
    ]);
    expect(picked.ok).toBe(false);
  });
});
