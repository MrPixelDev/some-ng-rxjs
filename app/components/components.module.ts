import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
bottom-onboard-toolbar/bottom-onboard-toolbar.component';
import {CounterComponent} from 'src/app/components/counter/counter.component';
import {DirectivesModule} from 'src/app/directives/directives.module';
import {PrimaryButtonComponent} from 'src/app/components/primary-button/primary-button.component';
import {HeaderComponent} from 'src/app/components/header/header.component';


@NgModule({
    declarations: [
        CounterComponent,
        PrimaryButtonComponent,
        HeaderComponent,
    ],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule,
        FormsModule,
        DirectivesModule,
    ],
    exports: [
        CounterComponent,
        PrimaryButtonComponent,
        HeaderComponent,
    ],
})
export class ComponentsModule { }
