import {Component, Input} from '@angular/core';


@Component({
    selector: 'app-primary-button',
    templateUrl: './primary-button.component.html',
    styleUrls: ['./primary-button.component.scss'],
})
export class PrimaryButtonComponent {
    @Input() type: string;
    @Input() disabled?: boolean;
    @Input() expand?: string = 'block';
}
