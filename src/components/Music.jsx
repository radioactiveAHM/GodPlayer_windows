import { createSignal, onMount, onCleanup, lazy, Suspense } from "solid-js";
import Player from "./player/Player";
import Show from "./player/Show";
import Focus from "./player/Focus";
import { invoke } from "@tauri-apps/api";

// key shortcut
import {register, unregisterAll} from "@tauri-apps/api/globalShortcut"

// icon
import { Icon } from "solid-heroicons";
import { magnifyingGlass, musicalNote } from "solid-heroicons/solid-mini";

// import Song from "./player/Song";
// lazy import test
const Song = lazy(()=>import("./player/Song"));

let temp = [];

function Music() {
  const [musics, SetMusics] = createSignal([]);
  const [current, SetCurrent] = createSignal("");
  const [currentsong, SetCurrentsong] = createSignal("");
  const [no, setNo] = createSignal(0);
  const [currentsongcover, SetCurrentsongcover] = createSignal();
  const [search, Setsearch] = createSignal([])
  const [playlist, SetPlaylist] = createSignal([]);
  const [currentRaw, SetCurrentRaw] = createSignal();
  const [sorted, Setsorted] = createSignal([]);
  
  let length = 0;
  // NEW
  // Elements
  let ui;
  let expand;
  let seacher;
  let switcher;
  let sort_btn;
  let aside_controllers;

  onCleanup(async ()=>{
    await unregisterAll()
  })
  onMount(async () => {
    ui.style.filter = "blur(10px)";
    invoke("load_playlist").catch(e=>{console.log(e)}).then(playlist=>{
      SetPlaylist(JSON.parse(playlist));
    })
    await unregisterAll()
    await register("Alt+N", ()=>{
      next_s();
    })
    await register("Alt+B", ()=>{
      back_s();
    })
    await invoke("songlist").then((list) => {
      length = list.length;
      SetMusics(
        list.map((song)=>({ s: song.path, c: "https://stream.localhost/"+song.cover, meta: song }))
      );
    });
    temp = musics();
    ui.style.filter = "blur(0px)";
  });

  function play(song) {
    SetCurrentRaw(song)
    SetCurrentsongcover({"cover":song.c, "meta":song.meta});
    setNo(song.meta.no);
    SetCurrentsong(song.s);
    SetCurrent("https://stream.localhost/"+song.s);
    document.getElementById("ap").play();
  }

  function next_s() {
    // setup shuffle
    // NEW
    const songs_list = musics();
    if (document.getElementById("shuffle_id").getAttribute("name")=="enabled"){
      // when shuffle active
      const chosen = songs_list[Math.floor(Math.random()*songs_list.length)];
      SetCurrentsongcover({"cover":chosen.c, "meta":chosen.meta});
      SetCurrentRaw(chosen);
      setNo(chosen.meta.no);
      SetCurrent("https://stream.localhost/"+chosen.s);
      SetCurrentsong(chosen.s);
      document.getElementById("ap").play();

    } else {

      for (let i in songs_list) {
        if (songs_list[i].s == currentsong()) {
          let song = songs_list[parseInt(i) + 1];
          SetCurrentsongcover({"cover":song.c, "meta":song.meta});
          setNo(song.meta.no);
          SetCurrentRaw(song);
          SetCurrent("https://stream.localhost/"+song.s);
          SetCurrentsong(song.s);
          document.getElementById("ap").play();
          break;
        }
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
        SetCurrentRaw(song);
        SetCurrent("https://stream.localhost/"+song.s);
        SetCurrentsong(song.s);
        document.getElementById("ap").play();
        break;
      }
    }
  }
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

  function empty_search(){
    seacher.value = "";
    Setsearch([]);
  }


  function expander_stuff(hs){
    const aside = document.querySelector("aside");
    for (const child of aside.children){
      if (child.className == "expander" || child.className == "show" || child.className == "aside_controllers"){continue}
      if (hs == 0){
        if (child.className == "search_icon"){
          child.style.display = "block";
        }else{
          child.style.display = "none";
        }
      } else if (hs == 1){
        if (child.className == "currentsong"){
          child.style.display = "block";
        }
        else if (child.className == "search_icon"){
          child.style.display = "none";
        }
        else{
          child.style.display = "flex";
        }
      }
    }
  }
  function expander(){
    if (ui.style.gridTemplateColumns == "40px auto" || ui.style.gridTemplateColumns == ""){
      expander_stuff(1);
      expand.style.transform = "rotate(0deg)";
      ui.style.gridTemplateColumns = "100px auto";
      aside_controllers.style.flexDirection = "unset";
    }else{
      expander_stuff(0);
      setTimeout(()=>{
        expand.style.transform = "rotate(90deg)";
      },400)
      ui.style.gridTemplateColumns = "40px auto";
      aside_controllers.style.flexDirection = "column";
    }
  }
  function playlist_switcher(event){
    // functions
    function favList(){
      SetMusics(playlist());
    }
    function mainList(){
      SetMusics(temp);
    }
    function hide_focus(){
      document.getElementsByClassName("focus")[0].style.display = "none"
    }
    function show_focus(){
      document.getElementsByClassName("focus")[0].style.display = "block"
    }

    // NEW
    if (event.target.attributes.name && event.target.attributes.name.value == "mode"){
      if (0 < event.offsetY && event.offsetY < 20){
        // styling and animation
        switcher.style.transform = "translateY(0px)";
        switcher.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="var(--m1)" viewBox="0 0 256 256"><path d="M212.92,25.69a8,8,0,0,0-6.86-1.45l-128,32A8,8,0,0,0,72,64V174.08A36,36,0,1,0,88,204V70.25l112-28v99.83A36,36,0,1,0,216,172V32A8,8,0,0,0,212.92,25.69Z"></path></svg>'
        
        // functionality
        mainList();
        hide_focus();
      }
      else if(20 < event.offsetY && event.offsetY < 40){
        // styling and animation
        switcher.style.transform = "translateY(20px)";
        switcher.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="var(--m1)" viewBox="0 0 256 256"><path d="M240,94c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,220.66,16,164,16,94A62.07,62.07,0,0,1,78,32c20.65,0,38.73,8.88,50,23.89C139.27,40.88,157.35,32,178,32A62.07,62.07,0,0,1,240,94Z"></path></svg>';
        
        // functionality
        favList()
        hide_focus();
      }
      else if( 40 < event.offsetY && event.offsetY < 60){
        // styling and animation
        switcher.style.transform = "translateY(40px)";
        switcher.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="var(--m1)" viewBox="0 0 256 256"><path d="M224,64v8a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H216A8,8,0,0,1,224,64Zm-8,32H40a8,8,0,0,0-8,8v8a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8v-8A8,8,0,0,0,216,96Zm0,40H40a8,8,0,0,0-8,8v8a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8v-8A8,8,0,0,0,216,136Zm0,40H40a8,8,0,0,0-8,8v8a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8v-8A8,8,0,0,0,216,176Z"></path></svg>'
        
        // functionality
        show_focus();
      }
    }
  }

  async function sort(){
    let sorter = musics();
    switch (sort_btn.style.transform){
      case "":
        sort_btn.style.transform = "translateY(100%)";
          sorter.sort((a, b)=>{
            return (b.meta.modified.nanos_since_epoch - a.meta.modified.nanos_since_epoch)
          });
          sort_btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm88-24a8,8,0,0,0-8,8V82c-6.35-7.36-12.83-14.45-20.12-21.83a96,96,0,1,0-2,137.7,8,8,0,0,0-11-11.64A80,80,0,1,1,184.54,71.4C192.68,79.64,199.81,87.58,207,96H184a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V64A8,8,0,0,0,224,56Z"></path></svg>'
        Setsorted(sorter);
        break
      case "translateY(0%)":
        sort_btn.style.transform = "translateY(100%)";
          sorter.sort((a, b)=>{
            return (b.meta.modified.nanos_since_epoch - a.meta.modified.nanos_since_epoch)
          });
          sort_btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm88-24a8,8,0,0,0-8,8V82c-6.35-7.36-12.83-14.45-20.12-21.83a96,96,0,1,0-2,137.7,8,8,0,0,0-11-11.64A80,80,0,1,1,184.54,71.4C192.68,79.64,199.81,87.58,207,96H184a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V64A8,8,0,0,0,224,56Z"></path></svg>'
        Setsorted(sorter);
        break
      case "translateY(100%)":
        sort_btn.style.transform = "translateY(0%)";
        location.reload();
        break
    }
  }

  let observer = new IntersectionObserver((els)=>{
    for (let el of els){
      if (el.isIntersecting){
        // el.target.children
        for (let child of el.target.children){
          child.style.display = "flex"
        }
      }
      else{
        for (let child of el.target.children){
          child.style.display = "none"
        }
      }
    }
  }, {
    root: document.getElementsByName("ol")[0],
    rootMargin:"0px",
    threshold: 0.5
  })
  // ▼ ►
  return (
    <div ref={ui} class="music">
      <aside>
        <div ref={expand} class="expander" onClick={expander}><div></div><div></div></div>
        <div class="search_icon" onClick={expander}>
          <Icon path={magnifyingGlass}/>
        </div>
        <input type="text" ref={seacher} placeholder="Search" onInput={searcher}/>
        {search().length>0 && <div class="empty_search" onClick={empty_search}><p>Clear</p></div>}
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
        <div ref={aside_controllers} class="aside_controllers">
          <div class="playlist" onClick={playlist_switcher}>
            <div name="mode"><div ref={switcher}><svg xmlns="http://www.w3.org/2000/svg" fill="var(--m1)" viewBox="0 0 256 256"><path d="M212.92,25.69a8,8,0,0,0-6.86-1.45l-128,32A8,8,0,0,0,72,64V174.08A36,36,0,1,0,88,204V70.25l112-28v99.83A36,36,0,1,0,216,172V32A8,8,0,0,0,212.92,25.69Z"></path></svg></div></div>
          </div>
          <div className="sorting" onClick={sort}>
            <div ref={sort_btn}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M87.24,52.59a8,8,0,0,0-14.48,0l-64,136a8,8,0,1,0,14.48,6.81L39.9,160h80.2l16.66,35.4a8,8,0,1,0,14.48-6.81ZM47.43,144,80,74.79,112.57,144ZM200,96c-12.76,0-22.73,3.47-29.63,10.32a8,8,0,0,0,11.26,11.36c3.8-3.77,10-5.68,18.37-5.68,13.23,0,24,9,24,20v3.22A42.76,42.76,0,0,0,200,128c-22.06,0-40,16.15-40,36s17.94,36,40,36a42.73,42.73,0,0,0,24-7.25,8,8,0,0,0,16-.75V132C240,112.15,222.06,96,200,96Zm0,88c-13.23,0-24-9-24-20s10.77-20,24-20,24,9,24,20S213.23,184,200,184Z"></path></svg>
            </div>
          </div>
        </div>
        {currentsongcover() &&
        (<div class="currentsong">
          {currentsongcover().cover !== "https://stream.localhost/" ? <img src={currentsongcover().cover}/> : <Icon path={musicalNote}/>}
          {currentsongcover().meta.artist && <p>{currentsongcover().meta.artist}</p>}
          {currentsongcover().meta.title && <p>{currentsongcover().meta.title}</p>}
          {(currentsongcover().meta.date!=="0000") && <p>{currentsongcover().meta.date}</p>}
          <p>{length + "/" + currentsongcover().meta.no}</p>
        </div>)
        }
      </aside>
      <div class="songs">
        <ol>
          <For each={sorted().length===0 ? musics() : sorted()}>
            {(song, i) => (
              <Suspense fallback={<p>Loading...</p>}>
                <Song
                  song={song}
                  play={play}
                  count={i}
                  ob={observer}
                />
              </Suspense>
            )}
          </For>
        </ol>
        <Focus
          songraw={currentRaw}
        />
      </div>
      <Player
        al={current() ? current() : ""}
        next={next_s}
        back={back_s}
        no={no}
        playlist={playlist}
        setplaylist={SetPlaylist}
        currentRaw={currentRaw}
      />
    </div>
  );
}

export default Music;
