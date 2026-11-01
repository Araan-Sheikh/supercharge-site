import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir:'tests/plugins',testMatch:'**/*.spec.ts',timeout:60000,use:{baseURL:'http://127.0.0.1:3018',screenshot:'only-on-failure'},webServer:{command:'node scripts/plugin-test-server.mjs',url:'http://127.0.0.1:3018/admin/plugins',reuseExistingServer:!process.env.CI,timeout:120000} });
