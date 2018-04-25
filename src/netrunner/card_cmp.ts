import {OnInit, ViewChild, Component, EventEmitter, Input, Output, HostListener} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {NetrunnerService} from './netrunner_service';
import {Cycle, Pack, Card} from './types';

import * as _ from 'lodash';

@Component({
    selector: 'card-cmp',
    templateUrl: 'card.ng.html'
})
export class CardCmp implements OnInit {

    @Input() card: Card;

    constructor(public _netrunnerService: NetrunnerService) {

    }

    public ngOnInit() {

    }
}

