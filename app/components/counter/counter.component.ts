import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';


const FULL_DASH_ARRAY = 283;


@Component({
    selector: 'app-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss'],
})
export class CounterComponent implements OnInit {
    @Output() remainingSeconds: EventEmitter<number> = new EventEmitter();

    @Input() iconName? = 'checkmark-outline';
    @Input() timePassed? = 0;
    @Input() timeLimit? = 20;
    @Input() width? = 150;
    @Input() height? = 150;

    fullTime = null;

    strokeDasharray;
    timeLeft;

    get size() {
        return {
            width: `${this.width}px`,
            height: `${this.height}px`,
        };
    }

    static formatTimeLeft(time: number): number | string {
        const seconds = time % 60;

        return seconds < 10 ? `0${seconds}` : seconds;
    }

    ngOnInit() {
        this.fullTime = CounterComponent.formatTimeLeft(this.timeLimit);
        this.strokeDasharray = FULL_DASH_ARRAY.toString();
    }

    handlerCounter(value: number) {
        this.timePassed = this.timeLimit - value;
        this.timeLeft = value;

        const formattedTimeLeft = CounterComponent.formatTimeLeft(this.timeLeft);

        this.fullTime = Boolean(Number(formattedTimeLeft)) ? formattedTimeLeft : null;

        this.#setCircleDasharray();

        this.remainingSeconds.emit(value);
    }

    #calculateTimeFraction() {
        return this.timeLeft / this.timeLimit;
    }

    #setCircleDasharray() {
        this.strokeDasharray = `${(
            this.#calculateTimeFraction() * FULL_DASH_ARRAY
        ).toFixed(0)} ${FULL_DASH_ARRAY}`;
    }
}
