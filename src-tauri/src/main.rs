#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{path::PathBuf, sync::{Arc, Mutex}};

use id3::{Tag, TagLike};
use tauri::api::path::home_dir;

#[derive(serde::Serialize, Clone)]
struct SongMeta {
    path: std::path::PathBuf,
    artist: String,
    title: String,
    genre: String,
    date: String,
    duration: u32,
    no: usize,
    lyric: Vec<String>,
    cover: std::path::PathBuf,
    modified: std::time::SystemTime,
}
fn cover_ceck(p: std::path::PathBuf) -> std::path::PathBuf {
    if p.exists() {
        p
    } else {
        std::path::PathBuf::new()
    }
}

#[allow(dead_code)]
#[derive(serde::Deserialize)]
struct AppConfig {
    dir: Vec<String>,
    active: bool,
    c1: String,
    c2: String,
    m1: String,
    m2: String,
}
fn config_parse() -> Vec<String> {
    let file = std::fs::read_to_string(home_dir().unwrap().join("Config.json")).unwrap();
    let data_config: AppConfig = serde_json::from_str(file.as_str()).unwrap();
    data_config.dir
}

fn cover_caching() -> Vec<SongMeta> {
    // get dirs from config
    let user_dirs = config_parse();

    let songdir = {
        if user_dirs.len() > 0 {
            user_dirs
        } else {
            let p_to_s = home_dir()
                .unwrap()
                .join("Music")
                .to_str()
                .unwrap()
                .to_string();
            vec![p_to_s]
        }
    };
    // temp folder
    let temp = std::env::temp_dir().join("godplayer");

    let mut songs_list: Vec<std::path::PathBuf> = Vec::new();
    let mut dirs: Vec<std::path::PathBuf> = Vec::new();

    for p in songdir {
        for root_items in std::fs::read_dir(p).unwrap() {
            let tempr = root_items.unwrap();
            if !tempr.file_name().into_string().unwrap().contains(".mp3")
                && !tempr.file_type().unwrap().is_dir()
            {
                continue;
            }
            if tempr.file_type().unwrap().is_dir() {
                dirs.push(tempr.path())
            } else {
                songs_list.push(tempr.path())
            }
        }
    }

    while dirs.len() > 0 {
        let mut dirs_temp: Vec<std::path::PathBuf> = Vec::new();
        for dir in &dirs {
            for item in std::fs::read_dir(dir).unwrap() {
                let each_item = item.unwrap();
                if !each_item
                    .file_name()
                    .into_string()
                    .unwrap()
                    .contains(".mp3")
                    && !each_item.file_type().unwrap().is_dir()
                {
                    continue;
                } else {
                    if each_item.file_type().unwrap().is_dir() {
                        dirs_temp.push(each_item.path())
                    } else {
                        songs_list.push(each_item.path())
                    }
                }
            }
        }
        dirs = dirs_temp;
    }

    if let Ok(cpu) = std::thread::available_parallelism() {
        let arc_songs_list = Arc::new(songs_list);
        let config: Arc<Mutex<Vec<SongMeta>>> = Arc::new(Mutex::new(Vec::new()));
        let couner = Arc::new(Mutex::new(1));
        let mut handlers = Vec::new();
        let share = arc_songs_list.len()/cpu.get();
        for thread_n in 0..cpu.get() {
            let arc_songs_list = arc_songs_list.clone();
            let config = config.clone();
            let couner = couner.clone();
            let temp = temp.clone();
            handlers.push(
                std::thread::spawn(move||{
                    let songs_list = {
                        if thread_n+1==cpu.get(){
                            &arc_songs_list[(share*thread_n)..]
                        }else {
                            &arc_songs_list[(share*thread_n)..(share*(thread_n+1))]
                        }
                    };
                    for song_f in songs_list{
                        let nameer = song_f.clone();
                        let cover_name = nameer.file_name().unwrap().to_str().unwrap().replace(".mp3", ".jpg");
                        if let Ok(s) = Tag::read_from_path(&nameer) {
                            config.lock().unwrap().push(SongMeta {
                                path: song_f.clone(),
                                artist: s.artist().unwrap_or("").to_string(),
                                title: s
                                    .title()
                                    .unwrap_or(&song_f.to_str().unwrap().split("\\").last().unwrap())
                                    .to_string(),
                                genre: s.genre().unwrap_or("").to_string(),
                                date: s.date_recorded().unwrap_or_default().to_string(),
                                duration: s.duration().unwrap_or_default(),
                                no: *couner.lock().unwrap(),
                                lyric: s.lyrics().map(|ly| ly.to_string()).collect::<Vec<String>>(),
                                cover: cover_ceck(temp.join(format!("{}", &cover_name))),
                                modified: std::fs::metadata(&song_f).unwrap().created().unwrap(),
                            });
                            *couner.lock().unwrap() += 1;
                            // save pictures to temp folders
                            for pic in s.pictures() {
                                if !temp.join(&cover_name).exists() {
                                    match image::load_from_memory(&pic.data) {
                                        Ok(ready) => {
                                            let resized = ready.resize(128, 128, image::imageops::Nearest);
                                            resized.save(&temp.join(format!("{}", cover_name))).unwrap();
                                        }
                                        Err(_) => (),
                                    }
                                }
                            }
                        }
                    }
                })
            )
        }
        for handler in handlers {
            handler.join().unwrap();
        }
        let c = config.lock().unwrap().clone();
        c
    } else {
        let mut config: Vec<SongMeta> = Vec::new();
        let mut couner: usize = 1;
        for song_f in songs_list {
            let nameer = song_f.clone();
            let cover_name = nameer.file_name().unwrap().to_str().unwrap().replace(".mp3", ".jpg");
            if let Ok(s) = Tag::read_from_path(&nameer) {
                config.push(SongMeta {
                    path: song_f.clone(),
                    artist: s.artist().unwrap_or("").to_string(),
                    title: s
                        .title()
                        .unwrap_or(&song_f.to_str().unwrap().split("\\").last().unwrap())
                        .to_string(),
                    genre: s.genre().unwrap_or("").to_string(),
                    date: s.date_recorded().unwrap_or_default().to_string(),
                    duration: s.duration().unwrap_or_default(),
                    no: couner,
                    lyric: s.lyrics().map(|ly| ly.to_string()).collect::<Vec<String>>(),
                    cover: cover_ceck(temp.join(format!("{}", &cover_name))),
                    modified: std::fs::metadata(&song_f).unwrap().created().unwrap(),
                });
                couner += 1;
                // save pictures to temp folders
                for pic in s.pictures() {
                    if !temp.join(&cover_name).exists() {
                        match image::load_from_memory(&pic.data) {
                            Ok(ready) => {
                                let resized = ready.resize(128, 128, image::imageops::Nearest);
                                resized.save(&temp.join(format!("{}", cover_name))).unwrap();
                            }
                            Err(_) => (),
                        }
                    }
                }
            }
        }
        config
    }
}

#[tauri::command]
async fn songlist() -> Vec<SongMeta> {
    cover_caching()
}

#[tauri::command]
async fn config_load() -> Result<String, String> {
    std::fs::read_to_string(home_dir().unwrap().join("Config.json")).map_err(|e| e.to_string())
}

#[tauri::command]
async fn config_save(ng: String) {
    std::fs::write(home_dir().unwrap().join("Config.json"), ng).unwrap();
}

#[tauri::command]
async fn load_playlist() -> Result<String, String> {
    let playlist_file = home_dir().unwrap().join("godplayer_playlist.json");
    std::fs::read_to_string(playlist_file).map_err(|e| e.to_string())
}
#[tauri::command]
async fn create_playlist(pl: String) -> Result<(), String> {
    let playlist_file = home_dir().unwrap().join("godplayer_playlist.json");
    std::fs::write(playlist_file, pl).map_err(|e| e.to_string())
}
fn main() {
    // create godplayer in temp dir
    std::fs::create_dir(std::env::temp_dir().join("godplayer"))
        .unwrap_or_else(|e| println!("--ignore path exist {}", e));

    // create config file if not exist
    if !PathBuf::from(home_dir().unwrap().join("Config.json")).exists() {
        std::fs::write(
            home_dir().unwrap().join("Config.json"),
            "{'dir':[],'active':false,'c1':'#299e9c','c2':'#bcab38','m1':'#29a6db','m2':'#1bb14f','t':'#000','ht':'rgba(0,0,0,0.4)'}".replace("'", '"'.to_string().as_str())
        ).unwrap();
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            songlist,
            config_load,
            config_save,
            load_playlist,
            create_playlist
        ])
        .register_uri_scheme_protocol("stream", |_app, req| {
            let uri = req
                .uri()
                .trim()
                .split("stream://localhost/")
                .last()
                .unwrap();
            let music_path = urlencoding::decode(uri).unwrap().into_owned();
            let music = std::fs::read(music_path);
            match music {
                Ok(musicbuff) => tauri::http::ResponseBuilder::new()
                    .header("Origin", "*")
                    .header("Connection", "Keep-Alive")
                    .header("Accept-Ranges", "bytes")
                    .header("Content-Length", musicbuff.len())
                    .mimetype("audio/mpeg")
                    .status(200)
                    .body(musicbuff),
                Err(_) => tauri::http::ResponseBuilder::new()
                    .header("Origin", "*")
                    .header("Connection", "Keep-Alive")
                    .mimetype("text/plain")
                    .status(200)
                    .body("Error".as_bytes().to_vec()),
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
