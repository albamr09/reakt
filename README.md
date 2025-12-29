# reakt

Simplified React clone, the goal was to understand React's inner logic in a more in-depth way :)

## Setup

As always, run `pnpm install` to install the very many dependencies needed on this project.

## Build

To build the library run the following:

```bash
pnpm bulid
```

This will generate commonjs, esm and iife that can be imported within your project.

To build the examples, do the following:

```bash
cd examples && pnpm && pnpm build
```

You can now open start a server to see the examples for yourself:

```bash
pnpm serve
```

This will start a server on `http://localhost:3000`, from where you can examplore all the examples available.
