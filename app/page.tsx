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
    padding: 0px 20px;
`;

const ImageText = styled.div`

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: background-color .2s ease-in-out,opacity .2s ease-in-out;
  font-size: 30px;
  font-weight: 900;
  text-transform: uppercase;
  color: white;
  opacity: 0;

  @media (max-width: 767px) {
    opacity: 1;
  }
`;

const ImageLink = styled(Link)`
  position: relative;

  &:hover {
    opacity: .5;
    ${ImageText} {
      opacity: 1;
    }
  }
`;