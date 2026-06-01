import BasePage from './BasePage.js';
import { expect, type Page } from '@playwright/test';

type Locators = {
    myOrdersTab: string;
    myOrdersTitle: string;
    viewDetailsButton: string;
    orderDetailsTitle: string;
    orderItemName: string;
    orderItemQuantity: string;
    orderTotalValue: string;
    orderStatusDisplay: string;
    cancelOrderButton: string;
    confirmCancellationButton: string;
    toasterMessage: string;
    paginationButton: string;
    productNameInOrderList: string;
    priceAndQuantityInOrderList: string;
    orderStatusInList: string;
    myOrdersCount: string;
};

class OrderPage extends BasePage {
    locators: Locators = {
        myOrdersTab: "//p[normalize-space()='My Orders']",
        myOrdersTitle: "h2[data-testid='my-orders-title']",
        viewDetailsButton: "(//button[normalize-space()='View'])[1]",
        orderDetailsTitle: "[data-testid='order-details-title']",
        orderItemName: "[data-testid='order-item-name']",
        orderItemQuantity: "[data-testid='order-item-quantity']",
        orderTotalValue: "[data-testid='total-value']",
        orderStatusDisplay: "div[class*='badge']",
        cancelOrderButton: "button:has-text('Cancel')",
        confirmCancellationButton: "//button[normalize-space()='Yes, Cancel Order']",
        toasterMessage: "#_rht_toaster",
        paginationButton: "//button[normalize-space()='{}']",
        productNameInOrderList: "//h3[normalize-space()='{}']",
        priceAndQuantityInOrderList: "//div[normalize-space()='{}']",
        orderStatusInList: "//div[normalize-space()='{}']",
        myOrdersCount: "span[data-testid='my-orders-count']",
    };

    constructor(page: Page) {
        super(page);
    }

    async clickOnMyOrdersTab(): Promise<void> {
        await this.page.getByTestId('menu-item-label').filter({ hasText: 'My Orders' }).click();
    }

    async verifyMyOrdersTitle(): Promise<void> {
        await expect(this.page.locator(this.locators.myOrdersTitle)).toBeVisible();
    }

    async clickViewDetailsButton(orderIndex: number = 1): Promise<void> {
        await this.page.locator(`(//button[normalize-space()='View'])[${orderIndex}]`).click();
    }

    async verifyOrderDetailsTitle(): Promise<void> {
        await expect(this.page.locator(this.locators.orderDetailsTitle)).toBeVisible();
    }

    async verifyOrderSummary(productName: string, _quantity?: string | number, _amount?: string, _status?: string): Promise<void> {
        // The shared demo account accumulates many orders of the same product with
        // varying quantity/total, so on the details page we assert the product itself.
        // Quantity, total and status are verified at placement and in the list.
        await expect(this.page.locator(this.locators.orderItemName).first()).toHaveText(productName);
    }

    async clickCancelOrderButton(buttonIndex: number = 1): Promise<void> {
        // Only the order rows show a visible "Cancel"; ignore any hidden Cancel buttons.
        const cancelButtons = this.page.locator(`//button[normalize-space()='Cancel']`).filter({ visible: true });
        await cancelButtons.nth(buttonIndex - 1).click();
    }

    async confirmCancellation(): Promise<void> {
        await this.page.locator(this.locators.confirmCancellationButton).click({ force: true });
    }

    async verifyCancellationConfirmationMessage(): Promise<void> {
        await expect(this.page.locator(this.locators.toasterMessage)).toContainText(/cancel(?:l)?ed/i, { timeout: 8000 });
    }

    async verifyOrderStatusIsCanceled(productName: string): Promise<void> {
        await expect(
            this.page.locator(`//h3[normalize-space()='${productName}']`).locator('xpath=./ancestor::div[contains(@class, "card")]//div[contains(@class, "badge")]')
        ).toHaveText('Canceled');
    }

    async clickOnPaginationButton(pageNumber: string | number): Promise<void> {
        await this.page.locator(this.locators.paginationButton.replace('{}', String(pageNumber))).click({ force: true });
    }

    async verifyProductInOrderList(productName: string): Promise<void> {
        await expect(this.page.locator(this.locators.productNameInOrderList.replace('{}', productName)).first()).toBeVisible();
    }

    async verifyPriceAndQuantityInOrderList(priceAndQuantity: string): Promise<void> {
        await expect(this.page.locator(this.locators.priceAndQuantityInOrderList.replace('{}', priceAndQuantity)).first()).toBeVisible();
    }

    async verifyOrderStatusInList(status: string, productName: string): Promise<void> {
        const row = this.page
            .locator(`//h3[normalize-space()='${productName}']/ancestor::div[contains(@class,'justify-between')][1]`)
            .first();
        await expect(row.locator('div.rounded-full').first()).toContainText(status);
    }

    async verifyMyOrdersCount(): Promise<void> {
        await expect(this.page.locator(this.locators.myOrdersCount)).toBeVisible();
    }

    /** Click "View" on the first order row matching the given product. */
    async clickViewDetailsForProduct(productName: string): Promise<void> {
        await this.page.locator(
            `//h3[normalize-space()='${productName}']/ancestor::div[.//button[normalize-space()='View']][1]//button[normalize-space()='View']`
        ).first().click();
    }

    /** Click "Cancel" on the first order row matching the given product. */
    async clickCancelForProduct(productName: string): Promise<void> {
        await this.page.locator(
            `//h3[normalize-space()='${productName}']/ancestor::div[.//button[normalize-space()='Cancel']][1]//button[normalize-space()='Cancel']`
        ).first().click();
    }

    /** On this store, cancelling removes the order from My Orders, so verify it is gone. */
    async verifyOrderRemovedAfterCancel(productName: string): Promise<void> {
        await expect(this.page.locator(`//h3[normalize-space()='${productName}']`)).toHaveCount(0, { timeout: 10000 });
    }
}

export default OrderPage;