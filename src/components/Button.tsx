import styled from 'styled-components'

interface ButtonAttrs extends HTMLButtonElement {
  readonly type: string
}
const Button = styled.button.attrs((attrs: ButtonAttrs) => ({
  type: attrs.type || 'button',
}))`
  appearance: none;
  flex: 1;
  border: none;
  margin: 0;
  padding: 1rem;
  background: transparent;
  &:focus {
    outline: none;
  }
`

export default Button
