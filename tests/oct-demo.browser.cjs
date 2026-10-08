const { chromium } = require('playwright');
const { default: AxeBuilder } = require('@axe-core/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = process.env.DEMO_BASE_URL || 'http://localhost:5173';
    const textbox = page.getByRole('textbox', { name: 'Message the assistant' });
    const ready = async reply => {
      await reply.waitFor();
      const phase = await reply.getAttribute('data-phase');
      const expectedSteps = phase === 'planning' ? 5 : phase === 'review' ? 1 : 6;
      let skeletonDimensions;
      if (await reply.getAttribute('data-mode') !== 'ready') {
        if (await reply.getAttribute('data-mode') !== 'loading') {
          await reply.locator(':scope[data-mode="processing"]').waitFor();
          assert.equal(await reply.locator('[data-loading-surface]').count(), 0);
        }
        await reply.locator('[data-loading-surface]').waitFor();
        assert.equal(await reply.locator('svg[aria-label="Completed"]').count(), expectedSteps);
        await reply.getByText('Generating UI', { exact: true }).waitFor();
        skeletonDimensions = await reply.locator('[data-slot="card"]').evaluateAll(cards => cards.map(card => ({ width: card.getBoundingClientRect().width, height: card.getBoundingClientRect().height })));
      }
      await reply.locator(':scope[data-mode="ready"]').waitFor();
      if (skeletonDimensions) assert.deepEqual(await reply.locator('[data-slot="card"]').evaluateAll(cards => cards.map(card => ({ width: card.getBoundingClientRect().width, height: card.getBoundingClientRect().height }))), skeletonDimensions);
    };
    const inactive = async reply => assert.equal(await reply.locator('button').evaluateAll(buttons => buttons.every(button => button.disabled)), true);
    const dimensions = reply => reply.locator('[data-slot="card"]').evaluateAll(cards => cards.map(card => ({ width: card.getBoundingClientRect().width, height: card.getBoundingClientRect().height })));

    await page.goto(`${base}/oct-demo`);
    const reference = await context.newPage();
    await reference.goto(`${base}/pgagent2`);
    assert.equal(await page.getByRole('heading', { name: 'How can I help you today?' }).textContent(), await reference.getByRole('heading', { name: 'How can I help you today?' }).textContent());
    assert.deepEqual(await textbox.boundingBox(), await reference.getByRole('textbox', { name: 'Message the assistant' }).boundingBox());
    await textbox.focus();
    assert.equal(await textbox.evaluate(element => getComputedStyle(element).outlineStyle), 'none');

    await textbox.fill('hello');
    await textbox.press('Enter');
    const initial = page.locator('[data-assistant-message="2"]');
    await initial.waitFor();
    assert.equal(await initial.getAttribute('data-mode'), 'intro');
    assert.equal(await initial.getByRole('button', { name: 'Planning Tower C inspections' }).count(), 0);
    const intro = await initial.locator('p').first().textContent();
    assert.ok(intro.length < 180);
    await initial.locator(':scope[data-mode="processing"]').waitFor();
    assert.equal(await initial.locator('[data-loading-surface]').count(), 0);
    await initial.getByText('Generating UI', { exact: true }).waitFor();
    await initial.locator('[data-loading-surface]').waitFor();
    assert.equal(await initial.locator('svg[aria-label="Completed"]').count(), 5);
    const skeletonDimensions = await dimensions(initial);
    assert.equal(skeletonDimensions.length, 3);
    assert.equal(await initial.getByRole('heading', { name: 'Amar Sundaran', exact: true }).count(), 0);
    await ready(initial);
    assert.deepEqual(await dimensions(initial), skeletonDimensions);
    assert.equal(await initial.getByRole('button', { name: 'Planning Tower C inspections' }).evaluate(element => element.parentElement.className), 'w-full');
    const useSlot = initial.getByRole('button', { name: 'Use 5:45 PM' });
    const actionBox = await useSlot.boundingBox();
    const cardBox = await useSlot.locator('..').boundingBox();
    assert.equal(actionBox.height, 40);
    assert.equal(await useSlot.evaluate(element => getComputedStyle(element).fontSize), '16px');
    assert.ok(cardBox.width - actionBox.width < 40);
    const initialHtml = await initial.locator('[data-slot="card"]').first().innerHTML();
    await useSlot.click();
    await inactive(initial);
    assert.equal((await initial.locator('[data-slot="card"]').first().innerHTML()).replace(/ disabled=""/g, ""), initialHtml);

    const routing = page.locator('[data-assistant-message="4"]');
    await routing.locator('[data-unit="605"]').waitFor();
    const amarNode = await routing.locator('[data-unit="605"]').elementHandle();
    await routing.locator('[data-unit="605"][data-time="5:45 PM"]').waitFor();
    assert.equal(await routing.locator('[data-unit="205"]').getAttribute('data-time'), '4:30 PM');
    await routing.locator('[data-unit="202"][data-time="4:00 PM"]').waitFor();
    assert.equal(await amarNode.evaluate(element => element.isConnected && element.dataset.time === '5:45 PM'), true);
    const review = page.locator('[data-assistant-message="5"]');
    await ready(review);
    await inactive(routing);
    assert.equal(await initial.locator('[data-unit="605"]').getAttribute('data-time'), '4:30 PM');
    assert.equal(await page.locator('[data-assistant-message]').count(), 3);
    await review.getByRole('button', { name: 'Review full schedule' }).click();
    assert.equal(await review.locator('tbody tr').count(), 116);
    assert.equal(await review.locator('details').count(), 6);
    const axe = await new AxeBuilder({ page }).include('.oct-demo').analyze();
    assert.deepEqual(axe.violations, []);
    await review.getByRole('button', { name: 'Confirm & notify residents' }).click();
    await inactive(review);
    const result = page.locator('[data-assistant-message="7"]');
    await ready(result);
    await result.getByRole('heading', { name: 'Inspection plan live', exact: true }).waitFor();
    assert.equal(await review.locator('tbody tr').count(), 116);
    assert.equal(await page.getByRole('button', { name: 'Restart demo' }).count(), 0);
    assert.equal(await page.getByText('Working on your inspection plan…', { exact: true }).count(), 0);

    await textbox.fill('another request');
    await textbox.press('Enter');
    const nextPlan = page.locator('[data-assistant-message="9"]');
    await ready(nextPlan);
    await inactive(result);
    assert.equal(await page.getByText('116 / 116 apartments scheduled', { exact: true }).count(), 1);
    assert.equal(await page.getByText('another request', { exact: true }).count(), 1);
    await nextPlan.getByRole('radio', { name: /Keep standard slot/ }).check();
    await nextPlan.getByRole('button', { name: 'Keep 4:30 PM' }).click();
    const standardReview = page.locator('[data-assistant-message="11"]');
    await ready(standardReview);
    await standardReview.getByText('Standard slot retained. Higher failed-access risk acknowledged;', { exact: false }).waitFor();
    await standardReview.getByRole('button', { name: 'Confirm & notify residents' }).click();
    const standardResult = page.locator('[data-assistant-message="13"]');
    await ready(standardResult);
    await standardResult.getByText('Amar’s 4:30 PM standard slot retained by operator', { exact: true }).waitFor();
    assert.equal(await page.locator('[data-assistant-message]').count(), 7);
    const followUp = await context.newPage();
    await followUp.goto(`${base}/oct-demo`);
    const followUpTextbox = followUp.getByRole('textbox', { name: 'Message the assistant' });
    await followUpTextbox.fill('first prompt');
    await followUpTextbox.press('Enter');
    const oldReply = followUp.locator('[data-assistant-message="2"]');
    await ready(oldReply);
    assert.equal(await oldReply.getByRole('button', { name: 'Use 5:45 PM' }).isEnabled(), true);
    await followUpTextbox.fill('a new unrelated prompt');
    await followUpTextbox.press('Enter');
    await inactive(oldReply);
    assert.equal(await oldReply.locator('fieldset').evaluate(element => element.disabled), true);
    await oldReply.getByRole('button', { name: 'Use 5:45 PM' }).dispatchEvent('click');
    assert.equal(await followUp.locator('[data-assistant-message]').count(), 2);
    await ready(followUp.locator('[data-assistant-message="4"]'));
    assert.equal(await oldReply.getByRole('heading', { name: 'Amar Sundaran', exact: true }).count(), 1);

    console.log('Desktop: streaming before Thinking, final Generating UI step before skeleton, synchronized skeleton geometry, bare Thinking, 40px full-width CTAs, append-only prompts and button decisions, disabled old controls, persistent route animation, 116-unit schedule and both branches PASS');

    const mobileContext = await browser.newContext({ viewport: { width: 320, height: 740 }, reducedMotion: 'reduce' });
    const mobile = await mobileContext.newPage();
    await mobile.goto(`${base}/oct-demo`);
    const mobileTextbox = mobile.getByRole('textbox', { name: 'Message the assistant' });
    await mobileTextbox.fill('anything');
    await mobileTextbox.press('Enter');
    const mobilePlan = mobile.locator('[data-assistant-message="2"]');
    await ready(mobilePlan);
    const overflow = await mobile.evaluate(() => [...document.querySelectorAll('.oct-demo, .oct-demo *')].filter(element => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).overflowX === 'visible').map(element => element.tagName));
    assert.deepEqual(overflow, []);
    await mobilePlan.getByRole('button', { name: 'Use 5:45 PM' }).click();
    const mobileRoute = mobile.locator('[data-assistant-message="4"]');
    await mobileRoute.locator('[data-unit="605"]').waitFor();
    assert.equal(await mobileRoute.locator('[data-unit="605"]').evaluate(element => getComputedStyle(element).transitionDuration), '0s');
    const mobileReview = mobile.locator('[data-assistant-message="5"]');
    await ready(mobileReview);
    const mobileAxe = await new AxeBuilder({ page: mobile }).include('.oct-demo').analyze();
    assert.deepEqual(mobileAxe.violations, []);
    assert.deepEqual(errors, []);
    console.log('Mobile: 320px reflow, reduced motion, append-only route and no automated accessibility violations PASS');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
