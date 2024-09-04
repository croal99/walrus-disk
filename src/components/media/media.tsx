import {getChildFolders, getCurrentFolder, removeFolderStore} from "@/hooks/useFolderStore.ts";
import React, {useEffect, useState} from "react";
import {FileOnStore} from "@/types/FileOnStore.ts";
import {FolderOnStore} from "@/types/FolderOnStore.ts";
import {useLoaderData} from "react-router-dom";
import {getChildFiles, getFilesByType, removeFileStore} from "@/hooks/useFileStore.ts";
import {Box, Flex, Heading} from "@radix-ui/themes";
import Explorer from "@/components/explorer/explorer.tsx";

export async function loader({params}) {
    // console.log('get folder', params)
    return {mediaType: params.type};
}

export default function Media() {
    const [fileList, setFileList] = useState<FileOnStore[]>([]);
    const [folderList, setFolderList] = useState<FolderOnStore[]>([]);

    const {mediaType} = useLoaderData();

    const removeFolder = async (folderInfo: FolderOnStore) => {
    }

    const removeFile = async (fileInfo: FileOnStore) => {
        await removeFileStore(fileInfo);
        await fetchFiles(mediaType);
    }

    const fetchFiles = async (mediaType) => {
        const list = await getFilesByType(mediaType);
        setFileList(list);
    }

    const fetchData = async () => {
        await fetchFiles(mediaType);
    };

    useEffect(() => {
        fetchData().then(() => {
            // console.log('end fetch');
        });

    }, [mediaType]);

    return (
        <>
            <Box className="explorer">
                <Flex direction="column" py="3" gap="3">
                    <Explorer
                        folders={folderList}
                        files={fileList}
                        removeFolder={removeFolder}
                        removeFile={removeFile}
                    />
                </Flex>
            </Box>
        </>
    )
}