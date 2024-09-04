import React, {useEffect, useState} from "react";
import {Form, Link, redirect, useLoaderData} from "react-router-dom";
import {Box, Button, Card, Flex, Text, Dialog, TextField, Table, Inset, Strong} from "@radix-ui/themes";
import {
    getChildFiles,
    removeFileStore
} from "@/hooks/useFileStore.ts";
import {
    checkFolderIsExist,
    createFolder,
    getChildFolders,
    getCurrentFolder,
    removeFolderStore
} from "@/hooks/useFolderStore.ts";
import dayjs from "dayjs";

import type {FolderOnStore} from "@/types/FolderOnStore.ts";
import type {FileOnStore} from "@/types/FileOnStore.ts";
import Detail from "@/components/home/detail.tsx";
import UploadFile from "@/components/home/uploadFile.tsx";

import {humanFileSize} from "@/utils/formatSize.ts";

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

export default function Explorer() {
    const [isNameValid, setIsNameValid] = useState(true);
    const [fileList, setFileList] = useState<FileOnStore[]>([]);
    const [folderList, setFolderList] = useState<FolderOnStore[]>([]);

    const {root} = useLoaderData();

    const fetchFolders = async (parentId) => {
        const list = await getChildFolders(parentId);
        setFolderList(list)
    }

    const removeFolder = async (folderInfo: FolderOnStore) => {
        await removeFolderStore(folderInfo)
        await fetchData();
    }

    const fetchFiles = async (parentId) => {
        const list = await getChildFiles(parentId)
        setFileList(list);
    }

    const removeFile = async (fileInfo: FileOnStore) => {
        // console.log('remove file', fileInfo)
        await removeFileStore(fileInfo)
        await fetchData();
    }

    const fetchData = async () => {
        // console.log('fetch dir', root);
        await fetchFolders(root.id)
        await fetchFiles(root.id)
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
                    <Text> {root.name}</Text>

                    <Text> &gt; </Text>

                    <Flex gap="3" mt="4" justify="end" width="80vw">
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

                <Flex px="3" py="3" gap="3" direction="column">
                    <Card>
                        <Table.Root>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Create</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Size</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {folderList.map((item, index) => (
                                    <Table.Row key={index}>
                                        <Table.RowHeaderCell>
                                            <Flex align="center">
                                                <img src='/public/folder.png' alt="" style={{height: '32px'}}/>
                                                <Link to={"/folder/" + item.id}><Text>{item.name}</Text></Link>
                                            </Flex>
                                        </Table.RowHeaderCell>
                                        <Table.Cell>
                                                {dayjs(item.createAt).format('YYYY/MM/DD')}
                                        </Table.Cell>
                                        <Table.Cell></Table.Cell>
                                        <Table.Cell>
                                            <Dialog.Root>
                                                <Dialog.Trigger>
                                                    <Button color="red">Delete</Button>
                                                </Dialog.Trigger>

                                                <Dialog.Content maxWidth="450px">
                                                    <Dialog.Title>Delete Folder</Dialog.Title>
                                                    <Dialog.Description size="2" mb="4">
                                                    </Dialog.Description>

                                                    <Flex direction="column" gap="3">
                                                        <Text size="3" >
                                                            Are you sure you want to delete the folder:
                                                        </Text>
                                                        <Text size="3" mb="1" weight="bold">
                                                            <Strong>{item.name}</Strong>
                                                        </Text>

                                                    </Flex>

                                                    <Flex gap="3" mt="4" justify="end">
                                                        <Dialog.Close>
                                                            <Button variant="soft" color="gray">
                                                                Cancel
                                                            </Button>
                                                        </Dialog.Close>
                                                        <Dialog.Close>
                                                            <Button color="red"
                                                                    onClick={() => removeFolder(item)}>
                                                                Delete
                                                            </Button>
                                                        </Dialog.Close>
                                                    </Flex>
                                                </Dialog.Content>
                                            </Dialog.Root>

                                        </Table.Cell>
                                    </Table.Row>
                                ))}

                                {fileList.map((item, index) => (
                                    <Table.Row key={index}>
                                        <Table.RowHeaderCell>
                                            <Flex align="center" gap="2">
                                                <img src={`/public/${item.icon}`} alt="" style={{height: '32px'}}/>
                                                {item.name}
                                            </Flex>
                                        </Table.RowHeaderCell>
                                        <Table.Cell style={{width:250}}>{dayjs(item.createAt).format('YYYY/MM/DD HH:mm:ss')}</Table.Cell>
                                        <Table.Cell style={{width:150}}>{humanFileSize(item.size)}</Table.Cell>
                                        <Table.Cell style={{width:100}}>
                                            <Flex gap="3">
                                                <Dialog.Root>
                                                    <Dialog.Trigger>
                                                        <Button color="red">Delete</Button>
                                                    </Dialog.Trigger>

                                                    <Dialog.Content maxWidth="450px">
                                                        <Dialog.Title>Delete File</Dialog.Title>
                                                        <Dialog.Description size="2" mb="4">
                                                        </Dialog.Description>

                                                        <Flex direction="column" gap="3">
                                                            <Text size="3" >
                                                                Are you sure you want to delete the file:
                                                            </Text>
                                                            <Text size="3" mb="1" weight="bold">
                                                                <Strong>{item.name}</Strong>
                                                            </Text>

                                                        </Flex>

                                                        <Flex gap="3" mt="4" justify="end">
                                                            <Dialog.Close>
                                                                <Button variant="soft" color="gray">
                                                                    Cancel
                                                                </Button>
                                                            </Dialog.Close>
                                                            <Dialog.Close>
                                                                <Button color="red"
                                                                        onClick={() => removeFile(item)}>
                                                                    Delete
                                                                </Button>
                                                            </Dialog.Close>
                                                        </Flex>
                                                    </Dialog.Content>
                                                </Dialog.Root>

                                                <Detail
                                                    walrusFile={item}
                                                />

                                            </Flex>

                                        </Table.Cell>
                                    </Table.Row>
                                ))}

                            </Table.Body>
                        </Table.Root>

                    </Card>
                </Flex>
            </Box>
        </>
    );
}

