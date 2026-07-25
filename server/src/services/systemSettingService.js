import { SystemSetting } from "../models/SystemSetting.js";

export async function getSystemSetting() {
  let setting = await SystemSetting.findOne().sort({ updatedAt: -1 });
  if (!setting) {
    setting = await SystemSetting.create({});
  }
  return setting;
}
