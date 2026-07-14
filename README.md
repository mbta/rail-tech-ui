# rail-tech-ui

## Important about `npm link`

If running a local copy within glides or orbit using `npm link`, make sure to ALSO run:

```sh
npm link ../glides/node_modules/react ../glides/node_modules/react-router-dom
```

within `rail-tech-ui` to ensure that they're using the same react. Otherwise, hooks will not work!
