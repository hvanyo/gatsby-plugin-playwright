# gatsby-plugin-playwright

Uses [Playwright](https://github.com/microsoft/playwright) to generate screenshots in Chromium, Firefox and WebKit.

_NOTE: This plugin only generates output with `gatsby build`_

Snapshots are taken full page.
## Install

`npm install gatsby-plugin-playwright --save-dev`

## Usage

```javascript
plugins: ['gatsby-plugin-playwright']
```

If you do not want this to run then set environment variable: SKIP_SNAPSHOT=1
## Options
The options are as follows:

- `port` (number) The port number for the web server to listen to. Defaults to `9000`.
- `screenshotsDir` (string) The screenshots directory path. Defaults to `./screenshots`.
- `browsers` (array of strings) An array of browsers for playwright to screenshot. Defaults to `['chromium', 'firefox', 'webkit']`
- `context` ([BrowserContext](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browsercontext)) Defaults to `{}`
-  `viewportwidths` (array of intergers)  An array of widths to set viewport width
- `query` (GraphQL Query) The query for the data you need to generate the screenshots. If you change the query you also need to change the serialize function to properly format the data. 
- `serialize` (function) Takes the output of the data query and has to return an array with strings that reflects the page path. 

## Example with options:

```javascript
// gatsby-config.js for desktop testing
plugins: [
  {
    resolve: 'gatsby-plugin-playwright',
    options: {
      port: 9000,
      screenshotsDir: './screenshots',
      browsers: ['chromium', 'firefox', 'webkit'],
      viewportwidths: [600, 640, 768, 1024, 1280, 1536, 1920],
      context: {},
      query: `
        {
          allSitePage {
            nodes {
              path
            }
          }
        }
      `,
      serialize: function ({ allSitePage }) {
        return allSitePage.nodes.map((page) => page.path);
      }
    }
  },
]
```

Define a context to test for different widths, heights, geolocation and permissions. You can read more about the browser context on the official [Playwright documentation](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browsercontext)

```javascript
// gatsby-config.js for testing specific contexts
plugins: [
  {
    resolve: `gatsby-plugin-playwright`,
    options: {
      browsers: ['webkit'],
      // This example is an iPhone 11
      context: {
        'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
        'viewport': {
          'width': 414,
          'height': 896
        },
        'deviceScaleFactor': 2,
        'isMobile': true,
        'hasTouch': true
      },
    }
  },
]
```
