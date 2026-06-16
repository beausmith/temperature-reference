import { normalize } from 'styled-normalize'

import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  ${normalize}

  html {
    font-size: 16px;
    user-select: none;
  }

  /*
   * Normalize a UA default that differs across platforms: <button> text color
   * is ButtonText (≈ black) on desktop browsers but the system tint (blue) on
   * iOS Safari. Inherit the page color so buttons read black everywhere unless
   * a component sets its own color (component class selectors override this).
   */
  button {
    color: inherit;
  }

  pre {
    margin: 0;
  }
`

export default GlobalStyle
