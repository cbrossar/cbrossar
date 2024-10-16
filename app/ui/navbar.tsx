"use client";

import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";
import { Colors, MobileWidth } from "@/app/lib/constants";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [isFlipping, setIsFlipping] = useState(false);
    const [isUpsideDown, setIsUpsideDown] = useState(false);

    const handleCoinFlip = () => {
        setIsFlipping(true);

        const newFlipSide = Math.random() < 0.5;

        // Randomly set isUpsideDown to true or false with 50% probability
        setIsUpsideDown(newFlipSide);

        // 1 revolution is 1000ms
        let flipTime = Math.floor(Math.random() * 3 + 2) * 1000;

        if (isUpsideDown) {
            flipTime += 500;
        }

        setTimeout(() => {
            setIsFlipping(false);
        }, flipTime);
    };

    return (
        <Header>
            <NavbarWrapper>
                <MenuButton onClick={toggleMenu} $isopen={isMenuOpen}>
                    <span />
                    <span />
                </MenuButton>
                <NavLink href="/music">Music</NavLink>
                <NavLink href="/soccer">Soccer</NavLink>
                <HomeLink href="/" onClick={handleCoinFlip}>
                    <CoinFlipWrapper
                        $isFlipping={isFlipping}
                        $isUpsideDown={isUpsideDown}
                    >
                        Cole
                    </CoinFlipWrapper>
                </HomeLink>
                <NavLink href="/code">Code</NavLink>
                <NavLink href="/photos">Photos</NavLink>
            </NavbarWrapper>
            <SideMenu $isopen={isMenuOpen}>
                <CloseButton onClick={toggleMenu}>✕</CloseButton>
                <SideNavLink href="/" onClick={toggleMenu}>
                    Home
                </SideNavLink>
                <SideNavLink href="/music" onClick={toggleMenu}>
                    Music
                </SideNavLink>
                <SideNavLink href="/soccer" onClick={toggleMenu}>
                    Soccer
                </SideNavLink>
                <SideNavLink href="/fantasy-prem/players" onClick={toggleMenu}>
                    Fantasy Players
                </SideNavLink>
                <SideNavLink href="/fantasy-prem/team" onClick={toggleMenu}>
                    Fantasy Team
                </SideNavLink>
                <SideNavLink href="/ltrain" onClick={toggleMenu}>
                    L Train
                </SideNavLink>
                <SideNavLink href="/wine" onClick={toggleMenu}>
                    Wine
                </SideNavLink>
                <SideNavLink href="/code" onClick={toggleMenu}>
                    Code
                </SideNavLink>
                <SideNavLink href="/photos" onClick={toggleMenu}>
                    Photos
                </SideNavLink>
            </SideMenu>
        </Header>
    );
}

const Header = styled.header`
    padding: 30px 20px;
    background-color: #fff;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1;
`;

const NavbarWrapper = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
    max-width: 900px;
    margin: 0 auto;

    @media (max-width: ${MobileWidth}) {
        justify-content: space-between;
        width: 100%;
    }
`;

const NavLink = styled(Link)`
    font-size: 1.5rem;
    font-weight: 900;
    padding-left: 0.3125rem;
    padding-right: 0.3125rem;
    text-transform: uppercase;
    text-decoration: none;

    @media (max-width: ${MobileWidth}) {
        display: none;
    }

    @media (min-width: ${MobileWidth}) {
        &:hover {
            background-color: black;
            color: ${Colors.yellow};
        }
    }
`;

const HomeLink = styled(NavLink)`
    font-size: 2.5rem;
    background-color: ${Colors.yellow};
    padding: 0px 16px;
    align-items: center;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 1px;

    @media (max-width: ${MobileWidth}) {
        margin: 0 auto;
        position: relative;
    }
`;

const MenuButton = styled.div<{ $isopen: boolean }>`
    display: none;
    cursor: pointer;
    position: absolute;
    width: 30px;
    height: 15px;

    @media (max-width: ${MobileWidth}) {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    span {
        width: 100%;
        height: 4px;
        background-color: ${Colors.black};
        transition: all 0.3s;

        &:nth-child(1) {
            transform: ${({ $isopen }) =>
                $isopen ? "rotate(45deg) translateY(10px)" : "none"};
        }

        &:nth-child(2) {
            transform: ${({ $isopen }) =>
                $isopen ? "rotate(-45deg) translateY(-10px)" : "none"};
        }
    }
`;

const SideMenu = styled.div<{ $isopen: boolean }>`
    position: fixed;
    top: 0;
    left: ${({ $isopen }) => ($isopen ? "0" : "-100%")};
    width: 100%;
    height: 100%;
    background-color: ${Colors.white};
    padding: 90px 20px;
    transition: left 0.3s;
    z-index: 3;
    display: flex;
    flex-direction: column;
`;

const SideNavLink = styled(Link)`
    display: block;
    font-size: 1.125rem;
    font-weight: 900;
    color: ${Colors.black};
    text-transform: uppercase;
    text-decoration: none;
    margin-bottom: 15px;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 20px;
    left: 20px;
    background: none;
    border: none;
    color: ${Colors.black};
    font-size: 2rem;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
        color: ${Colors.yellow};
    }
`;

const CoinFlipWrapper = styled.div<{
    $isFlipping: boolean;
    $isUpsideDown: boolean;
}>`
    transform: ${({ $isFlipping, $isUpsideDown }) =>
        $isFlipping
            ? "rotate(360deg)"
            : $isUpsideDown
              ? "rotate(180deg)"
              : "rotate(0deg)"};
    transition: transform 1s linear;
    animation: ${({ $isFlipping }) =>
        $isFlipping ? "spin 1s linear infinite" : "none"};

    @keyframes spin {
        from {
            transform: rotate(
                ${({ $isUpsideDown }) => ($isUpsideDown ? "180deg" : "0deg")}
            );
        }
        to {
            transform: rotate(
                ${({ $isUpsideDown }) => ($isUpsideDown ? "540deg" : "360deg")}
            );
        }
    }
`;
