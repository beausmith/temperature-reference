import React from 'react'
import styled from 'styled-components'

const StyledVersion = styled.a`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
  color: #aaaaaa;
  text-decoration: none;
  & > div:last-child {
    font-size: 0.65rem;
  }
`

const commitRef = process.env.REACT_APP_COMMIT_REF

const Version = () => (
  <StyledVersion href="https://github.com/beausmith/temperature-reference/">
    <div>{`v${process.env.REACT_APP_VERSION}`}</div>
    <div>{commitRef ? commitRef.substring(0, 7) : '0000000'}</div>
  </StyledVersion>
)

export default Version
