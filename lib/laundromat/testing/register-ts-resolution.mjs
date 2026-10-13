import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const projectRoot = pathToFileURL(`${process.cwd()}/`);

registerHooks({
  resolve(specifier, context, nextResolve) {
    const isAliased = specifier.startsWith("@/");
    const path = isAliased
      ? new URL(specifier.slice(2), projectRoot).href
      : specifier;
    const isFromPackage =
      context.parentURL?.includes("/node_modules/") ?? false;
    const isExtensionlessLocal =
      !isFromPackage &&
      (isAliased || /^\.{1,2}\//.test(specifier)) &&
      !/\.[cm]?[jt]sx?$/.test(specifier);
    return nextResolve(isExtensionlessLocal ? `${path}.ts` : path, context);
  },
});
