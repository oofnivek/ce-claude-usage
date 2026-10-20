import { fetchUsage, recordError } from "./api.js";

const ALARM = "refresh-usage";

async function refresh() {
  try {
    await fetchUsage();
  } catch (err) {
    await recordError(err);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM, { periodInMinutes: 5 });
  refresh();
});

chrome.runtime.onStartup.addListener(refresh);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM) refresh();
});
