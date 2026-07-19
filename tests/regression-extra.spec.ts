// Additional regression coverage for the regression branch.
//
// These scenarios extend coverage of the public storefront and intentionally
// avoid auth so they run reliably in CI without depending on account secrets.
// Every flow here was validated against the live demo store before being added.
// Same custom fixtures as the main spec: each test gets a fresh `allPages`.
import { test, expect } from './fixtures.js';

test.describe('Storefront navigation', () => {
  test('Verify that the About Us page opens from the navbar', async ({ allPages }) => {
    await allPages.homePage.clickAboutUsNav();
    await allPages.homePage.assertAboutUsTitle();
  });

  test('Verify that the Contact Us page opens from the navbar', async ({ allPages }) => {
    await allPages.homePage.clickOnContactUsLink();
    await allPages.contactUsPage.assertContactUsTitle();
  });

  test('Verify that Shop Now navigates to the All Products listing', async ({ allPages }) => {
    await allPages.homePage.clickOnShopNowButton();
    await allPages.allProductsPage.assertAllProductsTitle();
  });

  test('Verify that the user can return to Home from the navbar', async ({ allPages }) => {
    await allPages.homePage.clickOnContactUsLink();
    await allPages.contactUsPage.assertContactUsTitle();
    await allPages.homePage.clickBackToHomeButton();
    // Assert on the header Home menu item specifically (the footer also has a
    // "Home" item, so target it by its stable test id rather than text).
    await expect(allPages.page.getByTestId('header-menu-home')).toBeVisible();
  });
});

test.describe('Product browsing', () => {
  test('Verify that the product listing renders products', async ({ allPages }) => {
    await allPages.homePage.clickOnShopNowButton();
    await allPages.allProductsPage.assertAllProductsTitle();
    // The listing should contain at least one product card.
    await expect(allPages.allProductsPage.getNthProduct(1)).toBeVisible();
  });

  test('Verify that a user can open a product detail page', async ({ allPages }) => {
    await allPages.homePage.clickOnShopNowButton();
    await allPages.allProductsPage.assertAllProductsTitle();
    await allPages.allProductsPage.clickNthProduct(1);
    // Product detail pages live under /product/<slug>.
    await expect(allPages.page).toHaveURL(/\/product\//);
  });

  test('Verify that the Reviews and Additional Information tabs are available on a product', async ({ allPages }) => {
    await allPages.homePage.clickOnShopNowButton();
    await allPages.allProductsPage.assertAllProductsTitle();
    await allPages.allProductsPage.clickNthProduct(1);
    await allPages.productDetailsPage.assertReviewsTab();
    await allPages.productDetailsPage.clickOnAdditionalInfoTab();
    await allPages.productDetailsPage.assertAdditionalInfoTab();
  });

  test('Verify that the user can search products by keyword', async ({ allPages }) => {
    await allPages.homePage.clickOnShopNowButton();
    await allPages.allProductsPage.assertAllProductsTitle();
    await allPages.inventoryPage.searchProduct('GoPro');
    // After searching for an existing product, at least one result should remain.
    await expect(allPages.allProductsPage.getNthProduct(1)).toBeVisible();
  });
});

test.describe('Contact form', () => {
  test('Verify that a visitor can submit the Contact Us form', async ({ allPages }) => {
    await allPages.homePage.clickOnContactUsLink();
    await allPages.contactUsPage.assertContactUsTitle();
    await allPages.contactUsPage.fillContactUsForm();
    await allPages.contactUsPage.verifySuccessContactUsFormSubmission();
  });
});
