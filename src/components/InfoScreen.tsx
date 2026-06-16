import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`

const slideDown = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
`

const Overlay = styled.div<{ $closing: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 20;
  background: white;
  display: flex;
  flex-direction: column;
  animation: ${({ $closing }) => ($closing ? slideDown : slideUp)} 0.28s ease-out forwards;
  padding-top: env(safe-area-inset-top);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
`

const Title = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
`

const DoneButton = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  color: #007aff;
  font-size: 1.0625rem;
  font-weight: 600;
  padding: 0.25rem 0.25rem 0.25rem 1rem;
  cursor: pointer;
`

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 1.25rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom));
`

const Section = styled.section`
  margin-bottom: 2rem;
`

const SectionHeading = styled.h2`
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #888;
  margin: 0 0 0.75rem;
`

const Installed = styled.p`
  margin: 0 0 0.75rem;
  font-size: 1rem;
`

const Platform = styled.details`
  border: 1px solid #eee;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.625rem;
  &[open] {
    background: #fafafa;
  }
`

const PlatformSummary = styled.summary`
  font-weight: 600;
  cursor: pointer;
  list-style: none;
  &::-webkit-details-marker {
    display: none;
  }
`

const Steps = styled.ol`
  margin: 0.75rem 0 0;
  padding-left: 1.25rem;
  line-height: 1.5;
  & li {
    margin-bottom: 0.375rem;
  }
`

const Reveal = styled.details`
  margin-top: 0.25rem;
  & > summary {
    color: #007aff;
    cursor: pointer;
    list-style: none;
    font-size: 0.9375rem;
    &::-webkit-details-marker {
      display: none;
    }
  }
`

const VersionRow = styled.a`
  display: inline-flex;
  flex-direction: column;
  gap: 0.125rem;
  color: #888;
  text-decoration: none;
  font-size: 0.875rem;
  & .commit {
    font-size: 0.75rem;
  }
`

const isIOS = () => {
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
}
const isAndroid = () => /android/i.test(navigator.userAgent)
const isStandalone = () =>
  (typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches) ||
  (window.navigator as { standalone?: boolean }).standalone === true

const commitRef = import.meta.env.VITE_COMMIT_REF
const version = import.meta.env.VITE_VERSION

const IosSteps = () => (
  <Steps>
    <li>Open this page in <strong>Safari</strong>.</li>
    <li>Tap the <strong>Share</strong> button.</li>
    <li>Choose <strong>Add to Home Screen</strong>.</li>
  </Steps>
)

const AndroidSteps = () => (
  <Steps>
    <li>Open this page in <strong>Chrome</strong>.</li>
    <li>Tap the <strong>⋮</strong> menu (top right).</li>
    <li>Choose <strong>Add to Home screen</strong> (or <strong>Install app</strong>).</li>
  </Steps>
)

const InstallInstructions = () => {
  const ios = isIOS()
  const android = isAndroid()
  const desktop = !ios && !android
  return (
    <>
      <Platform open={ios || desktop}>
        <PlatformSummary>iPhone &amp; iPad (iOS)</PlatformSummary>
        <IosSteps />
      </Platform>
      <Platform open={android || desktop}>
        <PlatformSummary>Android</PlatformSummary>
        <AndroidSteps />
      </Platform>
    </>
  )
}

interface Props {
  onClose: () => void
}

const InfoScreen: React.FC<Props> = ({ onClose }) => {
  const [closing, setClosing] = useState(false)
  return (
    <Overlay
      role="dialog"
      aria-modal="true"
      aria-label="Info"
      $closing={closing}
      onAnimationEnd={() => closing && onClose()}
    >
      <Header>
        <Title>Celsius</Title>
        <DoneButton type="button" onClick={() => setClosing(true)}>Done</DoneButton>
      </Header>
    <Content>
      <Section>
        <SectionHeading>Install</SectionHeading>
        {isStandalone() ? (
          <>
            <Installed>Installed ✓ — you're all set.</Installed>
            <Reveal>
              <summary>View install instructions</summary>
              <InstallInstructions />
            </Reveal>
          </>
        ) : (
          <InstallInstructions />
        )}
      </Section>
      <Section>
        <SectionHeading>About</SectionHeading>
        <VersionRow
          href="https://github.com/beausmith/temperature-reference/"
          target="_blank"
          rel="noreferrer"
        >
          <span>{`Version v${version}`}</span>
          <span className="commit">{commitRef ? commitRef.substring(0, 7) : '0000000'}</span>
        </VersionRow>
      </Section>
    </Content>
    </Overlay>
  )
}

export default InfoScreen
