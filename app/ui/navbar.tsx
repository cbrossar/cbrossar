'use client';

import Link from 'next/link';
import styled from 'styled-components';


export default function Navbar() {
  return (
    <Header>
        <NavbarWrapper>
            <NavLink href="/music">Music</NavLink>
            <NavLink href="/soccer">Soccer</NavLink>
            <HomeLink href="/">Cole</HomeLink>
            <NavLink href="/code">Code</NavLink>
            <NavLink href="/photos">Photos</NavLink>
        </NavbarWrapper>
    </Header>
  );
}

const Header = styled.header`
    padding: 30px 60px;
`

const NavbarWrapper = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
`;

const NavLink = styled(Link)`
    font-size: 1.125rem;
    font-weight: 900;
    padding-left: 0.3125rem;
    padding-right: 0.3125rem;
    text-transform: uppercase;
    text-decoration: none;
`;

const HomeLink = styled(NavLink)`
    font-size: 2.5rem;
    background-color: rgb(254, 217, 37);;
    padding: 0px 10px;
`;