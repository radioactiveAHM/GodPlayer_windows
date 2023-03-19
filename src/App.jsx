import Music from "./components/Music";
import Foldering from "./components/player/Foldering";
import Settings from "./components/player/Settings";
import { invoke } from "@tauri-apps/api";
function App() {

  invoke("config_load").catch(e=>console.log(e))
  .then(raw=>{
    const config = JSON.parse(raw);
    if (config.active){
      const color = document.querySelector(":root");
      color.style.setProperty("--c1", config.c1);
      color.style.setProperty("--c2", config.c2);
      color.style.setProperty("--m2", config.m2);
      color.style.setProperty("--m1", config.m1);
    }
  })

  return (
    <div>
      <Settings/>
      <Foldering/>
      <Music/>
    </div>
  )
}

export default App;
