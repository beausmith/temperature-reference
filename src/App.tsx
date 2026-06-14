import React, { useEffect, useLayoutEffect, useState } from 'react'
import safeAreaInsets from 'safe-area-insets'
import styled from 'styled-components'
import smoothscroll from 'smoothscroll-polyfill'

import useWindowScroll from './hooks/useWindowScroll'
import GlobalStyle from './components/GlobalStyle'
import Button from './components/Button'
import Navigation from './components/Navigation'
import StatusBar from './components/StatusBar'
import TempKeypad from './components/TempKeypad'
import Version from './components/Version'

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
const celciusTemp = (scale: number, temp: number) =>
  (celciusMax / scale) * rowHeight - (temp / scale * rowHeight) + rowHeight

const AppContainer = styled.div`
  position: relative;
`

const ScopeContainer = styled.div`
  padding: ${clientHeight / 2}px 0;
`
const Scope = styled.div`
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
    margin-left: 2vw;
  }
  & > div:last-child {
    margin-right: 2vw;
  }

`
const Label = styled.div`
  text-align: center;
  min-width: 3.5em;
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
  time?: string
  background: string
  color?: string
  right?: string
  left?: string
}
interface StyledItemProps {
  $celcius: number
  $background: string
  $color?: string
  $right?: string
  $left?: string
}
const StyledItem = styled.div<StyledItemProps>`
  position: absolute;
  top: ${({ $celcius }) => (celciusTemp(scale, $celcius))}px;
  left: ${({ $left, $right }) => (!$left && !$right ? '25vw' : $left && !$right ? $left : undefined)};
  right: ${({ $left, $right }) => ($right && !$left ? $right : undefined)};
  height: ${rowHeight / 2}px;
  background: ${({ $background }) => ($background || undefined)};
  font-size: 0.8rem;
  line-height: ${rowHeight / 2}px;
  padding: 0 0.5rem;
  border-radius: ${rowHeight / 2}px;
  margin-top: -${rowHeight / 4}px;
  white-space: nowrap;
  color: ${({ $color }) => $color || "white"};
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: ${rowHeight / 4}px;
    width: 2vw;
    border-top: 1px solid tan;
    border-color: ${({ $background }) => ($background || undefined)};
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
const Item = ({ name, celcius, time, background, color, right, left }: ItemProps) => (
  <StyledItem
    $celcius={celcius}
    $background={background}
    $color={color}
    $right={right}
    $left={left}
    tabIndex={-1}
  >
    {name} • {time && `${time} @`} {celcius}ºC
  </StyledItem>
)

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

const lastTempKey = 'lastTemp'

// safeAreaInsets reads 0 on a cold launch and only settles once the viewport
// does, so consumers must subscribe to changes rather than read it per render.
const useSafeAreaInsetTop = (): number => {
  const [top, setTop] = useState(safeAreaInsets.top)
  useEffect(() => {
    const handleChange = () => setTop(safeAreaInsets.top)
    safeAreaInsets.onChange(handleChange)
    return () => safeAreaInsets.offChange(handleChange)
  }, [])
  return top
}

const App: React.FC = () => {
  const { y } = useWindowScroll()
  const safeAreaInsetTop = useSafeAreaInsetTop()
  const [isZeroInit, setIsZeroInit] = useState(false)
  const [isKeypadOpen, setIsKeypadOpen] = useState(false)
  if (!!y && !isZeroInit) setIsZeroInit(true)
  const zeroScrollTop = (celciusMax / scale) * rowHeight - (0 / scale * rowHeight) + rowHeight / 2 - safeAreaInsetTop / 2
  const currentTemp = ((zeroScrollTop - y) / 10).toFixed(1)
  const restoreTimeoutRef = React.useRef<number | undefined>(undefined)
  const scrollToCelsius = (celsius: number) => {
    // Cancel any pending restore scroll so it doesn't override a smooth scroll
    window.clearTimeout(restoreTimeoutRef.current)
    window.scroll({ top: zeroScrollTop - celsius * (rowHeight / scale), behavior: 'smooth' })
  }
  const scrollToZeroCelcius = () => scrollToCelsius(0)
  const [initialTemp] = useState(() => {
    const lastTemp = parseFloat(window.localStorage.getItem(lastTempKey) ?? '')
    return Number.isFinite(lastTemp) ? lastTemp : 0
  })
  useLayoutEffect(() => {
    const initialTop = zeroScrollTop - initialTemp * (rowHeight / scale)
    window.scrollTo({ top: initialTop + 1 })
    restoreTimeoutRef.current = window.setTimeout(() => {
      window.scrollTo({ top: initialTop })
    }, 200)
    return () => window.clearTimeout(restoreTimeoutRef.current)
  }, [zeroScrollTop, initialTemp])
  useEffect(() => {
    if (isZeroInit) window.localStorage.setItem(lastTempKey, currentTemp)
  }, [isZeroInit, currentTemp])
  useEffect(() => {
    if (import.meta.env.VITE_BRANCH !== 'production') {
      document.title = `Celsius - ${import.meta.env.VITE_BRANCH}`
    }
  }, [])
  return (
    <AppContainer>
      <GlobalStyle />
      <ScopeContainer>
        <Scope>

          {/* Basics */}
          <Weather />
          <Item name="Sauna" time="15m" celcius={80} background="royalblue" />
          <Item name="Bath Tub" celcius={38} background="royalblue" right="25vw" />
          <Item name="Pizza" celcius={300} background="firebrick" />
          <Item name="Tea/Coffee" celcius={60} background="black" right="25vw" />
          <Item name="Sterilize Berries" time="30s" celcius={52} background="black" right="25vw" />

          {/* Other Meats */}
          <Item name="Chicken Breast" time="1h" celcius={65} background="tan" color="black" />
          <Item name="Egg" time="63m" celcius={63} background="lightgrey" color="black" />
          <Item name="Salmon" time="1h" celcius={55} background="salmon" right="25vw" />
          <Item name="Fish (FDA)" celcius={62} time="30m" background="salmon" right="25vw" />

          {/* Chicken */}
          {/* Pork */}
          {/* Beef */}
          {/* <Item name="Filet Mignon" time="2h" celcius={50} background="indianred" left="15vw" /> */}
          <Item name="Steak (Rare)" time="1–2h" celcius={54} background="indianred" left="15vw" />
          {/* <Item name="Steak (Medium)" time="1–2h" celcius={58} background="indianred" left="15vw" /> */}
          {/* <Item name="Steak (Well)" time="1–2h" celcius={68} background="indianred" left="15vw" /> */}
          {/* <Item name="Roast (Rare)" time="7–16h" celcius={56} background="indianred" left="20vw" /> */}
          {/* <Item name="Roast (Medium)" time="6–14h" celcius={60} background="indianred" left="20vw" /> */}
          {/* <Item name="Roast (Well)" time="5–11h" celcius={70} background="indianred" left="20vw" /> */}
          {/* <Item name="Tough Cut (Rare)" time="24–48h" celcius={55} background="indianred" left="25vw" /> */}
          {/* <Item name="Tough Cut (Medium)" time="24–30h" celcius={65} background="indianred" left="25vw" /> */}
          {/* <Item name="Tough Cut (Well)" time="8–16h" celcius={85} background="indianred" left="25vw" /> */}

          {/* Foodlab sousvide guides */}
          {/* ChefSteps sousvide guides */}
          {/* 170°F chicken legs */}
          {/* 225°F slow grill steak */}
          {/* Beef via https://blog.thermoworks.com/beef/steak-temps-getting-it-right/#chart
            Bleu Steak	110°F	43°C
            Rare Steak	120–130°F	49–54°C
            Medium Rare Steak	130–135°F	54–57°C
            Medium Steak	135–145°F	57–63°C
            Medium Well Steak	145–155°F	63–68°C
            Well Done Steak	155°F and up	68°C and up */}


          {celciusRange.map(c => (
            <Row key={c}>
              <Label>{c}ºC</Label>
              <RowRuler />
              <Label>{toF(c)}ºF</Label>
            </Row>
          ))}
        </Scope>
        <Indicator onClick={scrollToZeroCelcius}>
          {isZeroInit && (
            <Label>{currentTemp}ºC / {toF((zeroScrollTop - y) / 10).toFixed(1)}ºF</Label>
          )}
        </Indicator>
      </ScopeContainer>
      <Navigation>
        <Button $fullWidth onClick={scrollToZeroCelcius}>0ºC</Button>
        <Button $fullWidth onClick={() => setIsKeypadOpen(true)}>Go</Button>
        <Version />
      </Navigation>
      {isKeypadOpen && (
        <TempKeypad
          onClose={() => setIsKeypadOpen(false)}
          onSubmit={scrollToCelsius}
        />
      )}
      {!!safeAreaInsetTop && <StatusBar height={safeAreaInsetTop} />}
    </AppContainer>
  );
}

export default App;
