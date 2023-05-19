#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
#![allow(deprecated)]

use id3::{Tag, TagLike};

#[derive(serde::Serialize)]
struct SongMeta{
    path:std::path::PathBuf,
    artist:String,
    title:String,
    genre:String,
    date:String,
    duration:u32,
    no:usize,
    lyric: Vec<String>,
    cover: std::path::PathBuf,
    modified: std::time::SystemTime
}
fn cover_ceck(p:std::path::PathBuf)->std::path::PathBuf{
    if p.exists(){
        p
    } else {
        std::path::PathBuf::new()
    }
}

#[allow(dead_code)]
#[derive(serde::Deserialize)]
struct AppConfig{
    dir: Vec<String>,
    active: bool,
    c1: String,
    c2: String,
    m1:String,
    m2:String
}
fn config_parse() -> Vec<String>{
    let file = std::fs::read_to_string("./Config.json").unwrap();
    let data_config:AppConfig = serde_json::from_str(file.as_str()).unwrap();
    data_config.dir
}

fn cover_caching() -> Vec<SongMeta>{

    // get dirs from config
    let user_dirs = config_parse();

    let songdir = {
        if user_dirs.len() > 0 {
            user_dirs
        }
        else {
            let p_to_s = std::env::home_dir().unwrap().join("Music").to_str().unwrap().to_string();
            vec![p_to_s]
        }
    };
    // temp folder
    let temp = std::env::temp_dir().join("godplayer");

    let mut songs_list:Vec<std::path::PathBuf> = Vec::new();
    let mut dirs:Vec<std::path::PathBuf> = Vec::new();

    for p in songdir{
        for root_items in std::fs::read_dir(p).unwrap(){
            let tempr = root_items.unwrap();
            if !tempr.file_name().into_string().unwrap().contains(".mp3") && !tempr.file_type().unwrap().is_dir(){
                continue;
            }
            if tempr.file_type().unwrap().is_dir(){dirs.push(tempr.path())}
            else {songs_list.push(tempr.path())}
        }
    }

    while dirs.len() > 0 {
        let mut dirs_temp:Vec<std::path::PathBuf> = Vec::new();
        for dir in &dirs{
            for item in std::fs::read_dir(dir).unwrap(){
                let each_item = item.unwrap();
                if !each_item.file_name().into_string().unwrap().contains(".mp3") && !each_item.file_type().unwrap().is_dir(){
                    continue;
                }else {
                    if each_item.file_type().unwrap().is_dir(){dirs_temp.push(each_item.path())}
                    else {songs_list.push(each_item.path())}
                }
            }
        }
        dirs = dirs_temp;
    }
    let mut config:Vec<SongMeta> = Vec::new();
    let mut couner:usize = 1;
    for song_f in songs_list{
        let nameer = song_f.clone();
        let song = Tag::read_from_path(&nameer);
        match song {
            id3::Result::Ok(s)=> {

                if &s.artist().unwrap_or("") == &"" && &s.title().unwrap_or("") == &""{
                    config.push(
                        SongMeta {
                            path: song_f.clone(),
                            artist: "".to_string(),
                            title: song_f.to_str().unwrap().split("\\").last().unwrap().to_string(),
                            genre: "".to_string(),
                            date: s.date_recorded().unwrap_or_default().to_string(),
                            duration: 0,
                            no: couner,
                            lyric: vec![String::from("")],
                            cover: cover_ceck(temp.join(
                                format!(
                                    "{}", &nameer.file_name().unwrap().to_str().unwrap().replace(".mp3", ".jpg")
                                )
                            )),
                            modified: std::fs::metadata(song_f).unwrap().modified().unwrap()
                    });
                } else {
                    config.push(
                        SongMeta {
                            path: song_f.clone(),
                            artist: s.artist().unwrap_or("").to_string(),
                            title: s.title().unwrap_or("").to_string(),
                            genre: s.genre().unwrap_or("").to_string(),
                            date: s.date_recorded().unwrap_or_default().to_string(),
                            duration: s.duration().unwrap_or(0),
                            no: couner,
                            lyric: s.lyrics().map(|ly| ly.to_string()).collect::<Vec<String>>(),
                            cover: cover_ceck(temp.join(
                                format!(
                                    "{}", &nameer.file_name().unwrap().to_str().unwrap().replace(".mp3", ".jpg")
                                )
                            )),
                            modified: std::fs::metadata(song_f).unwrap().modified().unwrap()
                    }
                );
                }
                    couner += 1;
                    // save pictures to temp folders
                    for pic in s.pictures(){
                        if temp.join(&nameer.file_name().unwrap().to_str().unwrap().replace(".mp3", ".jpg")).exists() {
                            continue
                        }
                        let reader = image::load_from_memory(&pic.data);
                        match reader {
                            Ok(ready)=>{
                                let resized = ready.resize(128, 128, image::imageops::Lanczos3);
                                    resized.save(&temp.join(
                                    format!(
                                        "{}", &nameer.file_name().unwrap().to_str().unwrap().replace(".mp3", ".jpg")
                                    ))
                                ).unwrap();
                            },
                            Err(_)=>{
                                std::fs::write(&temp.join(
                                    format!(
                                        "{}", &nameer.file_name().unwrap().to_str().unwrap().replace(".mp3", ".jpg")
                                    )), &pic.data).unwrap();
                            }
                        }
                        
                    }
            },
            id3::Result::Err(_)=> {
                config.push(
                    SongMeta {
                        path: song_f.clone(),
                        artist: "".to_string(),
                        title: song_f.to_str().unwrap().split("\\").last().unwrap().to_string(),
                        genre: "".to_string(),
                        date: String::new(),
                        duration: 0,
                        no: couner,
                        lyric: vec![String::from("")],
                        cover: cover_ceck(temp.join(
                            format!(
                                "{}", &nameer.file_name().unwrap().to_str().unwrap().replace(".mp3", ".jpg")
                            )
                        )),
                        modified: std::fs::metadata(song_f).unwrap().modified().unwrap()
                });
                couner += 1;
            }
        }
    }
    // songlist
    config
}

#[tauri::command]
async fn songlist()->Vec<SongMeta>{
    cover_caching()
}

#[tauri::command]
async fn config_load()->Result<String, String>{
    std::fs::read_to_string("./Config.json").map_err(|e| e.to_string())
}

#[tauri::command]
async fn config_save(ng:String){
    std::fs::write("./Config.json", ng).unwrap();
}

#[tauri::command]
async fn load_playlist()->Result<String, String>{
    let playlist_file = std::env::home_dir().unwrap().join("godplayer_playlist.json");
    std::fs::read_to_string(playlist_file).map_err(|e| e.to_string())
}
#[tauri::command]
async fn create_playlist(pl:String)->Result<() , String>{
    let playlist_file = std::env::home_dir().unwrap().join("godplayer_playlist.json");
    std::fs::write(playlist_file, pl).map_err(|e| e.to_string())
}
fn main() {

    // make temp dir
    std::fs::create_dir(
        std::env::temp_dir().join("godplayer")
    ).unwrap_or_else(|e|println!("--ignore path exist {}", e));

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![songlist, config_load, config_save, load_playlist, create_playlist])
        .register_uri_scheme_protocol("stream", |_app, req|{
            let uri = req.uri().trim()
            .split("stream://localhost/").last().unwrap();
            let music_path = urlencoding::decode(uri).unwrap().into_owned();
            let music = std::fs::read(music_path);
            match music {
                Ok(musicbuff)=>{
                    tauri::http::ResponseBuilder::new()
                    .header("Origin", "*")
                    .header("Connection", "Keep-Alive")
                    .header("Accept-Ranges", "bytes")
                    .header("Content-Length", musicbuff.len())
                    .mimetype("audio/mpeg")
                    .status(200)
                    .body(musicbuff)
                },
                Err(_)=>{
                    tauri::http::ResponseBuilder::new()
                    .header("Origin", "*")
                    .header("Connection", "Keep-Alive")
                    .mimetype("text/plain")
                    .status(200)
                    .body("Error".as_bytes().to_vec())
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}