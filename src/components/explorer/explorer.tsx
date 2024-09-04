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
import dayjs from "dayjs";

import type {FolderOnStore} from "@/types/FolderOnStore.ts";
import type {FileOnStore} from "@/types/FileOnStore.ts";
import Detail from "@/components/explorer/detail.tsx";

import {humanFileSize} from "@/utils/formatSize.ts";

export default function Explorer(
    {
        folders,
        files,
    }) {
    const [fileList, setFileList] = useState<FileOnStore[]>([]);
    const [folderList, setFolderList] = useState<FolderOnStore[]>([]);

    const removeFolder = async (folderInfo: FolderOnStore) => {
        await removeFolderStore(folderInfo)
        const list = await getChildFolders(folderInfo.parentId)
        await setFolderList(list);
    }

    const removeFile = async (fileInfo: FileOnStore) => {
        await removeFileStore(fileInfo)
        const list = await getChildFiles(fileInfo.parentId)
        await setFileList(list);
    }

    const fetchFolders = async (parentId) => {
        const list = await getChildFolders(parentId);
        setFolderList(list)
    }

    const fetchFiles = async (parentId) => {
        const list = await getChildFiles(parentId)
        setFileList(list);
    }
    //
    // const fetchData = async () => {
    //     // console.log('fetch dir', root);
    //     await fetchFolders(root.id)
    //     await fetchFiles(root.id)
    // };
    //
    // useEffect(() => {
    //     fetchData().then(() => {
    //         // console.log('end fetch');
    //     });
    //
    // }, [root]);

    useEffect(() => {
        setFolderList(folders)

    }, [folders]);

    useEffect(() => {
        setFileList(files)

    }, [files]);

    return (
        <>
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
                                            <img src='/folder.png' alt="" style={{height: '32px'}}/>
                                            <Link to={"/folder/" + item.id}
                                                  style={{textDecoration: 'none'}}><Text>{item.name}</Text></Link>
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
                                                    <Text size="3">
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
                                            <img src={`/${item.icon}`} alt="" style={{height: '32px'}}/>
                                            {item.name}
                                        </Flex>
                                    </Table.RowHeaderCell>
                                    <Table.Cell
                                        style={{width: 250}}>{dayjs(item.createAt).format('YYYY/MM/DD HH:mm:ss')}</Table.Cell>
                                    <Table.Cell style={{width: 150}}>{humanFileSize(item.size)}</Table.Cell>
                                    <Table.Cell style={{width: 100}}>
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
                                                        <Text size="3">
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
        </>
    );
}

