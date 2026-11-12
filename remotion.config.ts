/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

// Vendored remocn components import each other through the `@/` alias declared
// in tsconfig `paths`. tsc honours that, but the Remotion bundler runs its own
// webpack and does not read tsconfig paths — without this the components
// typecheck cleanly and then fail to resolve at bundle time.
const withAlias = (c: Parameters<typeof enableTailwind>[0]) => ({
  ...c,
  resolve: {
    ...c.resolve,
    alias: {
      ...(c.resolve?.alias ?? {}),
      "@": path.join(process.cwd(), "src"),
    },
  },
});

// PNG frames instead of JPEG: JPEG re-compresses every frame before encoding,
// which softens fine detail (hair edges, thin dotted callout lines, small type).
Config.setVideoImageFormat("png");
// Lower CRF = higher quality. 18 is visually near-lossless for h264.
Config.setCrf(18);
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig((c) => withAlias(enableTailwind(c)));
