type Props = {
    src: string;
    caption: string;
}



export default function TiktokCard({ src }: Props){

    return(
        <div>
            <video src={src} autoPlay loop muted/>
        </div>
    )
}