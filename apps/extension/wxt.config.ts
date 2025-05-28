import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-solid", "@wxt-dev/auto-icons"],
  outDir: "dist",
  manifest: {
    name: "YouTube Music Overlay",
    description: "YouTube Musicで再生中の音楽をデスクトップアプリでオーバーレイ表示します。",
    permissions: ["nativeMessaging"],
  },
});
