import { createSignal, onMount } from "solid-js"
import Player from "./player/Player";
import { readBinaryFile, readDir } from "@tauri-apps/api/fs";
import { audioDir, cacheDir } from "@tauri-apps/api/path";

import { Icon } from "solid-heroicons";
import {musicalNote, bars_3} from "solid-heroicons/solid-mini"

function Music(){
    const [musics, SetMusics] = createSignal([]);
    const [current, SetCurrent] = createSignal("");
    const [currentsong, SetCurrentsong] = createSignal("");
    const [listing, SetListing] = createSignal(1);
    const [theme, SetTheme] = createSignal(0);
    const [coverBin, SetCoverBin] = createSignal();

    // loading animation function
    function showloading(booler){
        if(booler == true){
            console.log("meow");
            document.getElementById("loader").style.display="flex"
        }else{
            document.getElementById("loader").style.display="none"            
        }
    }

    
    onMount( async()=>{
        await cacheDir().then(async(dir)=>{
            // console.log(dir+"\\Temp\\godplayer");
            await readDir(dir+"\\Temp\\godplayer")
                .catch(e=>console.log(e))
                .then(async(v)=>{
                    let Llist = [];
                    for (let n_p of v){
                        let b;
                        await readBinaryFile(n_p.path).catch(e=>console.log(e)).then(binary=>{
                            b = binary;
                        });
                        const ffa = new Blob([b], {type: "image/jpg"});
                        Llist.push({"name":n_p.name, "link":window.URL.createObjectURL(ffa)})
                    }
                    SetCoverBin(Llist);
                })
          })
        await audioDir()
        .catch(e=>console.log(e))
        .then(async(v)=>{
          await readDir(v)
          .then(r=>{
            SetMusics(r.filter((l)=>{if(l.name.includes(".mp3")){return(true)}}).map((v)=>{
                let link;
                for (let match of coverBin()){
                    if (match.name.split(".")[0] == v.name.split(".")[0]){
                        link = match.link;
                        break;
                    }
                }
                return({"s":v.path, "c":link})
            })
            )
          })
        })
            for (let i in musics()){
                if (parseInt(i)%2 != 0){
                    document.querySelector("li:nth-child("+(parseInt(i)+1)+")").style.background = "rgba(0,0,0,0.3)"
                }
            }
        });

    async function play(song){
        showloading(true);
        await readBinaryFile(song)
        .catch(e=>console.log(e))
        .then(music=>{
          const f = new Blob([music], {type: "audio/mp3"});
          SetCurrentsong(song);
          SetCurrent(window.URL.createObjectURL(f));
          document.getElementById("ap").play();
        })
        showloading(false);
    }

    async function next_s(){
        showloading(true);
        const songs_list = musics();
        for (let i in songs_list){
            if (songs_list[i].s == currentsong()){
                await readBinaryFile(songs_list[parseInt(i)+1].s)
                .catch(e=>console.log(e))
                .then(music=>{
                    const f = new Blob([music], {type: "audio/mp3"});
                    SetCurrent(window.URL.createObjectURL(f));
                    SetCurrentsong(songs_list[parseInt(i)+1].s);
                    document.getElementById("ap").play();
                })
                break
            }
        }
        showloading(false);
    }
    async function back_s(){
        showloading(true);
        const songs_list = musics();
        for (let i in songs_list){
            if (songs_list[i].s == currentsong()){
                await readBinaryFile(songs_list[parseInt(i)-1].s)
                .catch(e=>console.log(e))
                .then(music=>{
                    const f = new Blob([music], {type: "audio/mp3"});
                    SetCurrent(window.URL.createObjectURL(f));
                    SetCurrentsong(songs_list[parseInt(i)-1].s);
                    document.getElementById("ap").play();
                })
                break
            }
        }
        showloading(false);
    }

    function themer(){
        const color = document.querySelector(":root")
        switch (theme()){
            case 0:
                color.style.setProperty("--c1", "#455d7a");
                color.style.setProperty("--c2", "#a2a8d3");
                color.style.setProperty("--m2", "#f95959");
                SetTheme(1);
                break;
            case 1:
                color.style.setProperty("--c1", "#a393eb");
                color.style.setProperty("--c2", "#5e63b6");
                color.style.setProperty("--m2", "#f5c7f7");
                SetTheme(2);
                break;
            case 2:
                color.style.setProperty("--c1", "#5b446a");
                color.style.setProperty("--c2", "purple");
                color.style.setProperty("--m2", "black");
                SetTheme(3);
                break;
            case 3:
                color.style.setProperty("--c1", "rgb(80, 64, 109)");
                color.style.setProperty("--c2", "rgb(69, 162, 95)");
                color.style.setProperty("--m2", "rgb(80, 64, 109)");
                SetTheme(0);
                break;
        }
    }
    function ShowAction(Event){
        const s = Event.target.style;
        if (listing()==0){
            SetListing(1);
            s.transform = "rotate(90deg)";
        }
        else if (listing()==1){
            SetListing(0);
            s.transform = "rotate(0deg)";
        }
    }

    // ▼ ►
    return(
        <div class="music">
            <div class="songs">
                <div class="show">
                    <div id="loader" class="loading">
                        <div></div>
                    </div>
                    <div class="theme" onclick={themer}>
                        <div></div>
                        <div></div>
                    </div>
                    <Icon onclick={ShowAction} path={bars_3}/>
                </div>
                <ol class={listing()==0 ? "none" : "containerwin"}>
                    <For each={musics()}>
                        {
                            (song)=> <li class="win" onclick={[play, song.s]}>
                                {song.c ? <img src={song.c} /> : <Icon path={musicalNote}/>}
                                <p>{song.s.split("\\").pop()}</p>
                            </li>
                        }
                    </For>
                </ol>
            </div>
            <Player al={current() ? current() : ""} name={currentsong} next={next_s} back={back_s} ml={musics}/>
        </div>
    )
}

export default Music