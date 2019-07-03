import styled from 'styled-components'
import safeAreaInsets from 'safe-area-insets'

const StatusBar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: ${safeAreaInsets.top || 40}px;
  background: rgba(0,0,0,0.4);
`
export default StatusBar
