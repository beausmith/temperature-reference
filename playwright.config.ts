import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
  projects: [
    {
      // channel: 'chrome' runs the locally installed Google Chrome, avoiding
      // the Chromium download (blocked on some networks)
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  webServer: {
    command: 'yarn start',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
