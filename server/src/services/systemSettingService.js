import {
  DEFAULT_SYSTEM_PROMPT,
  LEGACY_SUPPORT_SYSTEM_PROMPT,
  PREVIOUS_GENERAL_SYSTEM_PROMPT,
  SystemSetting,
} from "../models/SystemSetting.js";

export async function getSystemSetting() {
  let setting = await SystemSetting.findOne().sort({ updatedAt: -1 });
  if (!setting) {
    setting = await SystemSetting.create({});
  } else if (
    setting.systemPrompt === LEGACY_SUPPORT_SYSTEM_PROMPT ||
    setting.systemPrompt === PREVIOUS_GENERAL_SYSTEM_PROMPT ||
    /support\s*sphere|supportsphere/i.test(setting.systemPrompt)
  ) {
    setting.systemPrompt = DEFAULT_SYSTEM_PROMPT;
    await setting.save();
  }
  return setting;
}
