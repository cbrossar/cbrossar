"use client";

import styled from "styled-components";
import Image from "next/image";
import { fetchAlbumReviews } from "@/app/lib/data";
import { MobileWidth } from "@/app/lib/constants";

export default function Page() {
    const albumReviews = fetchAlbumReviews();
    console.log(albumReviews);

    return (
        <MusicWrapper>
            <Grid>
                {albumReviews.map((album) => (
                    <AlbumCard key={album.name}>
                        <Image
                            src={"/" + album.image_url}
                            width={500}
                            height={500}
                            alt="album"
                        />
                        <p>{album.artist}</p>
                        <p>{album.name}</p>
                        <p>{album.rating}/10</p>
                    </AlbumCard>
                ))}
            </Grid>
        </MusicWrapper>
    );
}

const MusicWrapper = styled.div``;

const Grid = styled.div`
    grid-column-gap: 1.25rem;
    grid-row-gap: 1.25rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin: 1.25rem 0;
    padding: 0;
    grid-template-columns: repeat(5, 1fr);

    @media (max-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
    }

    @media (max-width: ${MobileWidth}) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const AlbumCard = styled.div``;
