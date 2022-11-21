import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export function logObservable<T>(
    prefix: string = 'emit'
): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>) =>
        source.pipe(tap((data) => console.log(`${prefix}: `, data)));
}
