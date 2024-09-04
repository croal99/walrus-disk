import {Box, Code, Flex, Heading, Section, Text} from "@radix-ui/themes";
import React from "react";

export default function Home() {
    return (
        <>
            <Box style={{backgroundColor: 'var(--gray-a2)', borderRadius: 'var(--radius-3)', height: '100%'}}>
                <Flex direction="column" gap="3" p="9" justify="center">
                    <Heading align="center">Walrus Disk</Heading>
                    <Text size="4">
                        Welcome to the Walrus Disk, a decentralized storage and data
                        availability protocol designed specifically for large binary files, or "blobs". Walrus focuses
                        on providing a robust but affordable solution for storing unstructured content on decentralized
                        storage nodes while ensuring high availability and reliability even in the presence of Byzantine
                        faults.
                    </Text>
                    <Text size="4">
                        This App uses javascript running within your web browser to encrypt and decrypt
                        files client-side, in-browser. This App makes no network connections during
                        this
                        process, to ensure that your keys never leave the web browser during
                        the
                        process.
                    </Text>
                    <Text size="4">
                        All client-side cryptography is implemented using the Web Crypto API. Files
                        are encrypted using AES-CBC 256-bit symmetric encryption. The encryption key is
                        derived from the password and a random salt using PBKDF2 derivation with 10000
                        iterations of SHA256 hashing.
                    </Text>
                    <Text size="4">
                        The encryption used by this App is compatible with openssl.
                    </Text>
                    <Text size="4">
                        Files encrypted using this App can be decrypted using openssl using the following command:
                    </Text>
                    <Code>openssl aes-256-cbc -d -salt -pbkdf2 -iter 10000 -in encryptedfilename -out
                        plaintextfilename</Code>
                    <Text size="4">
                        Files encrypted using the following openssl command can be decrypted using this page:
                    </Text>
                    <Code>openssl aes-256-cbc -e -salt -pbkdf2 -iter 10000 -in plaintextfilename -out
                        encryptedfilename</Code>
                    <Text size="4">
                        The encryption keys for all files are stored locally. If you change computers, use the
                        import/export function to migrate your keys to the new computer. If you don't do this, all your
                        keys will be lost. Even the developer cannot recover your files.
                    </Text>
                    <Box className="email">
                        <Flex direction="column" gap="4">
                            <Text>
                                Email: bc443995@gmail.com
                            </Text>
                            <Text>
                                Donate to Sui Wallet Address: 0x6f25929f026483a440f5f16e03661087eb41604528050b989f48624b049c4b78
                            </Text>

                        </Flex>

                    </Box>
                </Flex>
            </Box>


        </>
    )
}