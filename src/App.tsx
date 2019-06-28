import React, { useLayoutEffect } from 'react'
import styled, { css } from 'styled-components'

import './App.css'

const { clientHeight } = document.documentElement
const toF = (c: number) => (c * 9 / 5 + 32)
// const toC = (f: number) => ((f - 32) * 5 / 9)

const scale = 5
const rowHeight = 50
const celciusMin = -40
const celciusMax = 300
const celciusRange: number[] = []
for (let i = celciusMin; i <= celciusMax; i += scale) {
  celciusRange.unshift(i)
}
const zeroScrollTop = (celciusMax / scale) * rowHeight - (0 / scale * rowHeight) + rowHeight / 2
const celciusTemp = (scale: number, temp: number) =>
  (celciusMax / scale) * rowHeight - (temp / scale * rowHeight) + rowHeight

interface ButtonAttrs extends HTMLButtonElement {
  readonly type: string
}
const Button = styled.button.attrs(( attrs: ButtonAttrs) => ({
  type: attrs.type || 'button',
}))`
  flex: 1;
  padding: 1rem;
`
const AppContainer = styled.div`
  position: relative;
`
const Navigation = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  width: 100%;
  background: rgba(255,255,255,.9);
  box-shadow: 0 0 3px rgba(0,0,0,.1);
`
const RangeContainer = styled.div`
  padding: ${clientHeight / 2}px 0;
`
const Range = styled.div`
  position: relative;
  margin: -${rowHeight / 2}px 0;
  background:
    repeating-linear-gradient(#dddddd, #dddddd 1px, transparent 1px, transparent 50px),
    repeating-linear-gradient(#f3f3f3, #f3f3f3 1px, transparent 1px, transparent 10px);
  padding: 25px 0 26px; /* for last horizontal line */
`
const Row = styled.div`
  display: flex;
  flex-direction: row;
  height: ${rowHeight}px;
  align-items: center;
`
const RowLabel = styled.div`
  text-align: center;
  min-width: 4em;
  background: white;
  border: 1px solid #dddddd;
  border-radius: ${rowHeight / 2}px;
  &:first-child {
    margin-left: 3vw;
  }
  &:last-child {
    margin-right: 3vw;
  }
`
const RowRuler = styled.div`
  flex: 3;
`
const Indicator = styled.div`
  position: fixed;
  top: 50%;
  width: 100%;
  border-bottom: 1px solid red;
`
const itemStyles = css`
  position: absolute;
  font-size: 0.8rem;
  line-height: ${rowHeight / 2}px;
  padding: 0 0.5rem;
  height: ${rowHeight / 2}px;
  border-radius: ${rowHeight / 2}px;
  margin-top: -${rowHeight / 4}px;
  white-space: nowrap;
  &::before {
    content: '';
    border-top: 1px solid tan;
    width: 2vw;
    position: absolute;
    top: ${rowHeight / 4}px;
    left: -2vw;
  }
  &::after {
    content: '';
    border-top: 1px solid tan;
    width: 2vw;
    position: absolute;
    top: ${rowHeight / 4}px;
    right: -2vw;
  }
`

const Chicken = styled.div`
  ${itemStyles}
  top: ${celciusTemp(scale, 65)}px;
  left: 20vw;
  background: tan;
`
const HangerSteak = styled.div`
  ${itemStyles}
  top: ${celciusTemp(scale, 54.4)}px;
  left: 25vw;
  background: cornflowerblue;
`
const Weather = styled.div`
  position: absolute;
  top: ${celciusTemp(scale, 45)}px;
  left: 25vw;
  background: linear-gradient(red, orange , yellow, #f8f8f8, cyan, blue, darkblue);
  height: ${rowHeight * 10.5}px;
  width: ${rowHeight / 2}px;
  margin-top: -${rowHeight / 4}px;
  border-radius: ${rowHeight / 2}px;
`


const App: React.FC = () => {
  const scrollToZeroCelcius = () => {
    window.scrollTo({ top: zeroScrollTop, behavior: 'smooth' })
  }
  useLayoutEffect(() => {
    window.scrollTo({ top: zeroScrollTop })
  }, [])
  return (
    <AppContainer>
      <RangeContainer>
        <Range>
          <Weather />
          <Chicken>Chicken 65ºC</Chicken>
          <HangerSteak>Hanger Steak 54.4ºC</HangerSteak>
          {celciusRange.map(c => (
            <Row key={c}>
              <RowLabel>{c}ºC</RowLabel>
              <RowRuler />
              <RowLabel>{toF(c)}ºF</RowLabel>
            </Row>
          ))}
        </Range>
        <Indicator />
      </RangeContainer>
      <Navigation>
        <Button onClick={scrollToZeroCelcius}>0ºC</Button>
      </Navigation>
    </AppContainer>
  );
}

export default App;
