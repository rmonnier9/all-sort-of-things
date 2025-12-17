// to use in dev console at https://www.linkedin.com/mynetwork/network-manager/people-follow/following/
(() => { function getAllButtons() { return document.querySelectorAll('button[aria-label*="stop following"]'); }

async function unfollowAll() { const buttons = getAllButtons(); for (let button of buttons) { button.click(); await new Promise((resolve) => setTimeout(resolve, 100)); const confirmBtn = document.querySelector('[role="alertdialog"] button[data-test-dialog-primary-btn]'); if (confirmBtn) { confirmBtn.click(); } await new Promise((resolve) => setTimeout(resolve, 50)); } }

async function run() { await unfollowAll(); window.scrollTo(0, document.body.scrollHeight); await new Promise((resolve) => setTimeout(resolve, 1000)); const buttons = getAllButtons(); if (buttons.length) run(); }

run(); })();
