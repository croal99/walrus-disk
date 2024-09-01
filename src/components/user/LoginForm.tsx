import {Box, Button, Card, Flex, Text, TextField} from "@radix-ui/themes";
import {Form, redirect} from "react-router-dom";
import {apiAuthProvider} from "@/hooks/useAuthStatus.ts";

export async function action({request, params}) {
    const formData = await request.formData();
    const {username, password} = Object.fromEntries(formData);

    // sigin
    if (await apiAuthProvider.signin(username, password)) {
        return redirect('/');
    }

    return {}
}

export default function LoginForm() {
    return (
        <Form method="post">
            <Box className="login-container">
                <Card className="login-form" style={{background: "var(--gray-a1)", maxWidth: 400}}>
                    <Flex direction="column" gap="3">
                        <Text as="div" weight="bold" size="3" mb="1" align={'center'}>
                            Walrus Disk Sigin
                        </Text>
                        <label>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Name
                            </Text>
                            <TextField.Root
                                name="username"
                                defaultValue="admin"
                                placeholder="Enter your name"
                            />
                        </label>
                        <label>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Password
                            </Text>
                            <TextField.Root
                                name="password"
                                defaultValue="password"
                                placeholder="Enter your password"
                            />
                        </label>
                        <Button>Login</Button>
                        <Text size="1" mb="1" align={'center'}>
                            Version (20240824.test)
                        </Text>
                    </Flex>
                </Card>
            </Box>
        </Form>
    )
}