"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styled from "styled-components";
import Image from "next/image";
import { MobileWidth } from "@/app/lib/constants";

export default function Home() {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDateTime = dateTime
        .toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
        .replace(",", "")
        .replace(/\//g, ".");

    return (
        <HomeWrapper>
            <ImageWrapper>
                <ImageLink href="/music">
                    <Image
                        src="/vinyl-collage.jpg"
                        width={900}
                        height={450}
                        alt="Vinyl collage"
                        priority
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
            <FooterWrapper>
                <DateTimeDisplay>{formattedDateTime}</DateTimeDisplay>
            </FooterWrapper>
        </HomeWrapper>
    );
}

const HomeWrapper = styled.div``;

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
    @media (min-width: ${MobileWidth}) {
        &:hover {
            opacity: 0.5;
            ${ImageText} {
                opacity: 1;
            }
        }
    }

    @media (max-width: ${MobileWidth}) {
        &:active {
            opacity: 0.5;
            ${ImageText} {
                opacity: 1;
            }
        }
    }
`;

const FooterWrapper = styled.footer`
    margin: 0 auto;
    padding: 20px;
    width: 100%;
    justify-content: center;
    align-items: center;
    max-width: 900px;
`;

const DateTimeDisplay = styled.div`
    font-family:
        custom,
        Univers,
        Helvetica Neue,
        Helvetica,
        Arial,
        sans-serif;
    font-size: 1rem;
    text-align: center;
    text-transform: uppercase;
    line-height: 1;
    word-spacing: 4px;

    @media (max-width: ${MobileWidth}) {
        font-size: 0.875rem;
    }
`;
