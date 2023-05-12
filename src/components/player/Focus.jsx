export default function Focus(props){
    // elements
    let focus;
    return(
        <div ref={focus} class="focus">
            <pre>
                {(props.songraw() && props.songraw().meta.lyric[0]) ? props.songraw().meta.lyric[0] : "No Lyric"}
            </pre>
        </div>
    )
}