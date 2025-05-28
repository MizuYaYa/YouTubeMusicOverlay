export default defineContentScript({
  matches: ["*://music.youtube.com/*"],
  main(ctx) {
    let sentTitle = "";
    let playedBackState = "none";
    function checkMediaData() {
      const { metadata: mediaData, playbackState } = navigator.mediaSession;
      const progressbar = document.getElementById("progress-bar");
      const progressValues = progressbar?.ariaValueText?.split("/");

      if (mediaData && (mediaData.title !== sentTitle || playbackState !== playedBackState)) {
        sentTitle = mediaData.title;
        playedBackState = playbackState;
        console.log("mediaData", mediaData);
        browser.runtime.sendMessage({
          native: {
            title: mediaData.title,
            artist: mediaData.artist,
            album: mediaData.album,
            artwork: mediaData.artwork.map((item) => item.src),
            playbackState,
            timestamp: [progressValues?.[0].trim() || 0, progressValues?.[1].trim() || 0],
          },
        });
      }
    }

    ctx.setInterval(checkMediaData, 1000);
  },
});
