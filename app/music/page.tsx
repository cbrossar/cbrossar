"use client";

import styled from "styled-components";
import Image from "next/image";
import Link from "next/link";
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
                        <ImageWrapper>
                            <ImageLink href="/">
                                <Image
                                    src={"/" + album.image_url}
                                    width={500}
                                    height={500}
                                    alt="album"
                                />
                                <ImageText>
                                    <Circle>
                                        <Rating>{album.rating}</Rating>
                                    </Circle>
                                </ImageText>
                            </ImageLink>
                        </ImageWrapper>
                        <p>{album.artist}</p>
                        <p>{album.name}</p>
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

const ImageWrapper = styled.div`
    position: relative;
`;

const ImageText = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition:
        background-color 0.2s ease-in-out,
        opacity 0.2s ease-in-out;
    font-size: 1.5rem;
    font-weight: 900;
    text-transform: uppercase;
    color: white;
    opacity: 0;
    z-index: 2;

    @media (max-width: ${MobileWidth}) {
        opacity: 1;
        font-size: 1.125rem;
    }
`;

const ImageLink = styled(Link)`
    &:hover {
        opacity: 0.5;
        ${ImageText} {
            opacity: 1;
        }
    }
`;

const Circle = styled.div`
    position: relative;
    margin-bottom: 1rem;
    border: 3px solid white;
    border-radius: 50%;
    padding-bottom: 1rem;
    width: 70px;
    height: 70px;
    text-align: center;
    color: white;
`;

const Rating = styled.div`
    display: block;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    color: white;
    --type-token: globalEditorial.numerical-large;
    text-transform: none;
    font-family: Walfork, helvetica, sans-serif;
    font-feature-settings: normal;
    font-style: normal;
    letter-spacing: normal;
    line-break: auto;
    line-height: 1em;
    font-size: 30px;
    font-weight: 400;
    overflow-wrap: normal;
`;
