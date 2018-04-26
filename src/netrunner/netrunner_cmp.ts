import {OnInit, ViewChild, Component, EventEmitter, Input, Output, HostListener} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {NetrunnerService} from './netrunner_service';
import {Cycle, Pack, Card} from './types';

import * as _ from 'lodash';

@Component({
    selector: 'netrunner-cmp',
    templateUrl: 'netrunner.ng.html'
})
export class NetrunnerCmp implements OnInit {

    public throttleFilter: Subscription;
    public searchText: string;
    @ViewChild('cardSearch') cardSearch;

    @Input() allCards: Array<Card>;
    @Input() bannedCards: Array<Card>;
    @Input() legalCards: Array<Card>;

    // Should probably assign this shit and not double init packs and cycles... save probably 10ms!
    public cycles: Array<Cycle>;
    public packs: Array<Pack>;
    public matchedCards: Array<Card>;
    public matchedBans: Array<Card>;

    public searchFullText: boolean = false;
    public errMsg: string;

    constructor(public _netrunnerService: NetrunnerService) {

    }

    public ngOnInit() {
        console.log("Loading up the netrunner component.", this.cardSearch);
        if (!this.allCards) { // Useful if you want to test specific cases
            this.loadCards();
        }
        // this.setupFilter();
    }

    public loadCards() {
        this.allCards = this._netrunnerService.getDistinctNamedCards();
    }

    public searchCards(textToFind: string) {
        this.matchedBans = null;
        this.matchedCards = null;

        console.log("Search text", textToFind);
        setTimeout(() => {
            if (!_.isString(textToFind) || textToFind.length === 0) {
                return;
            }
            this.matchedCards = this.checkCards(this.allCards, textToFind, 20);
        }, 10);
    }

    public checkCards(cards: Array<Card>, textToFind: string, limit: number = 20) {
        console.log("Searching for cards with: ", textToFind);
        this.errMsg = null;
        let re = null;
        try {
            re = new RegExp(textToFind, 'igm');
        } catch (err) {
            this.errMsg = 'Invalid Regex';
            console.error("Invalid regex detected in textToFind");
        }
        let matchingCards  = _.filter(cards, card => {
            return card.match(textToFind, re, this.searchFullText);
        });
        return matchingCards && matchingCards.length > limit ? matchingCards.slice(0, limit) : matchingCards;
    }

    public setupFilter() {
        if (!this.throttleFilter && this.cardSearch) {
            this.throttleFilter = this.cardSearch.valueChanges
                .debounceTime(500)
                .subscribe(
                    params => { this.searchCards(_.get(params, 'searchText') || ''); },
                    error => { console.error("Failed to setup the card filter correctly", error); }
                );
        }
    }
}
