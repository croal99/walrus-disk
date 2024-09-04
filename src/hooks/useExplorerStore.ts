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
    // folders.unshift(newFolder);
    folders.push(newFolder);
    await setFolders(folders);

    return newFolder;
}

export async function removeFolderStore(folderInfo: FolderOnStore) {
    const folders = await getAllFolders();

    for (let i = 0; i < folders.length; i++) {
        if (folders[i].id === folderInfo.id ) {
            folders.splice(i, 1);
            break;
        }
    }
    await setFolders(folders);

    return folders
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
