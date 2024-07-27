import { Icon } from "solid-heroicons";
import { folder, cog_6Tooth } from "solid-heroicons/solid-mini";
import { createSignal } from "solid-js";

function Show(income) {
    const [theme, SetTheme] = createSignal(0);

    function sf(){
        const f = document.getElementById("foldering");
        if (f.style.display === "none" || f.style.display === ""){
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
                color.style.setProperty("--t", "#000");
                color.style.setProperty("--ht", "rgba(0, 0, 0, 0.4)");
                SetTheme(1);
                break;
            case 1:
                color.style.setProperty("--c1", "#a393eb");
                color.style.setProperty("--c2", "#5e63b6");
                color.style.setProperty("--m1", "rgba(255, 255, 255, 0.4)");
                color.style.setProperty("--m2", "#f5c7f7");
                color.style.setProperty("--t", "#fff");
                color.style.setProperty("--ht", "rgba(255, 255, 255, 0.6)");
                SetTheme(2);
                break;
            case 2:
                color.style.setProperty("--c1", "#b56576");
                color.style.setProperty("--c2", "#6d597a");
                color.style.setProperty("--m1", "rgba(255, 255, 255, 0.4)");
                color.style.setProperty("--m2", "black");
                color.style.setProperty("--t", "#000");
                color.style.setProperty("--ht", "rgba(0, 0, 0, 0.4)");
                SetTheme(3);
                break;
            case 3:
                color.style.setProperty("--c1", "#714a9c");
                color.style.setProperty("--c2", "#648d86");
                color.style.setProperty("--m1", "#876f9d");
                color.style.setProperty("--m2", "#76b39d");
                color.style.setProperty("--t", "#000");
                color.style.setProperty("--ht", "rgba(0, 0, 0, 0.4)");
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
            <Icon id="setting_icon" path={cog_6Tooth}
            onclick={()=>{document.getElementById("settings").style.display = "block"}}/>
        </div>
    );
}

export default Show;
