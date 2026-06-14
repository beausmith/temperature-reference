import styled from 'styled-components'

// Uses the CSS env() value directly so the inset is correct on the first paint
// (resolves to 0 on devices without a notch / safe area). No JS measurement, so
// nothing to settle on a cold launch.
const StatusBar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: env(safe-area-inset-top, 0px);
  background: rgba(0, 0, 0, 0.4);
`
export default StatusBar
