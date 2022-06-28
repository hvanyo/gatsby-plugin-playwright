const handler = require('serve-handler');
const http = require('http');
const playwright = require('playwright');
const fs = require('fs');

const publicPath = './public';

const defaultOptions = {
  port: 9000,
  screenshotsDir: './screenshots',
  browsers: ['chromium'],
  context: {},
  viewportwidths: [1280],
  query: `
     {
       allSitePage {
         nodes {
           path
         }
       }
     }
   `,
  serialize({ allSitePage }) {
    return allSitePage.nodes.map((page) => page.path);
  }
};

exports.onPostBuild = async ({ graphql }, pluginOptions) => {
  if (process.env.SKIP_SNAPSHOT === '1') {
    return;
  }

  const {
    port, screenshotsDir, browsers, query, serialize, viewports, context
  } = {
    ...defaultOptions,
    ...pluginOptions
  };

  const { data } = await graphql(query);
  const paths = serialize(data);

  const server = http.createServer((request, response) => {
    const config = {
      public: publicPath
    };

    return handler(request, response, config);
  });
  await server.listen(port);

  for (const browserType of browsers) {
    if (!playwright[browserType]) {
      console.error(`gatsby-plugin-playwright: Browser ${browserType} is not supported`);
      return;
    }

    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }

    if (!fs.existsSync(`${screenshotsDir}/${browserType}`)) {
      fs.mkdirSync(`${screenshotsDir}/${browserType}`);
    }

    const browser = await playwright[browserType].launch();
    const browserContext = await browser.newContext(context);
    const page = await browserContext.newPage();

    for (const viewportsize of viewportwidths) {
      await page.setViewportSize({ width: viewportsize, height: 1080 });

      for (const path of paths) {
        // removes forward slashes
        let fileName = path.replace(/\\|\//g, '');
        if (fileName === '') fileName = 'home';
        const screenshotPath = `${screenshotsDir}/${browserType}/${viewportsize}/${fileName}.png`;
        await page.goto(`http://localhost:${port}${path}`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log('gatsby-plugin-playwright:', screenshotPath);
      }
    }

    await browser.close();
  }

  await server.close();
};
