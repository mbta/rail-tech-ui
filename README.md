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

### Downloading from Figma

1. From Figma settings, ensure your account has "Dev seat" listed
1. Open the "Glides/Orbit Design Library" in Figma
1. In the bottom toolbar, click "Dev Mode"
1. In the Figma right-hand sidebar, click "Plugins" and then "Prism Token Exporter - W3C Token JSON" (if the plugin has not been saved, open the [Prism Token Exporter community plugin](https://www.figma.com/community/plugin/1479197616943612145/prism-token-exporter-w3c-token-json) and click the bookmark icon)
1. Click "Download Tokens" and save

### Importing into rail-tech-ui

1. Unzip the `design-tokens.zip` file previously downloaded
1. Copy the contents above to `assets/figma-tokens/` (overwriting existing files)
1. _TEMP: check for any "hover" states in the JSON files and manually delete them (temporary workaround)_
1. Run `npm run process-tokens` to invoke `process-figma-tokens.ts`, which will generate `variables.*.css` stylesheets in `assets/css/`, as well as `tokens.js`, which will be used to build the Tailwind theme
1. Manually update `tailwind.config.ts` following the hierarchy and casing conventions for keys, using the values defined in `tokens.js`

### Important about `npm link`

If running a local copy within glides or orbit using `npm link`, make sure to ALSO run:

```sh
npm link ../glides/node_modules/react ../glides/node_modules/react-dom
```

within `rail-tech-ui` to ensure that they're using the same react. Otherwise, the ladder will error out on load!

This assumes that `rail-tech-ui` and `glides` share a parent directory. If developing against orbit, change `glides` to `orbit`.
