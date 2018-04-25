import * as _ from 'lodash';
import * as moment from 'moment';

// Cycle is a number of packs, cycles are what goes out of legality
export class Cycle {
    public code: string; // lunar
    public name: string; // Lunar
    public position: number; // 6
    public size: number; // Number of packs
    public rotated: boolean; // Is it out of rotation

    constructor(raw) {
        Object.assign(this, raw);
    }
}


// Pack are the individual data packs, cards do not directly link to a cycle.
export class Pack {
    public code: string; //  oac, ts, bb, cc etc
    public cycle_code: string; // cycle.code ie sansan
    public date_release: moment.Moment; // Time of release, simple data 2015-08-28
    public name: string; // The Valley
    public position: number; // position in the cycle
    public size: number; // 20 Number of cards
    public ffg_id: number; // null, then integer increasing, no idea where it is used

    // This is calculated from the cycle it belongs to, you have to lookup cycle_code -> cycle.code
    public cycle: Cycle;

    constructor(raw) {
        Object.assign(this, raw);
    }
}

export class Card {

    public code: string; // "00011",
    public deck_limit: number; // 1 (faction card), n for other cards
    public faction_code: string; // "jinteki",
    public illustrator: string; // "Emilio Rodriguez",
    public influence_limit: number; // number 45
    public keywords: string; // "Division",
    public minimum_deck_size: number; // number 30,
    public pack_code: string; // ie "draft",
    public position: number; // 11,
    public quantity: number; // 1,
    public side_code: string; // "corp",

    public title: string; // "Synthetic Systems: The World Re-imagined",
    public title_lower: string; // Simpler compare
    public type_code: string; // "identity"
    public uniqueness: boolean; // wtf is this?

    public text: string;
    // "Draft format only. If you have more [jinteki] cards rezzed than any other faction, when
    // your turn begins, you may swap 2 pieces of installed ice."
    public pack: Pack;

    // Is this card legal?  You have to calculate that off the pack -> cycle lookup, and then cross
    // reference against CORE
    public can_play: boolean = false;

    constructor(raw) {
        Object.assign(this, raw);

        this.title_lower = this.title ? this.title.toLowerCase() : '';
    }
}
