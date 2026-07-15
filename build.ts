import esbuild from "esbuild";

const args = process.argv.slice(2);
const watch = args.includes("--watch");

const opts: esbuild.BuildOptions = {
  entryPoints: ["./src/index.ts"],
  bundle: true,
  outfile: "./dist/src/index.js",
  logLevel: "debug",
  external: ["react", "react-dom", "react-router-dom"],
  platform: "browser",
  ...(watch ? { sourcemap: "inline" } : {}),
};

const main = async () => {
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
