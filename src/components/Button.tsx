import styled from 'styled-components'

interface ButtonAttrs extends HTMLButtonElement {
  readonly type: string
}
const Button = styled.button.attrs((attrs: ButtonAttrs) => ({
  type: attrs.type || 'button',
}))`
  appearance: none;
  flex: 1;
  border: 0 solid red;
  margin: 0;
  padding: 1rem;
  background: transparent;
`

export default Button
