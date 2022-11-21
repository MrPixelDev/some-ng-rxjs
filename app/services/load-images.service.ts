import { Injectable } from '@angular/core';
import { ICachedPhoto } from 'src/app/interfaces';
import {
    Camera,
    CameraResultType,
    CameraSource,
    Photo,
} from '@capacitor/camera';
import { Directory } from '@capacitor/filesystem';
import { IndexedDbService } from 'src/app/services/indexeddb-service';
import { readAsBase64 } from 'src/app/helpers/convertPhotoToBase64';
import { LoadingController } from '@ionic/angular';

@Injectable({
    providedIn: 'root',
})
export class LoadImagesService {
    images: ICachedPhoto[] = [];
    constructor(
        private indexedDbService: IndexedDbService,
        private loadingController: LoadingController
    ) {}

    async deleteImage(file: ICachedPhoto, folder: string) {
        await this.indexedDbService.deleteFile(file.path, Directory.Cache);
        return await this.loadFiles(folder);
    }

    // Select image from local storage
    async selectImage(folder: string) {
        const image = await Camera.getPhoto({
            quality: 100,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Photos,
        });
        if (image) {
            return await this.saveImage(image, folder);
        }
    }

    async saveImage(photo: Photo, folder: string) {
        const fileName = new Date().getTime() + `.${photo.format}`;
        const fileData = await readAsBase64(photo);
        this.images[fileName] = fileData;
        await this.indexedDbService.saveData(
            {
                folder,
                fileName: new Date().getTime() + `.${photo.format}`,
                fileData,
            },
            Directory.Cache
        );
        return await this.loadFiles(folder);
    }

    async loadFiles(folder: string) {
        this.images = [];
        const loading = await this.loadingController.create({
            message: 'Loading data...',
        });
        await loading.present();
        try {
            const dir = await this.indexedDbService.readDir(
                folder,
                Directory.Cache
            );
            loading.dismiss();
            return await this.loadFileData(dir.files, folder);
        } catch (e) {
            loading.dismiss();
            await this.indexedDbService.createDir(folder, Directory.Cache);
        }
    }

    async loadFileData(fileNames: string[], folder: string) {
        for (let f of fileNames) {
            const filePath = `/${folder}/${f}`;
            const readFile = await this.indexedDbService.readFile(
                folder,
                f,
                Directory.Cache
            );
            this.images.push({
                name: f,
                path: filePath,
                data: `data:image/${f.split('.').slice(-1)};base64,${
                    readFile.data
                }`,
            });
        }
        return this.images;
    }
}
