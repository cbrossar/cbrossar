"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Link from "next/link";
import { FaGithub, FaInstagram } from "react-icons/fa";
import { MobileWidth } from "@/app/lib/constants";

export default function Footer() {
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
        <FooterWrapper>
            <DateTimeDisplay>{formattedDateTime}</DateTimeDisplay>
            <SocialLinks>
                <SocialLink
                    href="https://github.com/cbrossar"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaGithub />
                </SocialLink>
                <SocialLink
                    href="https://www.instagram.com/coler.than.you"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaInstagram />
                </SocialLink>
            </SocialLinks>
        </FooterWrapper>
    );
}

const FooterWrapper = styled.footer`
    margin: 0 auto;
    padding: 20px;
    width: 100%;
    display: flex;
    justify-content: space-between;
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

const SocialLinks = styled.div`
    display: flex;
    gap: 15px;
`;

const SocialLink = styled(Link)`
    color: #333;
    font-size: 1.25rem;
    transition: color 0.2s ease-in-out;

    &:hover {
        color: #666;
    }

    @media (max-width: ${MobileWidth}) {
        font-size: 1rem;
    }
`;
