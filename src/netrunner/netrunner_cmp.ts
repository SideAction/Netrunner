import {OnInit, ViewChild, Component, EventEmitter, Input, Output, HostListener} from '@angular/core';
import {Subscription} from 'rxjs';

import {NetrunnerService} from './netrunner_service';
import {Faction, SubType, Cycle, Pack, Card} from './types';

import * as _ from 'lodash';
import * as moment from 'moment';

export let ROTATION = {
    ALL: "Any Rotation",
    IN: "In Rotation",
    OUT: "Out of Rotation",
};

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

    public packListing: any; // Hash of packs grouped by cycle_code

    // Make it so we can quick apply some filters
    public types: Array<any>;
    public corpTypes: Array<any>;
    public runnerTypes: Array<any>;

    public factions: Array<any>;
    public corpFactions: Array<any>;
    public runnerFactions: Array<any>;

    public searchFullText: boolean = false;
    public rotationState: number = 0;
    public rotationStates = [ROTATION.ALL, ROTATION.IN, ROTATION.OUT];
    public errMsg: string;

    // We don't want to instance make netrunnerDB image loads until the user is probalby done searching
    @Input() imageDelayInSeconds: number = 5;
    public limit: number = 40;
    public showImages = false;
    public lastSearchTime: moment.Moment;
    public rotatedIncluded: boolean = false;

    public listCards: Array<Card>;

    // Filters
    public packSelection = null; // Allow for granular selection of packs
    public factionSelection = null; // selection on a faction basis
    public typeSelection = null; // Card type (code gate etc)
    public cycleSelection = null;  // Cycle filtering (further impacted by pack)

    constructor(public _netrunnerService: NetrunnerService) {

    }

    public ngOnInit() {
        // console.log("Loading up the netrunner component.", this.cardSearch);
        if (!this.allCards) { // Useful if you want to test specific cases
            this.loadCards();
        }
        if (!this.factions) {
            this.typeFilters();
        }
    }

    public loadCards() {
        this.allCards = this._netrunnerService.getDistinctNamedCards();
    }

    public searchCards(textToFind) {
        this.searchText = textToFind; // Have to maintain the model state
        this.matchedCards = null;

        console.log("Search text", textToFind);
        if (!_.isString(textToFind) || textToFind.length === 0) {
            return;
        }
        // Set the last search call, then setup a timeout to check when we should show images.
        this.lastSearchTime = moment();
        this.resetVisibleImages();


        // TODO:  Definitely do a debounce but it still might be jacked by angular timeout loop issues
        setTimeout(() => {
            this.matchedCards = this.checkCards(this.allCards, textToFind, this.limit);
        }, 100);
    }

    // Assume we would like to show the images, so just check a little after
    // the visibility should be present
    public resetVisibleImages() {
        this.showImages = false;
        setTimeout(() => {
            this.showImages = this.showImagesAfterDelay(this.imageDelayInSeconds);
        }, ((this.imageDelayInSeconds * 1000) + 200));
    }

    public showImagesAfterDelay(delayImageLoadInSeconds: number) {
        console.log("Check image delay", this.imageDelayInSeconds);
        if (this.lastSearchTime) {
            let seconds = moment.duration(moment().diff(this.lastSearchTime)).seconds();
            if (seconds >= delayImageLoadInSeconds) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    public checkCards(cards: Array<Card> = this.allCards, textToFind: string = '', limit: number = this.limit) {
        textToFind = textToFind ||  this.searchText;
        limit = limit || this.limit;

        console.log("Text to find", this, textToFind);

        let matchingCards = cards;
        matchingCards = this.rotationFilters(matchingCards, this.rotationStates[this.rotationState]);
        matchingCards = this.selectionFilters(matchingCards);
        matchingCards = this.textFilters(matchingCards, textToFind, this.searchFullText);

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

    // Just grab a bunch of hashes with selection states
    public buildSelectionLookups(packs: Array<Pack>, factions: Array<Faction>, types: Array<SubType>, cycles: Array<Cycle>) {
        this.packSelection = this.getStateLookup(packs);
        this.factionSelection = this.getStateLookup(factions);
        this.typeSelection = this.getStateLookup(types);
        this.cycleSelection = this.getStateLookup(cycles);
    }

    public getStateLookup(iter: Array<any>, key: string = 'code') {
        let lookup = {};
        _.each(iter, item => {
            lookup[item[key]] = true;
        });
        return lookup;
    }

    public rotationStateChange(state: number = 0, evt = null) {
        this.swallowEvent(evt);
        this.rotationState = (this.rotationState + 1) % this.rotationStates.length;
        this.matchedCards = this.checkCards();
    }

    // Perhaps make a lookup for the various card filters that can be applied
    public toggleType(typ: SubType, state: boolean = null) {
        console.log("Toggling type", typ, state);
        this.matchedCards = this.checkCards();
    }

    public togglePack(pack: Pack, state: boolean = null) {
        console.log("Toggling pack", pack, state);
        this.matchedCards = this.checkCards();
    }

    public toggleFaction(faction: Faction, state: boolean = null) {
        console.log("Toggling faction", faction, state);
        this.matchedCards = this.checkCards();
    }

    public toggleSettings(settings: Array<any>, state: boolean, evt = null) {
        this.swallowEvent(evt);
        _.each(settings, lookup => {
            _.each(lookup, (val, key) => {
                lookup[key] = state;
            });
        });
        this.matchedCards = this.checkCards();
    }

    // TODO: could make it so the rotation state alters the selections and just do one filter
    public toggleCycle(cycle: Cycle, state: boolean = null) {
        let newState = this.cycleSelection[cycle.code];

        // Now set the pack state based on the cycle (filter would be the same but UI purposes)
        let packLookup = _.groupBy(this.packs, 'cycle_code') || {};
        let packs = packLookup[cycle.code] || [];
        _.each(packs, pack => {
            this.packSelection[pack.code] = newState;
        });
        this.matchedCards = this.checkCards();
    }


    private lookupFilter(cards: Array<Card>, selectionLookup: any, filterKey: string) {
        selectionLookup = selectionLookup || {};
        return _.filter(cards, card => {
            let checkVal = card[filterKey]; // Things like type_code, pack_code, faction_code etc
            return selectionLookup[checkVal];
        });
    }

    // helper for setting things to all or none
    private setAllFilterStates(filterLookup: any, state: boolean = false) {
        filterLookup = filterLookup || {};
        _.each(filterLookup, (val, key) => {
            filterLookup[key] = state;
        });
    }


    // We have legality which should filter the overall card set
    public selectionFilters(cards: Array<Card> = null) {
        let filterCards: Array<Card> = cards || this.allCards;
        filterCards = this.lookupFilter(filterCards, this.typeSelection, 'type_code');
        filterCards = this.lookupFilter(filterCards, this.packSelection, 'pack_code');
        filterCards = this.lookupFilter(filterCards, this.factionSelection, 'faction_code');
        filterCards = this.cycleFilter(filterCards, this.cycleSelection);

        // SideLookup
        return filterCards;
    }

    public cycleFilter(cards: Array<Card>, selectionLookup: any) {
        return _.filter(cards, card => {
            if (!card.pack) {
                console.log("What the fuck, no pack?", card);
            } else {
                return selectionLookup[card.pack.cycle.code];
            }
        });
    }

    // Filter based on rotation state selection (In: true, Out: false, All: null)
    public rotationFilters(cards: Array<Card>, rotationState: string = ROTATION.ALL) {
        // ALL, IN, OUT are the rotation options.
        if (rotationState === ROTATION.ALL || rotationState === null) {
            return cards;
        }
        let rotated = (rotationState === ROTATION.OUT);
        return _.filter(cards, card => {
            return card.pack.cycle.rotated === rotated;
        });
    }

    public textFilters(cards: Array<Card>, textToFind: string, searchFullText: boolean = false) {
        if (textToFind === undefined || textToFind == null || textToFind === '') {
            return cards;
        }
        console.log("Searching for cards with: ", textToFind);
        this.errMsg = null;

        let re = null;
        try {
            re = new RegExp(textToFind, 'igm');
        } catch (err) {
            this.errMsg = 'Invalid Regex';
            console.error("Invalid regex detected in textToFind");
        }
        return  _.filter(cards, card => {
            return card.match(textToFind, re, searchFullText);
        });
    }

    public getCardNames() {
        let cards: Array<Card> = this._netrunnerService.determineCardLegality();
        this.listCards = this.selectionFilters(cards);
    }

    public factionToggle(evt, setFaction: string = 'Corp') {
        this.swallowEvent(evt);

        let sideIsCorp = setFaction === 'Corp' ? true : false;
        _.each(this.corpTypes, c => {
            this.typeSelection[c.code] = sideIsCorp;
        });
        _.each(this.corpFactions, c => {
            this.factionSelection[c.code] = sideIsCorp;
        });

        _.each(this.runnerTypes, r => {
            this.typeSelection[r.code] = !sideIsCorp;
        });
        _.each(this.runnerFactions, r => {
            this.factionSelection[r.code] = !sideIsCorp;
        });
        this.matchedCards = this.checkCards();
    }


    public typeFilters() {
        this.factions = this._netrunnerService.getFactionInstances();
        this.types = this._netrunnerService.getSubTypeInstances();
        this.packs = this._netrunnerService.getPackInstances();
        this.cycles = this._netrunnerService.getCycleInstances();

        this.corpFactions = _.filter(this.factions, f => f.side_code === 'corp');
        this.runnerFactions = _.filter(this.factions, f => f.side_code === 'runner');
        this.corpTypes = _.filter(this.types, t => t.side_code === 'corp');
        this.runnerTypes = _.filter(this.types, t => t.side_code === 'runner');

        this.packListing = _.groupBy(this.packs, 'cycle_code') || {};

        // Used to setup various filters that can be applied in the UI
        this.buildSelectionLookups(this.packs, this.factions, this.types, this.cycles);
        // console.log("Hmmmm", this.typeSelection, this.packSelection, this.factionSelection, this.cycleSelection);
        this.getCardNames();
    }


    public swallowEvent(evt) {
        if (evt && evt.preventDefault) {
            evt.preventDefault();
            evt.stopPropagation();
        }
    }
}
