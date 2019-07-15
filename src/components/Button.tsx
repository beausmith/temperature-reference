import styled from 'styled-components'

interface ButtonAttrs extends HTMLButtonElement {
  readonly type: string
}
interface ButtonProps {
  fullWidth?: boolean
}
const Button = styled.button.attrs((attrs: ButtonAttrs) => ({
  type: attrs.type || 'button',
}))<ButtonProps>`
  appearance: none;
  width: ${({ fullWidth = false }) => fullWidth ? '100%' : undefined };
  border: none;
  margin: 0;
  padding: 1rem;
  background: transparent;
  &:focus {
    outline: none;
  }
`

export default Button
