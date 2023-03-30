import { createSignal, For, onMount } from "solid-js";
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
  const [currentsongcover, SetCurrentsongcover] = createSignal();
  const [search, Setsearch] = createSignal([])

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
    SetCurrentsongcover({"cover":song.c, "meta":song.meta});
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
        SetCurrentsongcover({"cover":song.c, "meta":song.meta});
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
        SetCurrentsongcover({"cover":song.c, "meta":song.meta});
        setNo(song.meta.no);
        SetCurrent("https://stream.localhost/"+song.s);
        SetCurrentsong(song.s);
        document.getElementById("ap").play();
        break;
      }
    }
  }
  // ! dev -> handle search func
  function searcher(event){
    let search = event.target.value.toLowerCase();
    let result = [];
    if (event.target.value == "" || event.target.value == " "){
      Setsearch([]);
    }
    else{
      for (let music of musics()){
        if (music.meta.title.toLowerCase().includes(search) || music.meta.artist.toLowerCase().includes(search)){
          result.push(music);
        }
      }
      Setsearch(result);
    }
  }


  function expander_stuff(hs){
    const aside = document.querySelector("aside");
    for (const child of aside.children){
      if (child.className == "expander" || child.className == "show"){
        continue;
      }
      if (hs == 0){
        child.style.display = "none";
      } else if (hs == 1){
        if (child.className == "currentsong"){
          child.style.display = "block";
        }else{
          child.style.display = "flex";
        }
      }
    }
  }
  function expander(){
    const ui = document.getElementById("ui");
    if (ui.style.gridTemplateColumns == "40px auto" || ui.style.gridTemplateColumns == ""){
      expander_stuff(1);
      document.getElementById("expand").style.transform = "rotate(0deg)";
      ui.style.gridTemplateColumns = "100px auto";
    }else{
      expander_stuff(0);
      setTimeout(()=>{
        document.getElementById("expand").style.transform = "rotate(90deg)";
      },400)
      ui.style.gridTemplateColumns = "40px auto";
    }
  }
  // ▼ ►
  return (
    <div id="ui" class="music">

      <aside>
        <div id="expand" class="expander" onClick={expander}><div></div><div></div></div>
        <input type="text" id="seacher" placeholder="Search" onChange={searcher}/>
        <div class="search_result">
            <For each={search()}>
              {(result)=>(
                <a href={"#no"+result.meta.no}>
                  <p>{result.meta.artist}</p>
                  <p>{result.meta.title}</p>
                </a>
              )}
            </For>
        </div>
        <Show
          musics = {musics}
        />
        {currentsongcover() &&
        (<div class="currentsong">
          <img src={currentsongcover().cover}/>
          <p>{currentsongcover().meta.artist}</p>
          <p>{currentsongcover().meta.title}</p>
          <p>{currentsongcover().meta.year}</p>
          <p>{musics().length + "/" + currentsongcover().meta.no}</p>
        </div>)
        }
      </aside>

      <div class="songs">
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
