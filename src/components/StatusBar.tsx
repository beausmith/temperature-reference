import styled from 'styled-components'

interface Props {
  height: number
}

const StatusBar = styled.div<Props>`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: ${({ height }) => height}px;
  background: rgba(0,0,0,0.4);
`
export default StatusBar
