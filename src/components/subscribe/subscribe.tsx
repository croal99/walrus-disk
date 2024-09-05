import {Badge, Blockquote, Button, Card, Flex, Heading, Strong, Text, TextField} from "@radix-ui/themes";
import React from "react";

export default function Subscribe() {

    return (
        <>
            <Flex gap="3" px="4" py="4" direction="column" width="650px">
                <Heading>Subscribe</Heading>
                <Text size="4">
                    Thank you for using Walrus Disk. We will provide the Walrus Disk+ version in October. In
                    the Walrus
                    Disk+ version, you will get more customized features:
                </Text>
                <Flex gap="3" px="4" py="4" direction="column">
                    <Text>
                        ✅ Global document search
                    </Text>
                    <Text>
                        ✅ Change user password
                    </Text>
                    <Text>
                        ✅ Set Walrus service address
                    </Text>
                    <Text>
                        ✅ Save user file list in the cloud
                    </Text>
                    <Text>
                        ✅ More encryption algorithms
                    </Text>
                    <Text>
                        ✅ Long-term technology upgrade
                    </Text>
                    <Text>
                        ✅ ...
                    </Text>
                </Flex>

                <Blockquote size="2">
                    <Flex direction="column" gap="3">
                        <Text size="4">
                            If you have successfully transferred <Badge size="3" color="green">10 USDC</Badge> to the wallet address below, please send your wallet address to the author's email
                            address, and the author will reply to you later on how to get the Walrus Disk+ version.
                        </Text>
                        <Text>
                            Email: bc443995@gmail.com
                        </Text>
                        <Text>
                            Sui Wallet Address:
                            0x6f25929f026483a440f5f16e03661087eb41604528050b989f48624b049c4b78
                        </Text>

                    </Flex>
                </Blockquote>
            </Flex>
        </>
    )
}