import styled, { css } from 'styled-components'

interface NavItemProps {
  flex?: number
}

export const NavItemStyles = css<NavItemProps>`
  flex: ${({ flex = 1 }) => flex};
`

export const NavItem = styled.div<NavItemProps>`
  ${NavItemStyles}
`

const Navigation = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  width: 100%;
  background: rgba(255,255,255,.9);
  box-shadow: 0 0 3px rgba(0,0,0,.1);
  padding-bottom: env(safe-area-inset-bottom);
  & > div {
    padding: 1rem;
  }
`
export default Navigation
