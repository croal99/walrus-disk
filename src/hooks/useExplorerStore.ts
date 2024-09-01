import localforage from "localforage";
import {matchSorter} from "match-sorter";
import {FolderOnStore} from "@/types/FolderOnStore.ts";
import {FileOnStore} from "@/types/FileOnStore.ts";

const KEY_FOLDER = "folders";
const KEY_FILE = "files";


// ------ Folder Api ------
export async function getAllFolders() {
    // console.log('current folder', folderId);
    const root: FolderOnStore = {
        id: '0',
        name: '/',
        createAt: Date.now(),
        parentId: "",
    }

    const folders: FolderOnStore[] | null = await localforage.getItem(KEY_FOLDER);
    if (folders) {
        return folders
    } else {
        return [root];
    }
}

export async function getCurrentFolder(folderId) {
    // console.log('current folder', folderId);
    const root: FolderOnStore = {
        id: '0',
        name: '/',
        createAt: 0,
        parentId: "",
    }

    const folders: FolderOnStore[] | null = await localforage.getItem(KEY_FOLDER);
    if (!folders) {
        return root
    }

    // 查询目录
    if (!folderId) {
        return root
    }
    for (const key in folders) {
        // console.log(key, folders[key])
        if (folders[key].id === folderId) {
            return folders[key]
        }
    }

    // 都没有找到
    return root;
}

export async function getChildFolders(parentId) {
    // console.log('current child folders', folderId);
    const folders: FolderOnStore[] | null = await localforage.getItem(KEY_FOLDER);
    if (!folders) {
        return []
    }

    if (parentId) {
        return matchSorter(folders, parentId, {keys: ["parentId"]});
    }
    return [];
}

export async function checkFolderIsExist(newFolder: FolderOnStore) {
    const folders = await getChildFolders(newFolder.parentId);

    // 检查是否已经创建
    return matchSorter(folders, newFolder.name, {keys: ["name"]}).length > 0
}

export async function createFolder(newFolder: FolderOnStore) {
    // 检查是否已经创建
    if (await checkFolderIsExist(newFolder)) {
        return false;
    }

    console.log('create folder')
    newFolder.id = Math.random().toString(36).substring(2, 12);
    newFolder.createAt = Date.now();
    const folders = await getAllFolders();
    folders.unshift(newFolder);
    await setFolders(folders);

    return newFolder;
}

function setFolders(items) {
    return localforage.setItem(KEY_FOLDER, items);
}

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
    // 检查是否已经创建
    if (await checkFileIsExist(newFile)) {
        return false;
    }

    console.log('create file')
    newFile.id = Math.random().toString(36).substring(2, 12);
    newFile.createAt = Date.now();
    const files = await getAllFiles();
    files.unshift(newFile);
    await setFiles(files);

    return newFile;
}

function setFiles(items) {
    return localforage.setItem(KEY_FILE, items);
}
