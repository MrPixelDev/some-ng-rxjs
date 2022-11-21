import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class ScannerService {
    scanOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    scanSwitch: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

    closeModal() {
        this.scanOpened.next(false);
    }

    openModal() {
        this.scanOpened.next(true);
    }
}
