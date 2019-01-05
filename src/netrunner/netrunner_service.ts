import {Observable} from 'rxjs';
import {Faction, SubType, MWL, Card, Cycle, Pack} from './types';

import * as _ from 'lodash';

declare var require: any;
export class NetrunnerService {

    public timeoutSpan = 100;
    public cardLookup: any = null; // A place to put all the cards, determining legal is annoying with core vs core2 and titles

    public constructor() {

    }

    public getDistinctNamedCards() {
        let allCards: Array<Card> = this.determineCardLegality();
        let legalCards = this.getLegalCards(allCards);
        let bannedCards = this.getBannedCards(allCards);

        // Ensure that the 'primary' card is legal if it can be played
        let distinctLookup = _.groupBy(legalCards, 'title');
        _.each(bannedCards, bc => {
            if (!distinctLookup[bc.title]) {
                distinctLookup[bc.title] = bc;
            }
        });
        let combinedDistinct = [];
        _.each(distinctLookup, (card, key) => {
            combinedDistinct.push(_.isArray(card) ? card[0] : card);
        });
        return combinedDistinct;
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
            card.fullText = card.buildFullText(); // One time cost, build out the search text
            card.image_url = card.getImageUrl(_.get(this.getCards(), 'imageUrlTemplate'));
        });
        return cards;
    }

    public getLegalCards(cards: Array<Card> = null) {
        cards = this.determineCardLegality(cards);
        return  _.filter(cards, {can_play: true});
    }

    public getBannedCards(cards: Array<Card> = null) {
        cards = this.determineCardLegality(cards);
        return  _.filter(cards, {can_play: false});
    }


    // Note these are not assembled, typically when dealing with cards you want the .determineCardLegality() return
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

    public getFactions() {
        return require('./factions.json');
    }
    public getFactionInstances() {
        return _.map(_.get(this.getFactions(), 'data'), faction => new Faction(faction));
    }

    public getSubTypes() {
        return require('./types.json');
    }
    public getSubTypeInstances() {
        return _.map(_.get(this.getSubTypes(), 'data'), typ => new SubType(typ));
    }

    public getMWL() {
        return require('./mwl.json');
    }

    public getMWLInstances() {
        return _.map(_.get(this.getMWL(), 'data'), mwl => new MWL(mwl));
    }

}
