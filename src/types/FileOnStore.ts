export interface FileOnStore {
    id: string;
    name: string;
    blobId: string;
    mediaType: string;
    size: number;
    parentId: string;
    createAt: number;
}
