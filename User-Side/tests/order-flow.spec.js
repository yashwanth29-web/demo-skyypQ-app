import { test, expect } from '@playwright/test';

test('order flow', async ({ page }) => {
  // 1. Go to homepage
  await page.goto('/');
  await expect(page).toHaveTitle(/RouteBite/);

  // 2. Navigate to discovery and click a restaurant (r1)
  // Let's directly navigate to the restaurant details page for testing simplicity
  await page.goto('/restaurant/r1');
  
  // 3. Verify restaurant name
  await expect(page.locator('h1')).toContainText('Bite Route Cafe');

  // 4. Add items to cart
  const addButton = page.getByRole('button', { name: 'ADD' }).first();
  await addButton.click();

  // 5. Verify floating cart appears
  const viewCart = page.getByText(/View Cart/i);
  await expect(viewCart).toBeVisible();

  // 6. Go to checkout
  await viewCart.click();

  // 7. Verify checkout page and items
  await expect(page.locator('h1')).toHaveText('Checkout');
  await expect(page.locator('text=Order Summary')).toBeVisible();
  
  // 8. Confirm order
  const confirmButton = page.getByRole('button', { name: 'Confirm Order' });
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();

  // 9. Verify redirect to tracking
  await expect(page).toHaveURL(/.*\/tracking/);
});
