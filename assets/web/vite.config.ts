import honox from "honox/vite";
import { defineConfig } from "vite";
import externalize from "vite-plugin-externalize-dependencies";

const externals = [
  "@aws-sdk/client-s3",
  "@aws-sdk/lib-dynamodb",
  "@aws-sdk/client-dynamodb",
  "bcryptjs",
  "ulid",
  "file-type",
];

import("dotenv/config");

export default defineConfig(({ mode }) => ({
  plugins: [honox(), externalize({ externals })],
  resolve: {
    alias: {
      "@": "/app",
    },
  },
  ...(mode !== "client" && {
    ssr: {
      external: externals,
    },
    build: {
      // for lambda
      ssr: "app/index.ts",
      // for css
      assetsDir: "static",
      ssrEmitAssets: true,
      // for client side
      emptyOutDir: false,
    },
  }),
}));
