// icons
import { Icon } from "solid-heroicons";
import {chevronLeft, chevronRight} from "solid-heroicons/solid-mini"

function Player(income){
    let ex;

    function pbtn_f(pp){
        const plpo = document.getElementById("pl_po");
        const dancer = document.getElementById("dan");
        if(pp){
            dancer.style.animationPlayState="paused"
            plpo.style.animationPlayState = "paused";
            plpo.children[0].style.animationName = "pl_1c";
            plpo.children[1].style.animationName = "pl_2c";
            plpo.children[2].style.animationName = "pl_3c";
            plpo.style.animationPlayState = "running";
        }else{
            dancer.style.animationPlayState="running"
            plpo.style.animationPlayState = "paused";
            plpo.children[0].style.animationName = "po_1c";
            plpo.children[1].style.animationName = "po_2c";
            plpo.children[2].style.animationName = "po_3c";
            plpo.style.animationPlayState = "running";
        }
    }

    function pbtnAction(){
        // NEW
        const ap = document.getElementById("ap");
        if (ap.paused){
            ap.play();
        }else{
            ap.pause();
        }
    }

    function setSongBackGroundColor(){
        const no = income.no();
        const li_el = document.querySelector(`[name="${no}"]`);
        // li_el.style.background = "var(--c1)";

        if (ex == undefined){
            ex = [li_el, li_el.style.background];
            li_el.style.background = "var(--c1)";
        }else{
            ex[0].style.background = ex[1];
            ex = [li_el, li_el.style.background];
            li_el.style.background = "var(--c1)";
        }
    }

    function playerAction(){
        const bar = document.getElementById("bar");
        const dur = document.getElementById("dur");
        const playing = document.getElementById("ap");

        let Tsec = (playing.currentTime).toFixed(0);
        let Tmin = Math.floor(Tsec / 60);
        let sec = Tsec % 60;
        let min = Tmin % 60;
        let fsec = (sec/100).toPrecision(2);
        let fmin = (min/100).toPrecision(2)
        dur.innerText = (fmin[2] || "0")+(fmin[3] || "0")+":"+(fsec[2] || "0")+(fsec[3] || "0");
        bar.style.width = ((playing.currentTime / playing.duration)*100).toPrecision(3)+"%";
    }
    function timebarAction(Event){
        const playing = document.getElementById("ap");
        const p = (Event.offsetX / Event.target.clientWidth)*100;
        playing.currentTime = Math.floor((playing.duration * p) / 100);
    }
    function endedAction(){
        income.next()
    }


    function next_s(){
        income.back();
    }
    function back_s(){
        income.next();
    }

    function playAction(){
        setSongBackGroundColor();
        pbtn_f(false)
    }
    function pauseAction(){
        pbtn_f(true)
    }

    function shuffling(){
        const shuffle = document.getElementById("shuffle_id");
        if (shuffle.getAttribute("name") == "disabled"){
            shuffle.setAttribute("name", "enabled");
            shuffle.style.border = "2px solid var(--m2)";
        } else {
            shuffle.setAttribute("name", "disabled");
            shuffle.style.border = "none";
        }
    }

    return(
        <div class="player">
        <audio src={income.al} id="ap" 
        onPlay={playAction} onEnded={endedAction} onTimeUpdate={playerAction} onPause={pauseAction}
        ></audio>
        <div id="pbtn" onclick={pbtnAction}>
            <div id="dan" class="dancer"></div>
            <div id="pl_po">
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        <div class="shuffle" name="disabled" id="shuffle_id" onClick={shuffling}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="var(--m2)" viewBox="0 0 256 256"><path d="M237.66,178.34a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32-11.32L212.69,192H200.94a72.12,72.12,0,0,1-58.59-30.15l-41.72-58.4A56.1,56.1,0,0,0,55.06,80H32a8,8,0,0,1,0-16H55.06a72.12,72.12,0,0,1,58.59,30.15l41.72,58.4A56.1,56.1,0,0,0,200.94,176h11.75l-10.35-10.34a8,8,0,0,1,11.32-11.32ZM143,107a8,8,0,0,0,11.16-1.86l1.2-1.67A56.1,56.1,0,0,1,200.94,80h11.75L202.34,90.34a8,8,0,0,0,11.32,11.32l24-24a8,8,0,0,0,0-11.32l-24-24a8,8,0,0,0-11.32,11.32L212.69,64H200.94a72.12,72.12,0,0,0-58.59,30.15l-1.2,1.67A8,8,0,0,0,143,107Zm-30,42a8,8,0,0,0-11.16,1.86l-1.2,1.67A56.1,56.1,0,0,1,55.06,176H32a8,8,0,0,0,0,16H55.06a72.12,72.12,0,0,0,58.59-30.15l1.2-1.67A8,8,0,0,0,113,149Z"></path></svg>
        </div>
        <div class="back_for" onclick={next_s}>
            <Icon path={chevronLeft}/>
        </div>
        <div id="timebar" onclick={timebarAction}><div id="bar"></div><div id="dur">00:00</div></div>
        <div class="back_for" onclick={back_s} tabIndex="0">
            <Icon path={chevronRight}/>
        </div>
        </div>
    )
}

export default Player