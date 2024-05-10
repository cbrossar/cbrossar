"use client";

import styled from "styled-components";
import Image from "next/image";

export default function Page() {

    const photos = [
        "got-slushed.jpeg",
        "bottles.jpeg",
        "casino.jpeg",
        "goodboy.jpeg",
        "londoneye.jpeg",
        "strawberries.jpeg",
        "bigtree.jpeg",
        "rondo.jpeg",
        "rue.jpeg",
        "the-square.jpeg",
        "creek.jpeg",
        "penny-farthing.jpeg",
        "rose-du-pont.jpeg",
        "spices.jpeg",
        "street-lamp.jpeg",
    ];

    return (
        <PhotosWrapper>  
            {photos.map((photo, i) => (
                <ImageWrapper key={i}>
                    <Image
                        src={`/photos/${photo}`}
                        width={900}
                        height={450}
                        alt={`Photo ${i}`}
                    />
                </ImageWrapper>
            ))}
        </PhotosWrapper>
    );
}

const ImageWrapper = styled.div`
    position: relative;
    margin-bottom: 20px;
`;


const PhotosWrapper = styled.div``;