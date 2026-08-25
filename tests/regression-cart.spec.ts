// Unique regression coverage: shopping cart & product detail flows.
//
// Distinct from regression-extra.spec.ts (which covers navigation/search) and
// from the main ecommerce spec (login-based journeys). These are no-login cart
// scenarios, each validated green against the live demo store before adding.
import { test, expect } from './fixtures.js';

// Open the product listing and click into the first product detail page.
async function openFirstProduct(allPages: import('../pages/AllPages.js').default) {
  await allPages.homePage.clickOnShopNowButton();
  await allPages.allProductsPage.assertAllProductsTitle();
  await allPages.allProductsPage.clickNthProduct(1);
  await expect(allPages.page).toHaveURL(/\/product\//);
}

test.describe('Cart', () => {
  test('Verify that a product can be added to the cart from its detail page', async ({ allPages }) => {
    await openFirstProduct(allPages);
    await allPages.productDetailsPage.clickAddToCartButton(); // asserts "Added to the cart"
  });

  test('Verify that an added product appears in the cart', async ({ allPages }) => {
    await openFirstProduct(allPages);
    await allPages.productDetailsPage.clickAddToCartButton();
    await allPages.cartPage.clickOnCartIcon();
    await allPages.cartPage.assertYourCartTitle();
    await expect(allPages.cartPage.getCartItemName().first()).toBeVisible();
  });

  test('Verify that the cart quantity can be increased', async ({ allPages }) => {
    await openFirstProduct(allPages);
    await allPages.productDetailsPage.clickAddToCartButton();
    await allPages.cartPage.clickOnCartIcon();
    await allPages.cartPage.assertYourCartTitle();
    await allPages.cartPage.clickIncreaseQuantityButton();
    await allPages.cartPage.verifyIncreasedQuantity('2');
  });

  test('Verify that the cart shows an order summary (subtotal and total)', async ({ allPages }) => {
    await openFirstProduct(allPages);
    await allPages.productDetailsPage.clickAddToCartButton();
    await allPages.cartPage.clickOnCartIcon();
    await allPages.cartPage.assertYourCartTitle();
    await expect(allPages.cartPage.getSubtotalValue()).toBeVisible();
    await expect(allPages.cartPage.getTotalValue()).toBeVisible();
    await expect(allPages.cartPage.getCheckoutButton()).toBeVisible();
  });

  test('Verify that a product can be removed, emptying the cart', async ({ allPages }) => {
    await openFirstProduct(allPages);
    await allPages.productDetailsPage.clickAddToCartButton();
    await allPages.cartPage.clickOnCartIcon();
    await allPages.cartPage.assertYourCartTitle();
    await allPages.cartPage.getRemoveCartItem().first().click({ force: true });
    await allPages.cartPage.verifyEmptyCartMessage();
  });
});

test.describe('Product detail', () => {
  test('Verify that the product name matches between listing and detail page', async ({ allPages }) => {
    await allPages.homePage.clickOnShopNowButton();
    await allPages.allProductsPage.assertAllProductsTitle();
    const listName = (await allPages.allProductsPage.getNthProductName(1))?.trim();
    await allPages.allProductsPage.clickNthProduct(1);
    await expect(allPages.page).toHaveURL(/\/product\//);
    await expect(allPages.page.locator('h1').first()).toHaveText(listName ?? '');
  });

  test('Verify that the product quantity can be increased on the detail page', async ({ allPages }) => {
    await openFirstProduct(allPages);
    await allPages.productDetailsPage.clickPlusIconToAddQuantity();
    await expect(allPages.productDetailsPage.getTotalQuantity()).toHaveText('2');
  });

  test('Verify that the Reviews tab can be opened on a product', async ({ allPages }) => {
    await openFirstProduct(allPages);
    await allPages.productDetailsPage.clickOnReviewsTab();
    await allPages.productDetailsPage.assertReviewsTab();
  });

  test('Verify that the Additional Information tab can be opened on a product', async ({ allPages }) => {
    await openFirstProduct(allPages);
    await allPages.productDetailsPage.clickOnAdditionalInfoTab();
    await allPages.productDetailsPage.assertAdditionalInfoTab();
  });
});
