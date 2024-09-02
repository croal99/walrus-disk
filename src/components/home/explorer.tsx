import React, {useEffect, useState} from "react";
import {Form, Link, useLoaderData} from "react-router-dom";
import {Box, Button, Card, Flex, Text, Dialog, TextField, Progress, Inset, Strong} from "@radix-ui/themes";
import {
    checkFolderIsExist,
    createFolder,
    getChildFiles,
    getChildFolders,
    getCurrentFolder
} from "@/hooks/useExplorerStore.ts";
import dayjs from "dayjs";

import type {FolderOnStore} from "@/types/FolderOnStore.ts";
import type {FileOnStore} from "@/types/FileOnStore.ts";
import Detail from "@/components/home/detail.tsx";
import UploadFile from "@/components/home/uploadFile.tsx";

import {humanFileSize} from "@/utils/formatSize.ts";

export async function loader({params}) {
    // console.log('get folder', params)
    const root = await getCurrentFolder(params.id);
    console.log('current folder', root);
    const childs = await getChildFolders(params.id);
    console.log('current child folders', childs);
    return {root, childs};
}

export async function action({request, params}) {
    // console.log('create folder action', params)
    const formData = await request.formData();
    const newFolder = Object.fromEntries(formData) as FolderOnStore;
    await createFolder(newFolder);

    return {}
}

export default function Explorer() {
    const [isFormValid, setIsFormValid] = useState(true);
    const [fileList, setFileList] = useState<FileOnStore[]>([]);

    const {root, childs} = useLoaderData();
    // console.log('current Folders', folders);

    const fetchData = async () => {
        console.log('fetch data', root);
        const list = await getChildFiles(root.id)
        console.log('list', list)
        setFileList(list);
    };

    useEffect(() => {
        fetchData().then(() => {
            console.log('end fetch');
        });

    }, []);

    return (
        <>
            <Box className="explorer">
                <Box className="explorer-nav">
                    <Flex px="3" gap="3" className="explorer-nav-address">
                        <Text> {root.name}</Text>
                        <Text> &gt; </Text>
                        <Box px="3">
                        </Box>

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
                                            setIsFormValid(false)
                                        } else {
                                            setIsFormValid(true)
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
                                                            setIsFormValid(false)
                                                        } else {
                                                            setIsFormValid(true)
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
                                            <Button type="submit" disabled={!isFormValid}>Save</Button>
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
                </Box>

                <Flex px="3" py="3" gap="3">
                    {childs.map((item, index) => (
                        <Card key={index}>
                            <Link to={"/folder/" + item.id}><Text>{item.name}</Text></Link>
                        </Card>
                    ))}
                    {fileList.map((item, index) => (
                        <Box key={index}>
                            <Card>
                                <Flex gap="3">
                                    <Inset clip="padding-box" side="left" pb="current">
                                        <img src="/png.png" alt="" style={{height: '190px'}}/>
                                    </Inset>
                                    <Flex direction="column" gap="3">
                                        <Text><Strong>name: </Strong>{item.name}</Text>
                                        <Text><Strong>type: </Strong>{item.mediaType}</Text>
                                        <Text><Strong>size: </Strong>{humanFileSize(item.size)}</Text>
                                        <Text><Strong>create at: </Strong>{dayjs(item.createAt).format('YYYY/MM/DD')}</Text>
                                        <Detail
                                            walrusFile={item}
                                            />
                                    </Flex>

                                </Flex>

                            </Card>

                        </Box>

                    ))}
                </Flex>
                <Box>

                </Box>
            </Box>
        </>
    );
}

