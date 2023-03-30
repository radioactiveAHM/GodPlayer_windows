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