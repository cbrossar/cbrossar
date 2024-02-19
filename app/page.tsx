'use client';

import Link from 'next/link';
import styled from 'styled-components';
import Image from 'next/image';


export default function Home() {
  return (
    <HomeWrapper>
      <ImageLink
        href="/soccer"
      >
        <Image
            src="/colombia-soccer.jpeg"
            width={900}
            height={450}
            alt="Colombia soccer"
          />
          <ImageText>Soccer</ImageText>
      </ImageLink>
    </HomeWrapper>
  );
}

const HomeWrapper = styled.div`
    margin: 0 auto;
    max-width: 58.75rem;
    min-height: 85vh;
    position:relative;
`;

const ImageLink = styled(Link)`
  &:hover {
    opacity: .5;
  }
`;

const ImageText = styled.div`
  left: 0;
  position: absolute;
  top: 180px;
  transition: background-color .2s ease-in-out,opacity .2s ease-in-out;
  width: 100%;
  align-items: center;
  display: flex;
  font-size: 30px;
  font-weight: 900;
  justify-content: center;
  line-height: 1;
  margin: 0;
  padding: 1.25rem;
  text-align: center;
  text-transform: uppercase;
  color: white;
`;