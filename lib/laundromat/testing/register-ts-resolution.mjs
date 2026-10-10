import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const ROOT_URL = pathToFileURL(`${process.cwd()}/`).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    const rooted = specifier.startsWith("@/")
      ? new URL(specifier.slice(2), ROOT_URL).href
      : specifier;
    const isExtensionlessPath =
      /^(\.{1,2}\/|file:)/.test(rooted) && !/\.[cm]?[jt]sx?$/.test(rooted);
    return nextResolve(isExtensionlessPath ? `${rooted}.ts` : rooted, context);
  },
});
