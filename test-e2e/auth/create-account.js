const { WebDriver, Builder, By, Key, until } = require('selenium-webdriver');
const { expect } = require('chai');
const createTestSuites = require('../utils/create-test-suites');
const helpers = require('../utils/helpers');

// selenium-webdriver docs: https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver.html

createTestSuites('account-creation', ({driver, browserHostUrl}) => {

  step('load initial page', async () => {
    await driver.get(browserHostUrl);
    await driver.el(By.xpath('//*[contains(.,"Create your Blockstack ID")]'));
  });

  if (!process.env['TEST_PRODUCTION_REGISTRAR']) {
    step('set "test-registrar.blockstack.org" as API endpoint for ID registration', async () => {
      await driver.retry(async () => {
        await driver.executeScript(`window.SUBDOMAIN_SUFFIX_OVERRIDE = "test-personal.id";`);
      }, 10000, 200);
    });
  }

  step('load create new ID page', async () => {
    await driver.click(By.xpath('//div[text()="Create new ID"]'));
  });

  let randomUsername
  step('enter unique username', async () => {
    randomUsername = `test_e2e_${Date.now() / 100000 | 0}_${helpers.getRandomInt(100000, 999999)}`;
    await driver.setText(By.css('input[type="text"][name="username"]'), randomUsername);
    await driver.click(By.xpath('//button[contains(., "Check Availability")]'));
    await driver.click(By.xpath('//button[contains(., "Continue")]'));
  });

  step('enter password', async () => {
    const randomPassword = helpers.getRandomString();
    await driver.setText(By.css('input[type="password"][name="password"]'), randomPassword);
    await driver.setText(By.css('input[type="password"][name="passwordConfirm"]'), randomPassword);
    await driver.click(By.xpath('//button[contains(., "Register ID")]'));
  });

  step('wait for creating Blockstack ID spinner', async () => {
    try {
      // first check if message is still showing (it may have been quick and already closed)
      await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Creating your Blockstack ID")]')), 2500);
    } catch (err) {
      console.warn(`Error checking for "Creating your Blockstack ID" spinner: ${err}`);
    }
    // wait for next page to load
    await driver.el(By.xpath('//*[contains(text(), "What is your email")]'), null,
      { timeout: 90000, poll: 200, driverWait: 90000 });
  });

  step('enter email', async () => {
    await driver.setText(By.css('input[type="email"][name="email"]'), `${randomUsername}@none.test`);
    await driver.click(By.xpath('//button[contains(., "Next")]'));
  });

  step('expect recovery email to fail', async () => {
    // Expect recovery email delivery to fail (the email domain does not exist)
    await driver.el(By.xpath('//*[contains(., "email failed")]'));
  });

  step('check username registration failed', async () => {
    try {
      await driver.wait(until.elementLocated(By.xpath('//*[text()="Username Registration Failed"]')), 2500);
      console.warn('Username Registration Failed - does test server IP need whitelisted on the registar?')
      // close the alert since it can eclipse the continuation button..
      const el = await driver.click(By.xpath('//*[text()="Username Registration Failed"]/parent::div/following-sibling::div/descendant::span'));
      await driver.wait(until.elementIsNotVisible(el));
    } catch (err) {
      /* ignore error, this is expected if registration is successful */
    }
  });

  step('acknowledge saving recovery key phrase', async () => {
    // First click redirects the page from /sign-up to /seed but doesn't change the form
    await driver.click(By.xpath('//div[text()="Secret Recovery Key"]/parent::div'));
    await driver.el(By.xpath('//div[contains(., "Save your Secret Recovery")]'));
    await driver.click(By.xpath('//div[text()="Secret Recovery Key"]/parent::div'));
  });

  step('wait for "unlocking recovery key"', async () => {
    try {
      // first check if message is still showing (it may have been quick and already closed)
      await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Unlocking Recovery Key")]')), 2500);
    } catch (err) {
      console.warn(`Error checking for "Unlocking Recovery Key" spinner: ${err}`);
    }
    // wait for next page to load
    await driver.el(By.xpath('//*[text()="Your Secret Recovery Key"]/following-sibling::*'), null,
      { timeout: 90000, poll: 200, driverWait: 90000 });
  });

  let keyWords;
  step('get secret recovery key phrase', async () => {
    // Get the recovery key phrase
    const keyEl = await driver.el(By.xpath('//*[text()="Your Secret Recovery Key"]/following-sibling::*'));
    keyWords = await keyEl.getText();
    keyWords = keyWords.trim().split(' ');
    expect(keyWords).lengthOf(12, 'Recovery key phrase should be 12 words');
    await driver.click(By.xpath('//div[text()="Continue"]/parent::div'));
  });

  step('perform recovery key phrase verification instructions', async () => {
    await driver.sleep(2500); // wait for animation
    const selectWordsEl = await driver.el(By.xpath('//*[contains(text(), "Select words #")]'));
    let selectWords = await selectWordsEl.getText();
    // Parse the phrase word numbers to validate
    selectWords = selectWords.match(/#([0-9]+)/g).map(s => keyWords[parseInt(s.slice(1)) - 1]);
    for (let selectWord of selectWords) {
      await driver.click(By.xpath(`//div[span[text()="${selectWord}"]]`));
    }
  });

  step('load main page as authenticated user', async () => {
    await driver.click(By.xpath('//div[text()="Go to Blockstack"]'));
    await driver.el(By.xpath('//*[text()="Top Apps"]'));
  });

});
