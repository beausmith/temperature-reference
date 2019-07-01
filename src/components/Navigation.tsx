import styled from 'styled-components'

const Navigation = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  width: 100%;
  background: rgba(255,255,255,.9);
  box-shadow: 0 0 3px rgba(0,0,0,.1);
  padding-bottom: env(safe-area-inset-bottom);
`
export default Navigation
