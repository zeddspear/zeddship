import { expect, test } from "@playwright/test";
import { login,signUp,setupE2ETest } from "./utils";

test.describe("User Auth Flow",()=>{
    const userEmail = "test@test.io";
    const userPassword = "test123456";
    const userName = "testuser";
    test.beforeEach(setupE2ETest);
    test.beforeEach(async ({ page }) => {
      await page.goto("http://localhost:5173");
    });
    test("new user can signup", async ({ browser, page }) => {
      await signUp(page, userEmail, userPassword, userName);
    });
})
