import React, {useEffect, useState} from "react";
import {Form, Link, useLoaderData} from "react-router-dom";
import {Box, Button, Card, Flex, Text, Dialog, TextField, Progress} from "@radix-ui/themes";
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
    console.log('create folder action', params)
    const formData = await request.formData();
    // console.log('form data', formData, Object.fromEntries(formData))
    // const blobfile = Object.fromEntries(formData);
    //
    // var plaintextbytes = await readfile(blobfile.blobfile)
    //     .catch(function (err) {
    //         console.error(err);
    //     });


    const newFolder = Object.fromEntries(formData) as FolderOnStore;
    await createFolder(newFolder);

    return {}
}

function BlobToImage({blob}) {
    const [imageUrl, setImageUrl] = useState('');

    const blobToDataURL = (blob) => {
        console.log('blobToDataURL', typeof blob)
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    useEffect(() => {
        const convertBlobToImage = async () => {
            // if (typeof blob != Blob) {
            //     return;
            // }
            try {
                const dataUrl = await blobToDataURL(blob);
                setImageUrl(dataUrl);
            } catch (error) {
                console.error('Error converting Blob to DataURL:', error);
            }
        };

        convertBlobToImage();
    }, [blob]);

    return <img src={imageUrl} alt="Image" style={{maxWidth: 320}}/>;
}


export default function Explorer() {
    const [file, setFile] = useState();
    const [isFormValid, setIsFormValid] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileList, setFileList] = useState<FileOnStore[]>([]);
    const [isPreview, setIsPreview] = useState(false);
    const [mediaType, setMediaType] = useState("image/png");
    const [mediaData, setMediaData] = useState("");
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
        const url = 'http://localhost:3000/uploadFile';
        const formData = new FormData();
        console.log('file', file, file.type);
        formData.append('file', file);
        formData.append('fileName', file.name);

        console.log('file data', formData);
        const blob = await readfile(file).catch(function (err) {
            console.error(err);
        });

        const plaintextbytes = new Uint8Array(blob);
        // console.log('read', plaintextbytes)

        const publisherUrl = "https://publisher-devnet.walrus.space/v1/store?epochs=1";
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
            console.log('store', response)
            setUploadProgress(0);
            let blobId: string;
            if (response.data.alreadyCertified) {
                blobId = (response.data.alreadyCertified as BlobOnWalrus).blobId
            } else if (response.data.newlyCreated) {
                blobId = (response.data.alreadyCertified as NewBlobOnWalrus).blobObject.blobId
            }

            const fileInfo: FileOnStore = {
                id: "",
                name: file.name,
                parentId: root.id,
                blobId: blobId,
                mediaType: "",
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

    const handlePreview = (fileInfo: FileOnStore) => {
        console.log('preview', fileInfo);
        const txUrl = `https://aggregator-devnet.walrus.space/v1/` + fileInfo.blobId;
        // setMediaData(txUrl);
        axios.get(txUrl, {responseType: "blob"}).then((res) => {
            console.log('get', res)
            setIsPreview(true);
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
                                <Dialog.Title>Upload file</Dialog.Title>
                                <Dialog.Description size="2" mb="4">
                                    Select file to upload
                                    To encrypt a file, enter a password and drop the file to be encrypted into
                                    the dropzone
                                    below. The file will then be encrypted using the password, then you'll be
                                    given an
                                    opportunity to save the encrypted file to your system. </Dialog.Description>

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

                <Flex px="3" gap="3">
                    {childs.map((item, index) => (
                        <Card key={index}>
                            <Link to={"/folder/" + item.id}><Text>{item.name}</Text></Link>
                        </Card>
                    ))}
                    {fileList.map((item, index) => (
                        <Card key={index}>
                            <Flex direction="column" gap="3">
                                <Link to={"/folder/" + item.id}><Text>{item.name}</Text></Link>
                                <Text>{item.blobId}</Text>
                                <Text>{dayjs(item.createAt).format('YYYY/MM/DD')}</Text>
                                <Button onClick={() => handlePreview(item)}>Preview</Button>



                            </Flex>
                        </Card>
                    ))}
                </Flex>
                <Box>

                    <Dialog.Root open={isPreview}>

                        <Dialog.Content maxWidth="450px">
                            <Dialog.Title>Preview</Dialog.Title>
                            <Dialog.Description size="2" mb="4">
                                Preview file
                            </Dialog.Description>

                            <BlobToImage blob={mediaData}/>
                            <Flex direction="column" gap="3">
                                <Dialog.Close>
                                    <Button onClick={()=>setIsPreview(false)}>Close</Button>
                                </Dialog.Close>
                            </Flex>

                        </Dialog.Content>
                    </Dialog.Root>

                </Box>
            </Box>
        </>
    );
}

