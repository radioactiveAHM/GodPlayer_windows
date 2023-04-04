import { Icon } from "solid-heroicons";
import { folder, cog_6Tooth } from "solid-heroicons/solid-mini";
import { createSignal } from "solid-js";

function Show(income) {
    const [theme, SetTheme] = createSignal(0);

    function sf(){
        const f = document.getElementById("foldering");
        if (f.style.display == "none" || f.style.display == ""){
            f.style.display = "flex"
        }
        else{
            f.style.display = "none"
        }
    }

    function themer() {
        const color = document.querySelector(":root");
        switch (theme()) {
            case 0:
                color.style.setProperty("--c1", "#455d7a");
                color.style.setProperty("--c2", "#a2a8d3");
                color.style.setProperty("--m1", "rgba(255, 255, 255, 0.4)");
                color.style.setProperty("--m2", "#f95959");
                SetTheme(1);
                break;
            case 1:
                color.style.setProperty("--c1", "#a393eb");
                color.style.setProperty("--c2", "#5e63b6");
                color.style.setProperty("--m1", "rgba(255, 255, 255, 0.4)");
                color.style.setProperty("--m2", "#f5c7f7");
                SetTheme(2);
                break;
            case 2:
                color.style.setProperty("--c1", "#b56576");
                color.style.setProperty("--c2", "#6d597a");
                color.style.setProperty("--m1", "rgba(255, 255, 255, 0.4)");
                color.style.setProperty("--m2", "black");
                SetTheme(3);
                break;
            case 3:
                color.style.setProperty("--c1", "rgb(80, 64, 109)");
                color.style.setProperty("--c2", "rgb(69, 162, 95)");
                color.style.setProperty("--m1", "rgba(255, 255, 255, 0.4)");
                color.style.setProperty("--m2", "rgb(80, 64, 109)");
                SetTheme(0);
                break;
        }
    }

    return (
        <div class="show">
            <div class="mcount">{income.musics() && income.musics().length}</div>
            <div class="theme" onclick={themer}>
                <div></div>
                <div></div>
            </div>
            <Icon id="folder" onclick={sf} path={folder} />
            <Icon path={cog_6Tooth}
            onclick={()=>{document.getElementById("settings").style.display = "block"}}/>
        </div>
    );
}

export default Show;
