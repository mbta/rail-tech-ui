import esbuild from "esbuild";
import fs from "node:fs";

const args = process.argv.slice(2);
const watch = args.includes("--watch");

const opts: esbuild.BuildOptions = {
  entryPoints: ["./src/index.ts", "./src/tailwind.config.ts"],
  bundle: true,
  outdir: "./dist/src",
  logLevel: "debug",
  external: ["react", "react-dom"],
  platform: "neutral",
  ...(watch ? { sourcemap: "inline" } : {}),
};

const copyCss = () => {
  const src = "./assets/css";
  const dest = "./dist/css";

  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
  }
};

const main = async () => {
  copyCss();

  if (watch) {
    const ctx = await esbuild.context(opts);
    await ctx.watch();

    process.stdin.on("close", () => {
      process.exit(0);
    });

    process.stdin.resume();
  } else {
    await esbuild.build(opts);
  }
};

main().catch((err) => {
  throw err;
});
