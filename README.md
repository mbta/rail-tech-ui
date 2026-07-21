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

### Important about `npm link`

If running a local copy within glides or orbit using `npm link`, make sure to ALSO run:

```sh
npm link ../glides/node_modules/react ../glides/node_modules/react-router-dom ../glides/node_modules/react-dom
```

within `rail-tech-ui` to ensure that they're using the same react. Otherwise, the ladder will error out on load!

This assumes that `rail-tech-ui` and `glides` share a parent directory. If developing against orbit, change `glides` to `orbit`.
