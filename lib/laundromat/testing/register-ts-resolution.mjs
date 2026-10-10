import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    const isExtensionlessRelative =
      /^\.{1,2}\//.test(specifier) && !/\.[cm]?[jt]sx?$/.test(specifier);
    return nextResolve(
      isExtensionlessRelative ? `${specifier}.ts` : specifier,
      context
    );
  },
});
