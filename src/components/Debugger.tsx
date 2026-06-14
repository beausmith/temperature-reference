import React from 'react'
import styled from 'styled-components'

const { clientHeight } = document.documentElement

// Reads the live CSS safe-area insets (env()) for on-device debugging
const readSafeAreaInsets = () => {
  const el = document.createElement('div')
  el.style.cssText =
    'position:fixed;top:env(safe-area-inset-top);right:env(safe-area-inset-right);bottom:env(safe-area-inset-bottom);left:env(safe-area-inset-left);visibility:hidden'
  document.body.appendChild(el)
  const cs = getComputedStyle(el)
  const insets = {
    top: cs.top,
    right: cs.right,
    bottom: cs.bottom,
    left: cs.left,
  }
  el.remove()
  return insets
}

const Container = styled.div`
position: fixed;
top: 10px;
right: 10px;
left: 10px;
padding: 4vw;
background: rgba(10,200,30,0.75);
z-index: 999;
overflow: auto;
`

const Debugger: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Container>
    <div>{children}</div>
    <div>clientHeight: {clientHeight}</div>
    <pre>{JSON.stringify({ safeAreaInsets: readSafeAreaInsets() }, undefined, 2)}</pre>
    <pre>{JSON.stringify(import.meta.env, undefined, 2)}</pre>
  </Container>
)

export default Debugger
