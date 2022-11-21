import {animate, style, transition, trigger, AnimationTriggerMetadata} from '@angular/animations';


export const leftToRightInOutAnimation: AnimationTriggerMetadata = trigger(
        'leftToRightInOutAnimation',
        [
            transition(
                ':enter',
                [
                    style({ transform: 'translateX(-100%)' }),
                    animate('.4s ease-out',
                        style({ transform: 'translateX(0%)' }))
                ]
            ),
            transition(
                ':leave',
                [
                    style({ transform: 'translateX(0%)' }),
                    animate('.4s ease-in',
                        style({ transform: 'translateX(-100%)' }))
                ]
            )
        ],
    );
