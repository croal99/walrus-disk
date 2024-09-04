import {Blockquote, Box, Button, Card, Container, Flex, Grid, Heading, Strong, Text, TextField} from "@radix-ui/themes";
import {Form, redirect, useLoaderData} from "react-router-dom";
import {getSetting, setSettings} from "@/hooks/useLocalStore.ts";
import {SettingOnStore} from "@/types/SettingOnStore.ts";

export async function loader() {
    return await getSetting();
}

export async function action({request, params}) {
    const formData = await request.formData();
    console.log('form data', formData)
    const {aggregator, publisher} = Object.fromEntries(formData);
    const setting: SettingOnStore = await getSetting();
    setting.publisher = publisher;
    setting.aggregator = aggregator;
    console.log('update', setting);
    await setSettings(setting);
    return {}
}

export default function Setting() {
    const setting = useLoaderData() as SettingOnStore;
    // console.log('setting', setting)

    return (
        <>
            <Form method="post">
                <Flex gap="3" px="4" py="4" direction="column" width="650px">
                    <Heading>Setting</Heading>
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
                                    Walrus publisher is currently limiting requests to <Strong>10 MiB</Strong>. If you want to upload larger
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

                    <Card>
                        <Flex direction="column" gap="5" px="3" py="5">
                            <Flex align="center" gap="3">
                                <Text as="div" size="2" mb="1" weight="bold" style={{width: 100}}>
                                    aggregator
                                </Text>
                                <TextField.Root
                                    name="aggregator"
                                    defaultValue={setting.aggregator}
                                    placeholder="Enter aggregator url"
                                    style={{width: 600}}
                                />
                            </Flex>

                            <Flex align="center" gap="3">
                                <Text as="div" size="2" mb="1" weight="bold" style={{width: 100}}>
                                    publisher
                                </Text>
                                <TextField.Root
                                    name="publisher"
                                    defaultValue={setting.publisher}
                                    placeholder="Enter publisher url"
                                    style={{width: 600}}
                                />
                            </Flex>
                        </Flex>
                    </Card>

                    <Flex justify="end">
                        <Button type="submit">Save</Button>
                    </Flex>

                </Flex>

            </Form>
        </>
    )
}