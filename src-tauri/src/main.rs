#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// #[tauri::command]
// fn covering(){
    
// }
fn main() {
    cover_caching();
    tauri::Builder::default()
        // .invoke_handler(tauri::generate_handler![covering])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn cover_caching(){
    let temp = std::env::temp_dir().join("godplayer");
    let songdir = std::env::home_dir().unwrap().join("Music");

    // let temp = "C:/Users/AHM/AppData/Local/Temp/godplayer/";
    // let songdir = "C:/Users/AHM/Music";
    let mut songs_list:Vec<std::path::PathBuf> = Vec::new();
    let mut dirs:Vec<std::path::PathBuf> = Vec::new();

    for root_items in std::fs::read_dir(songdir).unwrap(){
        let tempr = root_items.unwrap();
        if !tempr.file_name().into_string().unwrap().contains(".mp3"){
            continue;
        }
        if tempr.file_type().unwrap().is_dir(){dirs.push(tempr.path())}
        else {songs_list.push(tempr.path())}
    }

    let mut dirs_temp:Vec<std::path::PathBuf> = Vec::new();
    while dirs.len() > 0 {
        for dir_items in &dirs{
            for items in std::fs::read_dir(dir_items).unwrap(){
                // println!("{:?}", items);
                let tempr = items.unwrap();
                if tempr.file_type().unwrap().is_dir(){
                    dirs_temp.push(tempr.path());
                }
                else {songs_list.push(tempr.path())}
            }
        }
        dirs.append(&mut dirs_temp);
        dirs.remove(0);
    }

    std::fs::create_dir(&temp).unwrap_or_else(|e|println!("--ignore path exist {}", e));
    for song_f in songs_list{
        let nameer = song_f.clone();
        let song = audiotags::Tag::new().read_from_path(song_f).unwrap();
        let cover = song.album_cover();
        match cover{
            std::option::Option::Some(p)=>{
                std::fs::write(&temp.join(
                    format!(
                        "{}.jpg", nameer.to_str().unwrap().split("\\").collect::<Vec<&str>>().pop().unwrap()
                        .split(".").collect::<Vec<&str>>()[0]
                    )

                ), p.data).unwrap();
            },
            std::option::Option::None=>continue
        }
    }
}