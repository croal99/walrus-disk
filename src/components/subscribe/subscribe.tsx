import {Blockquote, Button, Card, Flex, Heading, Strong, Text, TextField} from "@radix-ui/themes";
import {Form} from "react-router-dom";
import React from "react";

export default function Subscribe() {
    return (
        <>
            <Flex gap="3" px="4" py="4" direction="column" width="650px">
                <Heading>Subscribe</Heading>
                <Card>
                    <Blockquote size="2">
                        <Flex direction="column" gap="3">
                            <Text>
                                The Walrus system provides an interface that can be used for public testing. For your
                                convenience, walrus provide these at the following hosts:
                            </Text>
                            <Text>
                                <Text weight="bold">Aggregator:</Text> https://aggregator-devnet.walrus.space
                            </Text>
                            <Text>
                                <Text weight="bold">Publisher:</Text> https://publisher-devnet.walrus.space
                            </Text>
                            <Text>
                                Walrus publisher is currently limiting requests to <Strong>10 MiB</Strong>. If you want
                                to upload larger
                                files, you need to run your own publisher.
                            </Text>

                            <Text color="red">
                                Note that the publisher consumes (Testnet) Sui on the service side, and a Mainnet
                                deployment would likely not be able to provide uncontrolled public access to publishing
                                without requiring some authentication and compensation for the Sui used.
                            </Text>

                        </Flex>
                    </Blockquote>


                </Card>


            </Flex>
        </>
    )
}