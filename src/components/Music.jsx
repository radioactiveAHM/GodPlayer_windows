import { createSignal, onMount } from "solid-js";
import Player from "./player/Player";
import Song from "./player/Song";
import Show from "./player/Show";
import { readDir } from "@tauri-apps/api/fs";
import { cacheDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api";

function Music() {
  const [musics, SetMusics] = createSignal([]);
  const [current, SetCurrent] = createSignal("");
  const [currentsong, SetCurrentsong] = createSignal("");
  const [coverBin, SetCoverBin] = createSignal();
  const [no, setNo] = createSignal(0);

  onMount(async () => {
    await cacheDir().then(async (dir) => {
      // console.log(dir+"\\Temp\\godplayer");
      await readDir(dir + "\\Temp\\godplayer")
        .catch((e) => console.log(e))
        .then(async (v) => {
          let Llist = [];
          for (let n_p of v) {
            Llist.push({
              name: n_p.name,
              link: "https://stream.localhost/"+n_p.path,
            });
          }
          SetCoverBin(Llist);
        });
    });
    await invoke("songlist").then((list) => {
      SetMusics(
        list.map((v) => {
          let link;
          for (let match of coverBin()) {
            if (
              match.name.split(".")[0] == v.path.split(".")[0].split("\\").pop()
            ) {
              link = match.link;
              break;
            }
          }
          return { s: v.path, c: link, meta: v };
        })
      );
    });
    for (let i in musics()) {
      if (parseInt(i) % 2 != 0) {
        document.querySelector(
          "li:nth-child(" + (parseInt(i) + 1) + ")"
        ).style.background = "rgba(0,0,0,0.2)";
      }
    }
  });

  function play(song) {
    setNo(song.meta.no);
    SetCurrentsong(song.s);
    SetCurrent("https://stream.localhost/"+song.s);
    document.getElementById("ap").play();
  }

  function next_s() {
    const songs_list = musics();
    for (let i in songs_list) {
      if (songs_list[i].s == currentsong()) {
        let song = songs_list[parseInt(i) + 1];
        setNo(song.meta.no);
        SetCurrent("https://stream.localhost/"+song.s);
        SetCurrentsong(song.s);
        document.getElementById("ap").play();
        break;
      }
    }
  }
  async function back_s() {
    const songs_list = musics();
    for (let i in songs_list) {
      if (songs_list[i].s == currentsong()) {
        let song = songs_list[parseInt(i) - 1];
        setNo(song.meta.no);
        SetCurrent("https://stream.localhost/"+song.s);
        SetCurrentsong(song.s);
        document.getElementById("ap").play();
        break;
      }
    }
  }

  // ▼ ►
  return (
    <div class="music">
      <div class="songs">
        <Show
          musics = {musics}

        />
        <ol>
          <For each={musics()}>
            {(song) => (
              <Song
                song={song}
                play={play}
              />
            )}
          </For>
        </ol>
      </div>
        <Player
          al={current() ? current() : ""}
          // name={currentsong}
          next={next_s}
          back={back_s}
          // ml={musics}
          no={no}
        />
    </div>
  );
}

export default Music;
