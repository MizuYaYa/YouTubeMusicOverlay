export default defineBackground(() => {
  const port = browser.runtime.connectNative("com.mizuyaya.youtube_music_overlay_app");
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message from content scripts:", message);

    if (message.native) {
      port.postMessage(message.native);
    }
  });
});
