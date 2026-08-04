# rail-tech-ui

## Building and testing

```shell
npm install
npm run build # not actually needed for testing
npm test
```

## Development within Glorbit

```shell
npm run watch
```

## Building Figma Tokens

Variables have to be exported out of Figma manually into .json files. These are saved to to `assets/figma-tokens/`. `assets/process-figma-tokens.ts` processes the exported Figma design tokens and generates some `variables.*.css` files, as well as `tokens.ts`, which will be used to build the Tailwind theme. -- StyleDictionary throws some warnings, but ultimately works.

```shell
npm run process-tokens
```

### Important about `npm link`

If running a local copy within glides or orbit using `npm link`, make sure to ALSO run:

```sh
npm link ../glides/node_modules/react ../glides/node_modules/react-router-dom ../glides/node_modules/react-dom
```

within `rail-tech-ui` to ensure that they're using the same react. Otherwise, the ladder will error out on load!

This assumes that `rail-tech-ui` and `glides` share a parent directory. If developing against orbit, change `glides` to `orbit`.
