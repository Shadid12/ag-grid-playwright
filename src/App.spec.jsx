import { test, expect } from '@playwright/experimental-ct-react';
import App from './App';

test('should render component with AG Grid', async ({ mount }) => {
  // Mount the component
  const component = await mount(<App />);

  // Verify that the AG Grid is rendered by checking for a specific element
  await expect(component.locator('.ag-root')).toBeVisible();

  // Optionally, verify that specific columns are rendered
  await expect(component.locator('.ag-header-cell-text').nth(0)).toHaveText('Make');
  await expect(component.locator('.ag-header-cell-text').nth(1)).toHaveText('Model');
  await expect(component.locator('.ag-header-cell-text').nth(2)).toHaveText('Price');

  // Optionally, verify that a specific row is rendered
  await expect(component.locator('.ag-cell').nth(0)).toHaveText('Tesla');
  await expect(component.locator('.ag-cell').nth(1)).toHaveText('Model Y');
  await expect(component.locator('.ag-cell').nth(2)).toHaveText('64950');
});

test('should sort data by price when clicking on column headers', async ({ mount, page }) => {
  // 1. Mount the component
  const component = await mount(<App />);
  await page.waitForSelector('.ag-header-cell-label');

  // 2. Click on the "Price" column header (first click for ascending order)
  const priceHeader = component.locator('.ag-header-cell-text', { hasText: 'Price' });
  await expect(priceHeader).toBeVisible();
  await priceHeader.click();

  // 3. Determine how many rows are rendered
  const rowCount = await component.locator('.ag-row').count();

  // 4. Gather prices in ascending order (row-index)
  const allPricesAsc = [];
  for (let i = 0; i < rowCount; i++) {
    const price = await component
      .locator(`.ag-row[row-index="${i}"] [col-id="price"]`)
      .innerText();
    allPricesAsc.push(price);
  }

  // 5. Verify the ascending sort order
  expect(allPricesAsc).toEqual(['15774', '20675', '29600', '33850', '48890', '64950']);

  // 6. Click the "Price" column header again (second click for descending order)
  await priceHeader.click();

  // 7. Gather prices in descending order (row-index)
  const allPricesDesc = [];
  for (let i = 0; i < rowCount; i++) {
    const price = await component
      .locator(`.ag-row[row-index="${i}"] [col-id="price"]`)
      .innerText();
    allPricesDesc.push(price);
  }

  // 8. Verify the descending sort order
  expect(allPricesDesc).toEqual(['64950', '48890', '33850', '29600', '20675', '15774']);
});


test('should resize the columns when dragging the column resize handle', async ({ mount, page }) => {
  // 1. Mount the component
  const component = await mount(<App />);
  await page.waitForSelector('.ag-header-cell-resize');

  // 2. Locate the resize handle for the "Make" column
  const makeColumnResizeHandle = component.locator(
    '.ag-header-cell[col-id="make"] .ag-header-cell-resize'
  );

  // Ensure the resize handle is visible
  await expect(makeColumnResizeHandle).toBeVisible();

  // 3. Get the initial width of the "Make" column
  const makeColumn = component.locator('.ag-header-cell[col-id="make"]');
  const initialWidth = await makeColumn.evaluate((el) => el.offsetWidth);

  // 4. Perform the drag action to resize the column
  const resizeHandleBox = await makeColumnResizeHandle.boundingBox(); // Get resize handle position
  if (resizeHandleBox) {
    await page.mouse.move(resizeHandleBox.x + resizeHandleBox.width / 2, resizeHandleBox.y + resizeHandleBox.height / 2); // Move mouse to resize handle
    await page.mouse.down(); // Hold the mouse button down
    await page.mouse.move(resizeHandleBox.x + resizeHandleBox.width / 2 + 50, resizeHandleBox.y + resizeHandleBox.height / 2); // Drag to resize
    await page.mouse.up(); // Release the mouse button
  }

  // 5. Get the new width of the "Make" column
  const newWidth = await makeColumn.evaluate((el) => el.offsetWidth);

  // 6. Verify that the column width has increased
  expect(newWidth).toBeGreaterThan(initialWidth);
});
