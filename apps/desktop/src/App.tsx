import { ErrorBoundary, Show, createSignal } from "solid-js";
import "./App.css";
import { listen } from "@tauri-apps/api/event";
import { secondsToMMSSFormat, timestampStringToSeconds } from "./utils/parseTimestamp";

export type Media = {
  title: string;
  artist: string;
  album: string;
  artwork: string[];
  playbackState: string;
  timestamp: { text: string[]; number: number[] };
};

function App() {
  const [currentMedia, setCurrentMedia] = createSignal<Media | null>(null);
  const [sleepAttempt, setSleepAttempt] = createSignal(0);

  listen<string>("native-message", (message) => {
    console.log("Received message from native:", message);
    const messageObject = JSON.parse(message.payload);

    const timeInSeconds = messageObject.timestamp.map(timestampStringToSeconds);
    setCurrentMedia({
      title: messageObject.title,
      artist: messageObject.artist,
      album: messageObject.album,
      artwork: messageObject.artwork,
      playbackState: messageObject.playbackState,
      timestamp: {
        text: timeInSeconds.map(secondsToMMSSFormat),
        number: timeInSeconds,
      },
    });
    console.log(currentMedia());
  });

  setInterval(() => {
    if (currentMedia()?.playbackState !== "playing") {
      setSleepAttempt((prev) => prev + 1);
      if (sleepAttempt() > 120) {
        setCurrentMedia(null);
        setSleepAttempt(0);
      }
      return;
    }
    setSleepAttempt(0);
    setCurrentMedia((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        timestamp: {
          text: prev.timestamp.text,
          number: [prev.timestamp.number[0] + 1, prev.timestamp.number[1]],
        },
      };
    });
  }, 1000);

  return (
    <main class="container" style={{ display: currentMedia() ? "" : "none" }}>
      <Show when={currentMedia()}>
        {(media) => (
          <>
            <ErrorBoundary fallback={(error) => error}>
              <div class="media-card">
                <img src={media().artwork.at(-1)} alt={media().title} class="media-artwork" />
                <div class="media-info">
                  <div>
                    <h3>{media().title}</h3>
                    <p>{media().artist}</p>
                    <p>{media().album ? `(${media().album})` : "\u00A0"}</p>
                  </div>
                  <div class="media-status">
                    <span>{media().timestamp.text[0]}</span>
                    <span>{media().timestamp.text.at(-1)}</span>
                  </div>
                </div>
              </div>
              <progress max={media().timestamp.number.at(-1)} value={media().timestamp.number[0]} />
            </ErrorBoundary>
          </>
        )}
      </Show>
    </main>
  );
}

export default App;
