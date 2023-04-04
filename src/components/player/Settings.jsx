import { Icon } from "solid-heroicons";
import { clipboardDocumentCheck, xMark } from "solid-heroicons/solid-mini";
import { createSignal, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api";

function Settings (){
    const [config, SetConfig] = createSignal({});
    const [colors, SetColors] = createSignal({"c1":"","c2":"","m1":"","m2":"", "active":true});

    onMount(()=>{
        invoke("config_load").catch(e=>console.log(e))
        .then(raw=>{
            const config = JSON.parse(raw);
            SetConfig(config);
            SetColors({"c1":config.c1,"c2":config.c2,"m1":config.m1,"m2":config.m2,"active":true});
        })
    })

    function saveChanges(){
        SetConfig(
            prev=>{
                return {...prev, ...colors()}
            }
        );
        invoke("config_save", {ng:JSON.stringify(config())});
        location.reload();
    }

    function changeColorController(event){
        if (event.target.name == "active"){
            SetColors(prev=>{
                return {...prev, "active":event.target.checked}
            })
        }else{
            SetColors(prev=>{
                return {...prev, [event.target.name]:event.target.value}
            })
        }
    };

    return(
        <div id="settings">
            <h1>Settings</h1>
            <div class="colors">
                <h2>Colors: </h2>
                <div>
                    <div>
                        <label htmlFor="idcolor1">C1</label>
                        <input type="color" name="c1" id="idcolor1" value={config().c1} onChange={changeColorController}/>
                    </div>
                    <div>
                        <label htmlFor="idcolor2">C2</label>
                        <input type="color" name="c2" id="idcolor2" value={config().c2} onChange={changeColorController}/>
                    </div>
                    <div>
                        <label htmlFor="idcolor3">M1</label>
                        <input type="color" name="m1" id="idcolor3" value={config().m1} onChange={changeColorController}/>
                    </div>
                    <div>
                        <label htmlFor="idcolor4">M2</label>
                        <input type="color" name="m2" id="idcolor4" value={config().m2} onChange={changeColorController}/>
                    </div>
                </div>
                <input type="checkbox" name="active" id="active" onChange={changeColorController} checked={config().active}/>
            </div>
            <div class="settings_controll">
                <Icon path={xMark} 
                onclick={()=>{document.getElementById("settings").style.display = "none"}}/>
                <Icon path={clipboardDocumentCheck} onclick={saveChanges}/>
            </div>
        </div>
    )
}
export default Settings