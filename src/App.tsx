import React, { useLayoutEffect, useState } from 'react'
import safeAreaInsets from 'safe-area-insets'
import styled from 'styled-components'
import smoothscroll from 'smoothscroll-polyfill'

import './App.css'

import Debugger from './components/Debugger'
import useWindowScroll from './hooks/useWindowScroll'
import Button from './components/Button'
import Navigation from './components/Navigation'

smoothscroll.polyfill()

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
const zeroScrollTop = (celciusMax / scale) * rowHeight - (0 / scale * rowHeight) + rowHeight / 2 - safeAreaInsets.top / 2
const celciusTemp = (scale: number, temp: number) =>
  (celciusMax / scale) * rowHeight - (temp / scale * rowHeight) + rowHeight

const AppContainer = styled.div`
  position: relative;
`

const StatusBar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: ${safeAreaInsets.top}px;
  background: rgba(0,0,0,0.4);
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
  padding: 25px 0 26px; /* +1px to display last horizontal line */
`
const Row = styled.div`
  display: flex;
  flex-direction: row;
  height: ${rowHeight}px;
  align-items: center;
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  & > div:first-child {
    margin-left: 3vw;
  }
  & > div:last-child {
    margin-right: 3vw;
  }

`
const Label = styled.div`
  text-align: center;
  min-width: 4em;
  background: white;
  border: 1px solid #dddddd;
  border-radius: ${rowHeight / 2}px;
`
const RowRuler = styled.div`
  flex: 3;
`
const Indicator = styled.div`
  display: flex;
  flex-direction: row;
  position: fixed;
  top: 50%;
  width: 100%;
  border-top: 1px solid rgba(255, 0, 0, 0.7);
  & div {
    padding: 0 1rem;
    margin: -11px auto 0;
    border-color: rgba(255, 0, 0, 0.7);
  }
`
interface ItemProps {
  name: string
  celcius: number
  time: string
  color: string
  right?: string
  left?: string
}
const StyledItem = styled.div<ItemProps>`
  position: absolute;
  top: ${({ celcius }) => (celciusTemp(scale, celcius))}px;
  left: ${({ left, right }) => (!left && !right ? '25vw' : left && !right ? left : undefined)};
  right: ${({ left, right }) => (right && !left ? right : undefined)};
  height: ${rowHeight / 2}px;
  background: ${({ color }) => (color || undefined)};
  font-size: 0.8rem;
  line-height: ${rowHeight / 2}px;
  padding: 0 0.5rem;
  border-radius: ${rowHeight / 2}px;
  margin-top: -${rowHeight / 4}px;
  white-space: nowrap;
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: ${rowHeight / 4}px;
    width: 2vw;
    border-top: 1px solid tan;
    border-color: ${({ color }) => (color || undefined)};
  }
  &::before {
    left: -2vw;
  }
  &::after {
    right: -2vw;
  }
  &:focus {
    z-index: 1;
    outline: none;
  }
`
const Item = (props: ItemProps) => {
  const { name, celcius, time } = props
  return <StyledItem {...props} tabIndex={-1}>{name} {time} @ {celcius}ºC</StyledItem>
}

const Weather = styled.div`
  position: absolute;
  top: ${celciusTemp(scale, 45)}px;
  left: 25vw;
  background: linear-gradient(red, red, orange, orange, yellow, #f8f8f8, cyan, blue, blue, darkblue, darkblue);
  height: ${rowHeight * 10.5}px;
  width: ${rowHeight / 2}px;
  margin-top: -${rowHeight / 4}px;
  border-radius: ${rowHeight / 2}px;
`

const App: React.FC = () => {
  const { y } = useWindowScroll()
  const [isZeroInit, setIsZeroInit] = useState(false)
  if (!!y && !isZeroInit) setIsZeroInit(true)
  const currentTemp = ((zeroScrollTop - y) / 10).toFixed(1)
  const scrollToZeroCelcius = () => {
    window.scroll({ top: zeroScrollTop, behavior: 'smooth' })
  }
  useLayoutEffect(() => {
    const triggerScroll = () => {
      window.scrollTo({ top: zeroScrollTop + 1 })
      window.setTimeout(() => {
        window.scrollTo({ top: zeroScrollTop })
      }, 200)
    }
    triggerScroll()
  }, [])
  return (
    <AppContainer>
      <RangeContainer>
        <Range>
          <Weather />
          <Item name="Pizza" time="5m" celcius={300} color="lightblue" />
          <Item name="Chicken Breast" time="1h" celcius={65} color="tan" />
          <Item name="Egg" time="63m" celcius={63} color="lightgrey" />
          <Item name="Hanger Steak" time="2–4h" celcius={54.4} color="cornflowerblue" />
          <Item name="Salmon" time="1h" celcius={55} color="salmon" right="25vw" />
          {celciusRange.map(c => (
            <Row key={c}>
              <Label>{c}ºC</Label>
              <RowRuler />
              <Label>{toF(c)}ºF</Label>
            </Row>
          ))}
        </Range>
        <Indicator>
          {isZeroInit && (
            <Label>{currentTemp}ºC / {toF(parseFloat(currentTemp)).toFixed(1)}ºF</Label>
          )}
        </Indicator>
      </RangeContainer>
      <Navigation>
        <Button onClick={scrollToZeroCelcius}>0ºC</Button>
      </Navigation>
      {safeAreaInsets.support && <StatusBar />}
      <Debugger />
    </AppContainer>
  );
}

export default App;
