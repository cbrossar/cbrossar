"use client";

import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";
import { Colors, MobileWidth } from "@/app/lib/constants";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [rotationDegrees, setRotationDegrees] = useState(0);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleCoinFlip = () => {
        if (window.location.pathname !== "/") {
            return;
        }

        const rotations = Math.floor(Math.random() * 2) + 3; // Random rotations between 2 and 4
        const isUpsideDown = Math.random() < 0.5; // 50% chance to end upside down

        const totalDegrees = rotations * 360 + (isUpsideDown ? 180 : 0);

        setRotationDegrees((prevDegrees) => prevDegrees + totalDegrees);
    };

    return (
        <Header>
            <NavbarWrapper>
                <MenuButton onClick={toggleMenu} $isopen={isMenuOpen}>
                    <span />
                    <span />
                </MenuButton>
                <NavLink href="/music">Music</NavLink>
                <NavLink href="/soccer/fantasy-prem/players">Soccer</NavLink>
                <HomeLink href="/" onClick={handleCoinFlip}>
                    <CoinFlipContainer>
                        <CoinFlipWrapper $rotationDegrees={rotationDegrees}>
                            <CoinFaceFront>Cole</CoinFaceFront>
                            <CoinFaceBack>Eloc</CoinFaceBack>
                        </CoinFlipWrapper>
                    </CoinFlipContainer>
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
                <SideNavLink
                    href="/soccer/fantasy-prem/players"
                    onClick={toggleMenu}
                >
                    Soccer
                </SideNavLink>
                <SideNavLink href="/wine" onClick={toggleMenu}>
                    Wine
                </SideNavLink>
                <SideNavLink href="/ltrain" onClick={toggleMenu}>
                    L Train
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
    padding-left: 0.5rem;
    padding-right: 0.5rem;
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
    min-width: 140px;

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

const CoinFlipContainer = styled.div`
    perspective: 1000px;
    display: inline-block;
`;

const CoinFlipWrapper = styled.div<{ $rotationDegrees: number }>`
    position: relative;
    width: 100%;
    height: 50px;
    transform-style: preserve-3d;
    transform: rotateY(${(props) => props.$rotationDegrees}deg);
    transition: transform 2s;
`;

const CoinFaceFront = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: inherit;
`;

const CoinFaceBack = styled(CoinFaceFront)`
    transform: rotateY(180deg);
`;
