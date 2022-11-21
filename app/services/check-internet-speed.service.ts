import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription, iif } from 'rxjs';
import { tap, take, takeUntil, mergeMap, finalize } from 'rxjs/operators';
import { SpeedTestService } from 'ng-speed-test';
import { ToastService } from './toast.service';
import { SPEED_TEST_512KB } from '../constants';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class CheckInternetSpeed {
    testSubscription: Subscription;
    stop$ = new Subject<void>();

    constructor(
        private speedTestService: SpeedTestService,
        private toastService: ToastService,
        private translate: TranslateService
    ) {}

    public testSpeed(): void {
        if (this.testSubscription && !this.testSubscription.closed) {
            this.testSpeedUnsubscribe();
        } else {
            this.testSubscription = this.testSpeed$().subscribe();
        }
    }

    public testSpeedUnsubscribe(): void {
        this.stop$.next();
        this.testSubscription.unsubscribe();
        Subscription.prototype.remove(this.testSubscription);
    }

    slowInternetToast$(): Observable<void> {
        return this.toastService
            .showDangerToast$(
                this.translate.instant('Slow internet connection'),
                '../../../../../assets/icons/badwifi.svg'
            )
            .pipe(take(1), takeUntil(this.stop$));
    }

    testSpeed$(): Observable<void> {
        return this.speedTestService
            .getMbps({
                iterations: 1,
                file: {
                    path: SPEED_TEST_512KB,
                    size: 512,
                    shouldBustCache: true,
                },
            })
            .pipe(
                take(1),
                takeUntil(this.stop$),
                mergeMap((speed) =>
                    iif(() => speed < 0.0009, this.slowInternetToast$(), null)
                )
            );
    }
}
