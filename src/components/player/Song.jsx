import { Icon } from "solid-heroicons";
import { musicalNote} from "solid-heroicons/solid-mini";

function Music(income) {
    return (
    <li class="win" onclick={[income.play, income.song]} name={income.song.meta.no} id={"no"+income.song.meta.no}>
        <div class="cover_title">
            {income.song.c ? <img src={income.song.c} /> : <Icon path={musicalNote} />}
            <p class="artist">
                <span class="noV">{income.song.meta.no + ". "}</span>
                {income.song.meta.artist != ""
                    ? income.song.meta.artist + " - " + income.song.meta.title
                    : income.song.meta.title}
            </p>
        </div>
        {(income.song.meta.genre != "" || income.song.meta.year != 0) && (
        <div class="meta">
            {income.song.meta.genre != "" && <p class="genre">{income.song.meta.genre}</p>}
            <br />
            {income.song.meta.year != 0 && <p class="year">{income.song.meta.year}</p>}
        </div>
        )}
    </li>
    );
}

export default Music;
