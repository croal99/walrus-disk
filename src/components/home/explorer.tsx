import React, {useEffect, useState} from "react";
import {Form, Link, useLoaderData} from "react-router-dom";
import {Box, Button, Card, Flex, Text, Dialog, TextField, Progress, Inset, Strong} from "@radix-ui/themes";
import {
    checkFolderIsExist,
    createFile,
    createFolder,
    getChildFiles,
    getChildFolders,
    getCurrentFolder
} from "@/hooks/useExplorerStore.ts";
import axios from 'axios';
import dayjs from "dayjs";

import type {FolderOnStore} from "@/types/FolderOnStore.ts";
import type {FileOnStore} from "@/types/FileOnStore.ts";
import type {BlobOnWalrus, NewBlobOnWalrus} from "@/types/BlobOnWalrus.ts";
import {getSetting} from "@/hooks/useLocalStore.ts";
import Detail from "@/components/home/detail.tsx";
import {humanFileSize} from "@/utils/formatSize.ts";

export async function loader({params}) {
    // console.log('get folder', params)
    const root = await getCurrentFolder(params.id);
    console.log('current folder', root);
    const childs = await getChildFolders(params.id);
    console.log('current child folders', childs);
    return {root, childs};
}

function readfile(file) {
    return new Promise((resolve, reject) => {
        var fr = new FileReader();
        fr.onload = () => {
            resolve(fr.result)
        };
        fr.readAsArrayBuffer(file);
    });
}

export async function action({request, params}) {
    // console.log('create folder action', params)
    const formData = await request.formData();
    const newFolder = Object.fromEntries(formData) as FolderOnStore;
    await createFolder(newFolder);

    return {}
}

export default function Explorer() {
    const [file, setFile] = useState();
    const [isFormValid, setIsFormValid] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileList, setFileList] = useState<FileOnStore[]>([]);
    const [isPreview, setIsPreview] = useState(false);
    const [isDownload, setIsDownload] = useState(false);
    const [mediaData, setMediaData] = useState("");


    const [mediaType, setMediaType] = useState("image/png");
    const [mediaUrl, setMediaUrl] = useState<Blob>();

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

    const handleSubmit = async (event) => {
        event.preventDefault()
        const setting = await getSetting();


        console.log('file', file, file.type);
        const blob = await readfile(file).catch(function (err) {
            console.error(err);
        });

        const plaintextbytes = new Uint8Array(blob);
        console.log('Uint8Array', plaintextbytes)

        const pbkdf2iterations = 10000;
        const passphrasebytes = new TextEncoder("utf-8").encode(setting.walrusHash);
        const pbkdf2salt = window.crypto.getRandomValues(new Uint8Array(8));

        const passphrasekey = await window.crypto.subtle.importKey('raw', passphrasebytes, {name: 'PBKDF2'}, false, ['deriveBits'])
            .catch(function (err) {
                console.error(err);
            });
        console.log('passphrasekey imported', passphrasebytes);

        let pbkdf2bytes = await window.crypto.subtle.deriveBits({
            "name": 'PBKDF2',
            "salt": pbkdf2salt,
            "iterations": pbkdf2iterations,
            "hash": 'SHA-256'
        }, passphrasekey as CryptoKey, 384)
            .catch(function (err) {
                console.error(err);
            });
        console.log('pbkdf2bytes derived');
        pbkdf2bytes = new Uint8Array(pbkdf2bytes);

        let keybytes = pbkdf2bytes.slice(0, 32);
        let ivbytes = pbkdf2bytes.slice(32);

        const key = await window.crypto.subtle.importKey('raw', keybytes, {
            name: 'AES-CBC',
            length: 256
        }, false, ['encrypt'])
            .catch(function (err) {
                console.error(err);
            });
        console.log('key imported');

        var cipherbytes = await window.crypto.subtle.encrypt({
            name: "AES-CBC",
            iv: ivbytes
        }, key as CryptoKey, plaintextbytes)
            .catch(function (err) {
                console.error(err);
            });

        console.log('plaintext encrypted');
        cipherbytes = new Uint8Array(cipherbytes);

        const resultbytes = new Uint8Array(cipherbytes.length + 16);
        resultbytes.set(new TextEncoder("utf-8").encode('Salted__'));
        resultbytes.set(pbkdf2salt, 8);
        resultbytes.set(cipherbytes, 16);
        console.log('resultbytes', resultbytes);

        // return {}


        const publisherUrl = `${setting.publisher}/v1/store?epochs=1`;
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
            onUploadProgress: function (progressEvent) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            }
        };

        axios.put(publisherUrl, plaintextbytes, config).then(response => {
            // axios.put(publisherUrl, resultbytes, config).then(response => {
            console.log('store', response)
            setUploadProgress(0);
            let blobId: string;
            if (response.data.alreadyCertified) {
                blobId = (response.data.alreadyCertified as BlobOnWalrus).blobId
            } else if (response.data.newlyCreated) {
                blobId = (response.data.newlyCreated as NewBlobOnWalrus).blobObject.blobId
            }

            const fileInfo: FileOnStore = {
                id: "",
                name: file.name,
                parentId: root.id,
                blobId: blobId,
                mediaType: file.type,
                size: file.size,
                createAt: 0
            }

            console.log('new file', fileInfo);
            createFile(fileInfo).then(() => {
                fetchData()
            })
        }).catch(error => {
            console.log('store error', error)
        })
    }

    const handlePreview = async (fileInfo: FileOnStore) => {
        console.log('preview', fileInfo);
        const setting = await getSetting();

        const txUrl = `${setting.aggregator}/v1/${fileInfo.blobId}`;
        axios.get(txUrl, {responseType: "blob"}).then((res) => {
            console.log('get', res)
            setIsPreview(true);
            setMediaData(res.data)
        })
    }

    const handleDownload = async (fileInfo: FileOnStore) => {
        console.log('download', fileInfo);
        const setting = await getSetting();

        const txUrl = `${setting.aggregator}/v1/${fileInfo.blobId}`;
        axios.get(txUrl, {responseType: "blob"}).then((res) => {
            console.log('get', res)
            setIsDownload(true);
            setMediaData(res.data)
        })
    }

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
                                <Dialog.Title>Create folder</Dialog.Title>
                                <Dialog.Description size="2" mb="4">
                                    Input the folder's name
                                </Dialog.Description>

                                <Form method="post">
                                    <Flex direction="column" gap="3">
                                        <label>
                                            <Text as="div" size="2" mb="1" weight="bold">
                                                Name
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

                        <Dialog.Root>
                            <Dialog.Trigger>
                                <Button onClick={
                                    async () => {
                                    }
                                }>Upload File</Button>
                            </Dialog.Trigger>

                            <Dialog.Content maxWidth="450px">
                                <Dialog.Title>Select file to upload</Dialog.Title>
                                <Dialog.Description size="2" mb="4">
                                    <Text>
                                        This page uses javascript running within your web browser to encrypt and decrypt
                                        files client-side, in-browser. This page makes no network connections during
                                        this
                                        process, to ensure that your files and keys never leave the web browser during
                                        the
                                        process.
                                    </Text>
                                    <Text>
                                        All client-side cryptography is implemented using the Web Crypto API. Files
                                        are encrypted using AES-CBC 256-bit symmetric encryption. The encryption key is
                                        derived from the password and a random salt using PBKDF2 derivation with 10000
                                        iterations of SHA256 hashing.

                                    </Text>
                                </Dialog.Description>

                                <Box>
                                    <Form onSubmit={handleSubmit}>
                                        <Flex direction="column" gap="3">
                                            <input type="file" onChange={(e) => {
                                                setFile(e.target.files[0])
                                            }}/>
                                        </Flex>

                                        <Flex gap="3" mt="4" justify="end">
                                            <Dialog.Close>
                                                <Button variant="soft" color="gray">
                                                    Cancel
                                                </Button>
                                            </Dialog.Close>
                                            <Dialog.Close>
                                                <Button type="submit">Save</Button>
                                            </Dialog.Close>
                                        </Flex>
                                    </Form>

                                </Box>
                            </Dialog.Content>
                        </Dialog.Root>

                    </Flex>
                </Box>

                <Box minWidth="400px">
                    <Dialog.Root open={uploadProgress > 0}>
                        <Dialog.Content maxWidth="450px">
                            <Dialog.Title>Upload file</Dialog.Title>
                            <Dialog.Description size="2" mb="4">
                                Process of upload file
                            </Dialog.Description>

                            <Flex direction="column" gap="3">
                                <Progress value={uploadProgress} size="3"></Progress>
                            </Flex>

                        </Dialog.Content>
                    </Dialog.Root>

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
                                        <img
                                            src="/png.png"
                                            alt=""
                                            style={{
                                                // display: 'block',
                                                // objectFit: 'cover',
                                                // width: '100%',
                                                height: '190px',
                                            }}
                                        />
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

