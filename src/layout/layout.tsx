import {Link, Outlet, redirect, useLoaderData, useRouteLoaderData} from "react-router-dom";
import {Box, Button, Container, Flex, TextField} from "@radix-ui/themes";
import {MagnifyingGlassIcon} from "@radix-ui/react-icons";
import {apiAuthProvider} from "@/hooks/useAuthStatus.ts";
import {getSetting} from "@/hooks/useLocalStore.ts";

export async function loader() {
    const setting = await getSetting();
    console.log('setting', setting);
    const user = await apiAuthProvider.getUser();
    if (!user) {
        return redirect('/login');
    }

    return {
        username: user.username
    }
}

export default function Layout() {
    const {username} = useLoaderData();
    console.log('username', username);

    return (
        <>
            <Flex>
                <Box className="sidebar">
                    <h1>Walrus Disk</h1>
                    <Flex>
                        <TextField.Root placeholder="Search the docs…">
                            <TextField.Slot>
                                <MagnifyingGlassIcon height="16" width="16"/>
                            </TextField.Slot>
                        </TextField.Root>
                    </Flex>
                    <Box height="200px">
                        <nav>
                            <ul>
                                <li><Link to="/folder/0">所有文件</Link></li>
                                <li><Link to="/">视频</Link></li>
                                <li><Link to="/">图片</Link></li>
                                <li><Link to="/">文档</Link></li>
                            </ul>
                        </nav>
                    </Box>
                    <nav>
                        <ul>
                            <li><Link to="/">home</Link></li>
                            <li><Link to="/error">error</Link></li>
                            <li><Link to="/logout">sign out</Link></li>
                        </ul>
                    </nav>
                </Box>

                <Box className="detail">
                    <Outlet/>
                </Box>


            </Flex>

        </>
    );
}
