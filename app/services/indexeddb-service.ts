import { Injectable } from '@angular/core';
import {
    Directory,
    Filesystem,
    ReaddirResult,
    ReadFileResult,
    WriteFileResult,
} from '@capacitor/filesystem';
import { IDataToIDB } from '../interfaces/index';

@Injectable({
    providedIn: 'root',
})
export class IndexedDbService {
    IFolders = {
        avatar: 'AVATAR',
        tempimg: 'TEMPIMG',
    };

    constructor() {}

    async saveData(
        data: IDataToIDB,
        directory: Directory = Directory.External
    ): Promise<WriteFileResult> {
        return await Filesystem.writeFile({
            directory,
            path: `/${data.folder}/${data.fileName}`,
            data: `${data.fileData}`,
        });
    }

    async readDir(
        folder: string,
        directory: Directory = Directory.External
    ): Promise<ReaddirResult> {
        return await Filesystem.readdir({
            directory,
            path: `/${folder}`,
        });
    }

    async createDir(
        folder: string,
        directory: Directory = Directory.External
    ): Promise<void> {
        await Filesystem.mkdir({
            directory,
            path: `/${folder}`,
        });
    }

    async readFile(
        folder: string,
        fileName: string,
        directory: Directory = Directory.External
    ): Promise<ReadFileResult> {
        return await Filesystem.readFile({
            directory,
            path: `/${folder}/${fileName}`,
        });
    }

    async deleteFile(
        filePath: string,
        directory: Directory = Directory.External
    ): Promise<void> {
        await Filesystem.deleteFile({
            directory,
            path: filePath,
        });
    }

    async deleteDir(
        folder: string,
        directory: Directory = Directory.External
    ): Promise<void> {
        const dir = await this.readDir(folder, directory);
        if (dir.files.length) {
            for (const file of dir.files) {
                await this.deleteFile(`${folder}/${file}`, directory);
            }
        }
        await Filesystem.rmdir({
            directory,
            path: `/${folder}`,
        });
    }
}
