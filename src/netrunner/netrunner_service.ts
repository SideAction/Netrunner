import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';

import {Card, Cycle, Pack} from './types';

import * as _ from 'lodash';

declare var require: any;
export class NetrunnerService {

    public timeoutSpan = 100;
    public cardLookup: any = null; // A place to put all the cards, determining legal is annoying with core vs core2 and titles

    public constructor() {

    }

    public determineLegalPacks(packs: Array<Pack> = null, cycles: Array<Cycle> = null) {
        cycles = cycles || this.getCycleInstances();
        packs = packs || this.getPackInstances();

        let cycleLookup = _.groupBy(cycles, 'code');
        _.each(packs, pack => {
            let cycle = _.get(cycleLookup, pack.cycle_code + '[0]');
            if (cycle) {
                pack.cycle = cycle;
            } else {
                console.error("This pack has no cycle code?", pack);
            }
        });
        return packs;
    }

    public determineCardLegality(cards: Array<Card> = null, packs: Array<Pack> = null, cycles: Array<Cycle> = null) {
        cards = cards || this.getCardInstances();
        packs = this.determineLegalPacks(packs, cycles);

        let packLookup: any = _.groupBy(packs, 'code');
        _.each(cards, card => {
            let pack: Pack = _.get(packLookup, card.pack_code + '[0]');
            if (pack && pack.cycle) {
                card.pack = pack;
                card.can_play = !pack.cycle.rotated;
            } else {
                console.error("What the fuck, no pack found for this card?", card);
            }
        });
        return cards;
    }

    public getRevisedCoreCards(cards: Array<Card> = null) {
        cards = this.determineCardLegality(cards);
        return  _.filter(cards, {can_play: true});
    }

    public getBannedCoreCards(cards: Array<Card> = null) {
        cards = this.determineCardLegality(cards);
        return  _.filter(cards, {can_play: false});
    }


    public getCardInstances() {
        return _.map(_.get(this.getCards(), 'data'), card => new Card(card));
    }

    public getCycleInstances() {
        return _.map(_.get(this.getCycles(), 'data'), cycle => new Cycle(cycle));
    }

    public getPackInstances() {
        return _.map(_.get(this.getPacks(), 'data'), pack => new Pack(pack));
    }

    public getCards() {
        return require('./cards.json');
    }

    public getCycles() {
        return require('./cycles.json');
    }

    public getPacks() {
        return require('./packs.json');

    }
}
