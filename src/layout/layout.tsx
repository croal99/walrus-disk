import {Link, Outlet, redirect, useLoaderData, useRouteLoaderData} from "react-router-dom";
import {Box, Button, Container, Flex, Text, TextField} from "@radix-ui/themes";
import {HomeIcon, MagnifyingGlassIcon} from "@radix-ui/react-icons";
import {apiAuthProvider} from "@/hooks/useAuthStatus.ts";
import {getSetting} from "@/hooks/useLocalStore.ts";

export async function loader() {
    const setting = await getSetting();
    // console.log('setting', setting);
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
    // console.log('username', username);

    return (
        <>
            <Flex>
                <Box className="sidebar">
                    <h1><Link to="/" style={{textDecoration: 'none'}}>Walrus Disk</Link></h1>
                    <Flex>
                        <Text size="5">Walrus Disk</Text>
                    </Flex>
                    <Box height="240px">
                        <nav>
                            <ul>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/folder/0">All files</Link></li>
                                <li><Link to="/media/image">Picture</Link></li>
                                <li><Link to="/media/video">Video</Link></li>
                                <li><Link to="/media/application">Document</Link></li>
                            </ul>
                        </nav>
                    </Box>
                    <Box height="120px">
                        <nav>
                            <ul>
                                <li><Link to="/setting">Setting</Link></li>
                                <li><Link to="/logout">Sign out</Link></li>
                            </ul>
                        </nav>
                    </Box>
                    <nav>
                        <ul>
                            <li><Link to="/subscribe">Get Walrus Disk+</Link></li>
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
