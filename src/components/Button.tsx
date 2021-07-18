import styled from 'styled-components'

interface ButtonProps {
  fullWidth?: boolean
}
const Button = styled.button.attrs(({ type = 'button' }) => ({
  type,
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
