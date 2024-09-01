import localforage from "localforage";
import {SettingOnStore} from "@/types/SettingOnStore.ts";
import CryptoJS from "crypto-js"

const KEY_SETTING = "setting";

// ------ Setting Api ------
export async function getSetting() {
    const defaultSetting: SettingOnStore = {
        username: "walrus",
        password: "password",
        aggregator: "https://aggregator-devnet.walrus.space",
        publisher: "https://publisher-devnet.walrus.space",
        salt: "",
    }

    const setting: SettingOnStore | null = await localforage.getItem(KEY_SETTING);
    if (!setting) {
        // 初始化配置
        defaultSetting.salt = Math.random().toString(36).substring(2, 12);
        defaultSetting.password = defaultSetting.salt + ':' + CryptoJS.SHA1(defaultSetting.password + defaultSetting.salt).toString();
        await setSettings(defaultSetting)
        return defaultSetting
    } else {
        return setting;
    }
}

function setSettings(items) {
    return localforage.setItem(KEY_SETTING, items);
}
