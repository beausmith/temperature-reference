import React from 'react'
import styled from 'styled-components'
import safeAreaInsets from 'safe-area-insets'

const { clientHeight } = document.documentElement

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

const Debugger: React.FC = ({ children }) => (
  <Container>
    <div>{children}</div>
    <div>clientHeight: {clientHeight}</div>
    <pre>{JSON.stringify({safeAreaInsets}, undefined, 2)}</pre>
    <pre>{JSON.stringify(process.env, undefined, 2)}</pre>
  </Container>
)

export default Debugger
