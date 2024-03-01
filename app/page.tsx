"use client";

import Link from "next/link";
import styled from "styled-components";
import Image from "next/image";
import { MobileWidth } from "@/app/lib/constants";

export default function Home() {
    return (
        <HomeWrapper>
            <ImageWrapper>
                <ImageLink href="/music">
                    <Image
                        src="/vinyl-collage.jpg"
                        width={900}
                        height={450}
                        alt="Vinyl collage"
                    />
                    <ImageText>Music Reviews</ImageText>
                </ImageLink>
            </ImageWrapper>
            <ImageWrapper>
                <ImageLink href="/soccer">
                    <Image
                        src="/colombia-soccer.jpeg"
                        width={900}
                        height={450}
                        alt="Colombia soccer"
                    />
                    <ImageText>Soccer Stats</ImageText>
                </ImageLink>
            </ImageWrapper>
            <ImageWrapper>
                <ImageLink href="/photos">
                    <Image
                        src="/flagler-surfer.jpg"
                        width={900}
                        height={450}
                        alt="Flagler surfer"
                    />
                    <ImageText>Film Photos</ImageText>
                </ImageLink>
            </ImageWrapper>
            <ImageWrapper>
                <ImageLink href="/code">
                    <Image
                        src="/canva-code.png"
                        width={900}
                        height={450}
                        alt="Code"
                    />
                    <ImageText>Code Collection</ImageText>
                </ImageLink>
            </ImageWrapper>
        </HomeWrapper>
    );
}

const HomeWrapper = styled.div`
    margin-top: 110px;
`;

const ImageWrapper = styled.div`
    position: relative;
    margin-bottom: 20px;
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
