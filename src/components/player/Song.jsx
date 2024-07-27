import { Icon } from "solid-heroicons";
import { musicalNote } from "solid-heroicons/solid-mini";
import { onMount } from "solid-js";

function Music(income) {
    let li_s;
    onMount(()=>{
        income.ob.observe(li_s)
    });
    let bg = "";
    if (income.count() % 2 !== 0){
        bg = "rgba(0,0,0,0.2)"
    }
    return (
    <li ref={li_s} class="win" onclick={[income.play, income.song]} name={income.song.meta.no} id={"no"+income.song.meta.no} style={`background: ${bg};`}>
        <div class="cover_title">
            {income.song.c!=="https://stream.localhost/" ? <img width={80} height={80} src={income.song.c} /> : <Icon path={musicalNote} />}
            <p class="artist">
                <span class="noV">{income.song.meta.no + ". "}</span>
                {income.song.meta.artist !== ""
                    ? income.song.meta.artist + " - " + income.song.meta.title
                    : income.song.meta.title}
            </p>
        </div>
        {(income.song.meta.genre !== "" || income.song.meta.year !== 0) && (
        <div class="meta">
            {income.song.meta.genre !== "" && <p class="genre">{income.song.meta.genre}</p>}
            <br />
            {income.song.meta.year !== 0 && <p class="year">{income.song.meta.year}</p>}
        </div>
        )}
    </li>
    );
}

export default Music;
