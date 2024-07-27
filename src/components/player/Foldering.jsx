import { createSignal, onMount } from "solid-js";
import {createStore} from "solid-js/store"
import { invoke } from "@tauri-apps/api";

import { Icon } from "solid-heroicons";
import { xMark } from "solid-heroicons/solid-mini";

function Foldering(){
    const [folders, setFolders] = createSignal([]);
    const [Config, SetConfig] = createSignal({});
    const [controller , Setcontroller] = createStore({value:""});

    // new
    // elements
    let foldering;

    onMount(()=>{
        invoke("config_load").catch(e=>console.log(e))
        .then(raw=>{
            const config = JSON.parse(raw);
            SetConfig(config);
            setFolders(config.dir)
        })
    })

    async function pathadd(){
        if (controller.value !== ""){
            const t = Config().dir;
            t.push(controller.value);
            setFolders(t);
            SetConfig({
                ...Config(),
                dir:t
            });

            await invoke("config_save", {ng:JSON.stringify(Config())})
            location.reload();
        }
    }

    function changeAction(event){
        Setcontroller({value:event.target.value});
    }

    async function removepath(event){
        const path = event.target.parentElement.children[0].textContent;
        // Setcontroller
        const temp = [];
        for (const p of Config().dir){
            if (p!==path){
                temp.push(p);
            }
        }

        SetConfig({
            ...Config(),
            dir:temp
        });

        await invoke("config_save", {ng:JSON.stringify(Config())})
        location.reload();
    }

    return(
        <div id="foldering" ref={foldering}>
            <div class="exitfolder" 
            onClick={()=>{foldering.style.display = "none"}}
            ><div></div></div>
            <div class="ds">
                <For each={folders()}>
                    {(d)=> (
                        <div class="folder">
                        <p>{d}</p>
                        <Icon path={xMark} onclick={removepath}/>
                        </div>
                    )}
                </For>
            </div>
            <div class="down">
                <input class="pathpicker" type="text" onChange={changeAction}/>
                <Icon onclick={pathadd} path={xMark}/>
            </div>
        </div>
    )
}

export default Foldering;