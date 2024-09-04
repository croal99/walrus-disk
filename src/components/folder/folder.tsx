import React, {useEffect, useState} from "react";
import {Form, Link, useLoaderData} from "react-router-dom";
import {Box, Button, Card, Flex, Text, Dialog, TextField, Table, Inset, Strong} from "@radix-ui/themes";
import {
    getChildFiles,
    removeFileStore
} from "@/hooks/useFileStore.ts";
import {
    checkFolderIsExist,
    createFolder,
    getChildFolders,
    getCurrentFolder, getFolderPWD,
    removeFolderStore
} from "@/hooks/useFolderStore.ts";

import type {FolderOnStore} from "@/types/FolderOnStore.ts";
import type {FileOnStore} from "@/types/FileOnStore.ts";
import UploadFile from "@/components/explorer/uploadFile.tsx";
import Explorer from "@/components/explorer/explorer.tsx";

export async function loader({params}) {
    // console.log('get folder', params)
    const root = await getCurrentFolder(params.id);
    return {root};
}

export async function action({request, params}) {
    // console.log('create folder action', params)
    const formData = await request.formData();
    const newFolder = Object.fromEntries(formData) as FolderOnStore;
    await createFolder(newFolder);

    return {}
}

export default function Folder() {
    const [isNameValid, setIsNameValid] = useState(true);
    const [fileList, setFileList] = useState<FileOnStore[]>([]);
    const [folderList, setFolderList] = useState<FolderOnStore[]>([]);
    const [pwdList, setPWDList] = useState<FolderOnStore[]>([]);

    const {root} = useLoaderData();

    const getParent = async (dir) => {
        const pwd = await getFolderPWD(dir);
        // console.log('get', dir, pwd);
        setPWDList(pwd);
    }

    const fetchFolders = async (parentId) => {
        const list = await getChildFolders(parentId);
        setFolderList(list)
    }

    const fetchFiles = async (parentId) => {
        const list = await getChildFiles(parentId)
        setFileList(list);
    }

    const removeFolder = async (folderInfo: FolderOnStore) => {
        await removeFolderStore(folderInfo)
        await fetchFolders(root.id)
    }

    const removeFile = async (fileInfo: FileOnStore) => {
        await removeFileStore(fileInfo)
        await fetchFiles(root.id)
    }

    const fetchData = async () => {
        // console.log('fetch dir', root);
        await getParent(root);
        await fetchFolders(root.id);
        await fetchFiles(root.id);
    };

    useEffect(() => {
        fetchData().then(() => {
            // console.log('end fetch');
        });

    }, [root]);

    return (
        <>
            <Box className="explorer">
                <Flex px="3" gap="3" align="baseline">
                    <Text>/</Text>
                    {pwdList.map((item, index) => (
                        <Text key={index}>
                            {item.id === root.id ? <Text>{item.name}</Text> :
                                <Link to={"/folder/" + item.id}
                                      style={{textDecoration: 'none'}}>
                                    <Text>{item.name}</Text>
                                </Link>}
                            <Text> /</Text>
                        </Text>
                    ))}

                    <Text> &gt; </Text>

                    <Flex gap="3" mt="4" justify="end">
                        <Dialog.Root>
                            <Dialog.Trigger>
                                <Button onClick={
                                    async () => {
                                        const newFolder = {
                                            parentId: root.id,
                                            name: "New Folder",
                                        }
                                        const isExist = await checkFolderIsExist(newFolder as FolderOnStore)
                                        if (isExist) {
                                            setIsNameValid(false)
                                        } else {
                                            setIsNameValid(true)
                                        }

                                    }
                                }>New Folder</Button>
                            </Dialog.Trigger>

                            <Dialog.Content maxWidth="450px">
                                <Dialog.Title>New folder</Dialog.Title>
                                <Dialog.Description size="2" mb="4">
                                </Dialog.Description>

                                <Form method="post">
                                    <Flex direction="column" gap="3">
                                        <label>
                                            <Text as="div" size="2" mb="1" weight="bold">
                                                Input the folder's name
                                            </Text>
                                            <TextField.Root
                                                placeholder="Input new folder's name."
                                                aria-label="folder's name"
                                                type="text"
                                                name="name"
                                                defaultValue="New Folder"
                                                onChange={
                                                    async (e) => {
                                                        const newFolder = {
                                                            parentId: root.id,
                                                            name: e.target.value,
                                                        }
                                                        const isExist = await checkFolderIsExist(newFolder as FolderOnStore)
                                                        if (isExist) {
                                                            setIsNameValid(false)
                                                        } else {
                                                            setIsNameValid(true)
                                                        }
                                                    }
                                                }
                                            />
                                            <input type="hidden" value={root.id} name="parentId"/>
                                        </label>
                                    </Flex>

                                    <Flex gap="3" mt="4" justify="end">
                                        <Dialog.Close>
                                            <Button variant="soft" color="gray">
                                                Cancel
                                            </Button>
                                        </Dialog.Close>
                                        <Dialog.Close>
                                            <Button type="submit" disabled={!isNameValid}>New</Button>
                                        </Dialog.Close>
                                    </Flex>
                                </Form>
                            </Dialog.Content>
                        </Dialog.Root>

                        <UploadFile
                            root={root}
                            reFetchDir={fetchData}
                        />
                    </Flex>
                </Flex>
                <Box className="explorer-nav">
                </Box>

                <Explorer
                    folders={folderList}
                    files={fileList}
                    removeFolder={removeFolder}
                    removeFile={removeFile}
                    />
            </Box>
        </>
    );
}

