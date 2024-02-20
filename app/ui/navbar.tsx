"use client";

import Link from "next/link";
import styled from "styled-components";

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
`;

const NavbarWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 900px) {
    justify-content: center;
  }
`;

const NavLink = styled(Link)`
  font-size: 1.5rem;
  font-weight: 900;
  padding-left: 0.3125rem;
  padding-right: 0.3125rem;
  text-transform: uppercase;
  text-decoration: none;

  &:hover {
    background-color: black;
    color: rgb(254, 217, 37);
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

const HomeLink = styled(NavLink)`
  font-size: 2.5rem;
  background-color: rgb(254, 217, 37);
  padding: 0px 16px;
  align-items: center;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
