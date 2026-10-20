# Claude Usage (Chrome extension)

Shows your claude.ai plan usage (current session and weekly limits) in a toolbar popup, with the current-session % on the icon badge. Refreshes every 5 minutes.

## Install
1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select this folder.
3. Make sure you're logged in at https://claude.ai.

It uses your existing claude.ai login cookies to call the same internal endpoint the Settings → Usage page uses (`/api/organizations/{org}/usage`). That endpoint is undocumented and may change.
