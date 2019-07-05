## Running Tests

These test can be ran using the web browsers on your local machine or using BrowserStack's environments. The tests can be targeting against any provided hosted browser endpoint as well as a locally built & hosted endpoint. 


Use `npm run test-e2e:localBuild` to build and host the browser locally, then run tests using your local system web browsers.

Use `npm run test-e2e:browserstack` to build and host the browser locally, then run tests against BrowserStack's grid. All major operating systems and browsers are setup and working, including iOS and Android. 

To specify an endpoint and BrowserStack usage, use `npm run test-e2e` with environment variables `E2E_BROWSER_HOST={url|directory}` and `USE_BROWSERSTACK={true|false}`. 

If `E2E_BROWSER_HOST` is set and is not an `http(s)://` url, it is assumed to be a local file system directory, and a local static web server will be spawned and pointed at the directory. 

#### Run specific test suite(s)

Use the environment variable `TEST_E2E_GREP` to target specific test suites and/or web browsers / environments. This uses [Mocha's `--grep` feature](https://mochajs.org/#-grep-regexp-g-regexp) which supports regex. Test suite all have the naming structure `{description} {web browser / environment}`.

Examples:
* Run all test suites locally on only the Chrome browser:
  * `TEST_E2E_GREP=chrome npm run test-e2e:localBuild`
* Run the login test suite locally on only the Chrome browser:
  * `TEST_E2E_GREP=login-to-hello-blockstack-app.*chrome npm run test-e2e:localBuild`
* Run all test suites against the remote BrowserStack iOS platforms:
  * `TEST_E2E_GREP=iOS npm run test-e2e:browserstack`
* Run the login test suite against the remote BrowserStack iOS platforms:
  * `TEST_E2E_GREP=login-to-hello-blockstack-app.*iOS npm run test-e2e:browserstack`



#### Using BrowserStack

In order to run tests against BrowserStack, auth credentials must be specified in the environmental variable `BROWSERSTACK_AUTH` with the format `"user:key"`. 

For example `BROWSERSTACK_AUTH="alice1:yUDBktWP1tRdrfq5Lpck"`.


#### Running against the production name registrar

By default, the account creation tests will use the `test-registrar.blockstack.org` name registrar with the `.test-personal.id` domain suffix. This is to avoid spamming `.blockstack.id` with test IDs. 

The production name registrar can be enabled by setting the environment variable `TEST_PRODUCTION_REGISTRAR`.


## Writing new test suites

Use `createTestSuites({test suite description}, ... )` which takes care of initializing a selenium WebDriver for each web browser environment. For example:

```js
const createTestSuites = require('../utils/create-test-suites');

createTestSuites('account recovery via secret key', ({ driver, browserHostUrl }) => {

  step('load initial page', async () => {
    await driver.get(browserHostUrl);
  });

  step('load sign in page', async () => {
    await driver.click(By.xpath('//a[contains(.,"Sign in with an existing ID")]'));
  });

  step('enter secret recovery key', async () => {
    await driver.setText(By.css('textarea[name="recoveryKey"]'), SECRET_RECOVERY_KEY);
    await driver.click(By.css('button[type="submit"]'));
  });

});
```
