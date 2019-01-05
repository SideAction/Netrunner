import * as _ from 'lodash';
import * as moment from 'moment';


export class BaseType {

    public raw: any;
    constructor(raw) {
        Object.assign(this, raw);
        this.raw = raw || {};
    }
}

// Things Code-Gate, Breaker, Agenda
export class SubType extends BaseType {
    public code: string;
    public name: string;
    public is_subtype: boolean; // Is this Barrier, a subtype of ICE
    public side_code: string; // Runner or corp
}

export class Faction extends BaseType {
    public code: string;
    public name: string;
    public color: string;
    public is_mini: boolean = false; // The special mini factions like Adam
    public side_code: string;
}

export class MWL extends BaseType {
    public active: boolean = false;
    public cards: any;

    public date_start: moment.Moment;
    public date_update: moment.Moment;

    // Card sub objects global_penalty: 1
    // Card sub objects universal_faction_cost: 1
    // is_restricted 1
    // deck_limit: 1
}


// Cycle is a number of packs, cycles are what goes out of legality
export class Cycle extends BaseType {
    public code: string; // lunar
    public name: string; // Lunar
    public position: number; // 6
    public size: number; // Number of packs
    public rotated: boolean; // Is it out of rotation
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

    public raw: any;
    constructor(raw) {
        Object.assign(this, raw);
        this.raw = raw || {};
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

    // "Draft format only. If you have more [jinteki] cards rezzed than any other faction, when
    // your turn begins, you may swap 2 pieces of installed ice."
    public text: string;

    // Full text is the combination of all the cycle, pack and card text entries and metadata
    public fullText: string;
    public image_url: string; // Often in the card json, or calculated using the code
    public pack: Pack;

    // Is this card legal?  You have to calculate that off the pack -> cycle lookup, and then cross
    // reference against CORE
    public can_play: boolean = false;

    public raw: any;
    constructor(raw) {
        Object.assign(this, raw);
        this.title_lower = this.title ? this.title.toLowerCase() : '';
        this.raw = raw || {};
    }

    public buildFullText() {
        let text: string = _.compact(_.values(this.raw)).join(' ') + ' ';
        if (this.pack) {
            text += _.compact(_.values(this.pack.raw || {})).join(' ') + ' ';
            if (this.pack.cycle) {
                text += _.compact(_.values(this.pack.cycle.raw)).join(' ') + ' ';
            }
        }
        return text;
    }

    // Some cards have an image_url set, many older ones require the urlTemplate evaluation
    public getImageUrl(url: string) {
        return this.image_url || (_.isString(url) ? url.replace('{code}', this.code) : '');
    }

    public match(textString: string, re: RegExp, fullTextSearch = false) {
        if (re) {
            if (this.fullText && fullTextSearch) {
                return re.test(this.fullText);
            } else {
                return re.test(this.title);
            }
        } else if (textString) {
            return this.title.match(textString);
        }
        return false;
    }
}
