import {Injectable} from '@angular/core';
import {Mixin} from 'src/app/mixins/mixin.decorator';
import {LoadingMixin} from 'src/app/mixins/loading';


@Injectable({
    providedIn: 'root',
})
@Mixin(LoadingMixin)
export class LoadingService implements LoadingMixin {
    startLoading: () => void;
    stopLoading: () => void;
    loading: boolean;
}
