import {Box, Button, Dialog, Flex, Progress, Spinner, Text} from "@radix-ui/themes";
import {Form} from "react-router-dom";
import React, {useState} from "react";
import {getSetting} from "@/hooks/useLocalStore.ts";
import {BlobOnWalrus, NewBlobOnWalrus} from "@/types/BlobOnWalrus.ts";
import {FileOnStore} from "@/types/FileOnStore.ts";
import {createFile} from "@/hooks/useExplorerStore.ts";
import * as Toast from '@radix-ui/react-toast';
import axios from 'axios';

import "@/styles/toast.css";

export default function UploadFile(
    {
        root,
        reFetchDir,
    }) {
    const [file, setFile] = useState();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [openToast, setOpenToast] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const readfile = (file) => {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => {
                resolve(fr.result)
            };
            fr.readAsArrayBuffer(file);
        });
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const setting = await getSetting();


        const blob = await readfile(file).catch(function (err) {
            console.error(err);
        });
        // return

        const plaintextbytes = new Uint8Array(blob);

        const pbkdf2iterations = 10000;
        const passphrasebytes = new TextEncoder("utf-8").encode(setting.walrusHash);
        const pbkdf2salt = window.crypto.getRandomValues(new Uint8Array(8));

        const passphrasekey = await window.crypto.subtle.importKey('raw', passphrasebytes, {name: 'PBKDF2'}, false, ['deriveBits'])
            .catch(function (err) {
                console.error(err);
            });

        let pbkdf2bytes = await window.crypto.subtle.deriveBits({
            "name": 'PBKDF2',
            "salt": pbkdf2salt,
            "iterations": pbkdf2iterations,
            "hash": 'SHA-256'
        }, passphrasekey as CryptoKey, 384)
            .catch(function (err) {
                console.error(err);
            });
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

        var cipherbytes = await window.crypto.subtle.encrypt({
            name: "AES-CBC",
            iv: ivbytes
        }, key as CryptoKey, plaintextbytes)
            .catch(function (err) {
                console.error(err);
            });

        cipherbytes = new Uint8Array(cipherbytes);

        const resultbytes = new Uint8Array(cipherbytes.length + 16);
        resultbytes.set(new TextEncoder("utf-8").encode('Salted__'));
        resultbytes.set(pbkdf2salt, 8);
        resultbytes.set(cipherbytes, 16);

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
                setMessage("This file has already been uploaded")
            } else if (response.data.newlyCreated) {
                blobId = (response.data.newlyCreated as NewBlobOnWalrus).blobObject.blobId
                setMessage("Walrus file created successfully")
            }

            const fileInfo: FileOnStore = {
                id: "",
                name: file.name,
                parentId: root.id,
                blobId: blobId,
                mediaType: file.type,
                icon: "",
                size: file.size,
                createAt: 0,
            }

            console.log('new file', fileInfo);
            createFile(fileInfo).then(() => {
                reFetchDir()
                setOpenToast(true)
            })
        }).catch(error => {
            console.log('store error', error)
        })

    }

    return (
        <>
            <Dialog.Root>
                <Dialog.Trigger>
                    <Button onClick={
                        async () => {
                        }
                    }>Upload File</Button>
                </Dialog.Trigger>

                <Dialog.Content maxWidth="650px">
                    <Dialog.Title>Select file to upload</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                    </Dialog.Description>

                    <Form onSubmit={handleSubmit}>
                        <Flex direction="column" gap="3">
                            <Text>
                                This App uses javascript running within your web browser to encrypt and decrypt
                                files client-side, in-browser. This App makes no network connections during
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
                                <Button type="submit">Upload</Button>
                            </Dialog.Close>
                        </Flex>
                    </Form>
                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root open={uploadProgress > 0}>
                <Dialog.Content maxWidth="450px">
                    <Dialog.Title>Upload file to Walrus</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                        Walrus supports operations to store and read blobs, and to prove and verify their availability.
                        It ensures content survives storage nodes suffering Byzantine faults and remains available and
                        retrievable. It provides APIs to access the stored content over a CLI, SDKs and over web2 HTTP
                        technologies, and supports content delivery infrastructures like caches and content distribution
                        networks (CDNs).
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                        {uploadProgress < 100 ?
                            <Progress value={uploadProgress} size="3"></Progress> :
                            <Button>
                                <Spinner loading></Spinner> Waiting Walrus response.
                            </Button>}
                    </Flex>

                </Dialog.Content>
            </Dialog.Root>

            <Toast.Provider swipeDirection="right">
                <Toast.Root className="ToastRoot" open={openToast} onOpenChange={setOpenToast}>
                    <Toast.Title className="ToastTitle">{message}</Toast.Title>
                </Toast.Root>
                <Toast.Viewport className="ToastViewport" />
            </Toast.Provider>

        </>
    )
}