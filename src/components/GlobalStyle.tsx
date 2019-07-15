import { normalize } from 'styled-normalize'

import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  ${normalize}

  html {
    font-size: 16px;
    user-select: none;
  }

  pre {
    margin: 0;
  }
`

export default GlobalStyle
