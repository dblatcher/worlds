// build.ts
import { build } from "tsdown";

await build({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	outDir: "dist",
	dts: true,
	platform: "browser"
	// ...any other options
});