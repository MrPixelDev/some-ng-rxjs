import { Injectable } from "@angular/core";
import { from, iif, of, Observable, NEVER, EMPTY } from "rxjs";
import { tap, switchMap, finalize } from "rxjs/operators";
import { environment } from "src/environments/environment.prod";
import { SwPush } from "@angular/service-worker";
import { PushNotificationApiService } from "../api/push-notification-service";
import { UserService } from "src/app/services/user.service";

@Injectable({
  providedIn: "root",
})
export class PushNotificationService {
  notificationsSupported = false;
  notificationsEnabled = false;
  swRegistration: ServiceWorkerRegistration = null;
  subscription: PushSubscription = null;

  constructor(
    private readonly userService: UserService,
    private swPush: SwPush,
    private pushApi: PushNotificationApiService
  ) {}

  #urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  showNotification(notification) {
    this.swRegistration.showNotification(notification.notification.title, {
      body: notification.notification.body,
    });
  }

  #getSubscription$(swreg: ServiceWorkerRegistration) {
    // console.log('Ask for available subscription');
    return swreg.pushManager.getSubscription();
  }

  async #findSubscription(): Promise<PushSubscription> {
    // console.log('get active service worker registration');
    return navigator.serviceWorker.ready.then((swreg) => {
      // console.log('haal active subscription op');
      this.swRegistration = swreg;
      return this.#getSubscription$(this.swRegistration);
    });
  }

  created(): boolean {
    if ("Notification" in window && "serviceWorker" in navigator) {
      this.notificationsSupported = true;
      return true;
    } else {
      return false;
    }
  }

  mounted(): void {
    this.#findSubscription().then((sub) => {
      if (sub === null) {
        // console.log('No active subs on client', sub);
        this.notificationsEnabled = false;
      } else {
        // console.log('Active sub: ', sub);
        this.notificationsEnabled = true;
        this.subscription = sub;
      }
    });
  }

  // ===================================

  subscr$(swreg: ServiceWorkerRegistration): Observable<PushSubscription> {
    // console.log('Create new subscription for this browser');
    const vapidPublicKey = environment.vapidPublicKey;
    const convertedVapidPublicKey = this.#urlBase64ToUint8Array(vapidPublicKey);
    return from(
      swreg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidPublicKey,
      })
    );
  }

  // subscr(swreg: ServiceWorkerRegistration): Promise<PushSubscription> {
  //     console.log('Create new subscription for this browser');
  //     const vapidPublicKey = environment.vapidPublicKey;
  //     const convertedVapidPublicKey =
  //         this.#urlBase64ToUint8Array(vapidPublicKey);
  //     return swreg.pushManager.subscribe({
  //         userVisibleOnly: true,
  //         applicationServerKey: convertedVapidPublicKey,
  //     });
  // }

  #createSubscription$(): Observable<PushSubscription> {
    // console.log('ask for active service worker registration');
    if (this.swRegistration === null) {
      return from(navigator.serviceWorker.ready).pipe(
        tap((swreg) => {
          this.swRegistration = swreg;
        }),
        switchMap(() =>
          this.subscr$(this.swRegistration).pipe(
            tap(() => {
              this.notificationsEnabled = true;
            })
          )
        )
      );
    } else {
      return this.subscr$(this.swRegistration);
    }
  }

  #postSubscription$(): Observable<any> {
    return this.#createSubscription$().pipe(
      tap((sub) => {
        // console.log('Sub created on client', sub);
        this.subscription = sub;
      }),
      switchMap((sub) =>
        this.pushApi.registerSubscription(
          this.subscription,
          this.userService.userId
        )
      )
    );
  }

  #removeSubscription(sub: PushSubscription): Observable<any> {
    return this.pushApi
      .unregisterSubscription(sub, this.userService.userId)
      .pipe(
        tap(
          () => this.swPush.unsubscribe(),
          tap(() => {
            this.notificationsEnabled = false;
            this.subscription = null;
          })
        )
      );
  }

  // createSubscription() {
  //     console.log('ask for active service worker registration');
  //     if (this.swRegistration === null) {
  //         return navigator.serviceWorker.ready.then((swreg) => {
  //             this.swRegistration = swreg;
  //             return this.subscr(this.swRegistration);
  //         });
  //     } else {
  //         return this.subscr(this.swRegistration);
  //     }
  // }

  toggleSubscription$(): Observable<any> {
    if (this.notificationsSupported) {
      if (!this.notificationsEnabled) {
        return from(Notification.requestPermission()).pipe(
          switchMap((res) =>
            iif(
              () => res === "granted",
              this.#postSubscription$(),
              NEVER.pipe(
                finalize(() => console.log("User did not granted permissions"))
              )
            )
          )
        );
      } else {
        console.log("Disable subscription");
        return of(null);
      }
    } else {
      console.log("Notifications not supported");
      return NEVER;
    }
  }

  pushNotifications$(): Observable<any> {
    if (this.created()) {
      return from(this.#findSubscription()).pipe(
        tap((sub) => {
          if (sub === null) {
            // console.log('No active subs on client', sub);
            this.notificationsEnabled = false;
          } else {
            // console.log('Active sub: ', sub);
            this.notificationsEnabled = true;
            this.subscription = sub;
          }
        }),
        switchMap(() =>
          this.toggleSubscription$().pipe(
            switchMap(() => this.swPush.messages)
            // tap((e) => {
            //     console.log('swPush', e);
            // })
          )
        )
      );
    }
    // if (this.created()) {
    //     this.mounted();
    // }

    // return this.toggleSubscription$().pipe(
    //     switchMap(() =>
    //         this.swPush.messages.pipe(
    //             tap((e) => {
    //                 console.log('swPush', e);
    //             })
    //         )
    //     )
    // );
  }
}
