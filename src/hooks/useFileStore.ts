import localforage from "localforage";
import {matchSorter} from "match-sorter";
import {FolderOnStore} from "@/types/FolderOnStore.ts";
import {FileOnStore} from "@/types/FileOnStore.ts";

const KEY_FILE = "files";

// ------ File Api ------

export async function getAllFiles() {
    const files: FileOnStore[] | null = await localforage.getItem(KEY_FILE);
    if (files) {
        return files
    } else {
        return [];
    }
}

export async function getChildFiles(parentId) {
    // console.log('current child folders', folderId);
    const files: FileOnStore[] | null = await localforage.getItem(KEY_FILE);
    if (!files) {
        return []
    }

    if (parentId) {
        return matchSorter(files, parentId, {keys: ["parentId"]});
    }
    return [];
}

export async function checkFileIsExist(newFile: FileOnStore) {
    const folders = await getChildFiles(newFile.parentId);

    // 检查是否已经创建
    return matchSorter(folders, newFile.name, {keys: ["name"]}).length > 0
}

export async function createFile(newFile: FileOnStore) {
    const iconType = ["png", "text/plain"];
    const iconFile = ["image.png", "txt.png"];

    // 检查是否已经创建
    if (await checkFileIsExist(newFile)) {
        return false;
    }

    console.log('create file', newFile.mediaType)
    newFile.id = Math.random().toString(36).substring(2, 12);
    newFile.createAt = Date.now();

    // icon
    newFile.icon = "default.png";
    for (const key in iconType) {
        if (newFile.mediaType.indexOf(iconType[key]) != -1) {
            console.log('find', key, iconType[key]);
            newFile.icon = iconFile[key];
            break;
        }
    }

    const files = await getAllFiles();
    // files.unshift(newFile);
    files.push(newFile);
    await setFiles(files);

    return newFile;
}

export async function removeFileStore(fileInfo: FileOnStore) {
    const files = await getAllFiles();

    for (let i = 0; i < files.length; i++) {
        if (files[i].id === fileInfo.id ) {
            files.splice(i, 1);
            break;
        }
    }
    await setFiles(files);

    return files
}

function setFiles(items) {
    return localforage.setItem(KEY_FILE, items);
}
