import {async, fakeAsync, getTestBed, tick, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {DebugElement} from '@angular/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import { RouterTestingModule } from '@angular/router/testing';
import {NetrunnerCmp, ROTATION} from './netrunner_cmp';
import {NetrunnerService} from './netrunner_service';
import {NetrunnerModule} from './netrunner_module';
import {Card, Cycle, Faction, Pack} from './types';

import * as _ from 'lodash';
import * as moment from 'moment';
declare var $;
fdescribe('TestingNetrunnerCmp', () => {
    let fixture: ComponentFixture<NetrunnerCmp>;
    let service: NetrunnerService;
    let comp: NetrunnerCmp;
    let el: HTMLElement;
    let de: DebugElement;


    beforeEach(async( () => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, RouterTestingModule, NetrunnerModule, HttpClientTestingModule],
            providers: [
                NetrunnerService
            ]
        }).compileComponents();

        service = TestBed.get(NetrunnerService);
        fixture = TestBed.createComponent(NetrunnerCmp);
        comp = fixture.componentInstance;

        de = fixture.debugElement.query(By.css('.netrunner-cmp'));
        el = de.nativeElement;
    }));

    it('Should create a netrunner component', () => {
        expect(comp).toBeDefined("We should have the Netrunner comp");
        expect(el).toBeDefined("We should have a top level element");
    });

    it("We should be able to search for cards by text", () => {
        comp.allCards = []; // Render nothing, do not load actual image data.

        let none = comp.checkCards(comp.allCards, 'narp', 2);
        expect(_.isEmpty(none)).toBe(true, "No cards to sort, so yeah it should be empty");

        comp.searchFullText = false;
        comp.allCards = service.getDistinctNamedCards();
        let noiseCard = comp.textFilters(comp.allCards, 'Noise');
        expect(noiseCard.length).toBe(1, "There is only one card with noise in the title.");

        let searchFullText = true;
        let fullTextNoise = comp.textFilters(comp.allCards, 'Noise', searchFullText);
        expect(fullTextNoise.length).toBe(9, "There appear to be about 11 of these");

        // Now enable all the other filters, and use the checkCards (uses all filters)
        fixture.detectChanges();

        comp.searchFullText = true;
        let restrictResults = comp.checkCards(comp.allCards, 'Noise', 3);
        expect(restrictResults.length).toBe(3, "Ensure we are only rendering an amount asked for");

        comp.searchFullText = false;
        let checkNoiseCard = comp.checkCards(comp.allCards, 'Noise', 5);
        expect(checkNoiseCard.length).toBe(1, "There is only one card with noise in the title.");
    });


    it("Should be able to render matching cards", () => {
        comp.allCards = service.getDistinctNamedCards();
        fixture.detectChanges();
        expect($('.card-cmp').length).toBe(0, "We should start with no cards visible.");


        comp.showImages = false;
        comp.searchFullText = false;
        comp.matchedCards = comp.checkCards(comp.allCards, 'Noise', 2);
        fixture.detectChanges();
        expect($('.card-cmp').length).toBe(1, "We should be rendering 1 card.");
        expect($('.card-img').length).toBe(0, "It should NOT be rendering the images.");
    });

    it("Should only show images after a certain delay time.", () => {
        expect(comp.showImagesAfterDelay(5)).toBe(false,
            "No searches made, it has no lastSearchTime"
        );
        comp.lastSearchTime = moment().subtract('seconds', 2);
        expect(comp.showImagesAfterDelay(5)).toBe(false,
            "We have a last update time, BUT it is too soon"
        );

        comp.lastSearchTime = moment().subtract('seconds', 6);
        expect(comp.showImagesAfterDelay(5)).toBe(true,
            "Now we have a search time, AND it also is long enough"
        );
    });

    it("Should be able to test which filters are enabled", () => {
        // Run something against the filter function (all enabled = all cards returned)
        comp.allCards = service.getDistinctNamedCards();
        fixture.detectChanges();

        expect(comp.packSelection).not.toBe(null, "Selection pack filters should be defined");
        expect(comp.typeSelection).not.toBe(null, "Selection type filters should be defined");
        expect(comp.factionSelection).not.toBe(null, "Selection faction filters should be defined");
        expect(comp.cycleSelection).not.toBe(null, "Selection cycle filters should be defined");

        let validate = [
            comp.packSelection,
            comp.typeSelection,
            comp.factionSelection,
            comp.cycleSelection
        ];
        _.each(validate, selectionLookup => {
            _.each(selectionLookup, (val, key) => {
                expect(val).toBe(true, "All the selection filters should be on.");
                expect(typeof key).toBe('string', "All the codes should be strings");
            });
        });
    });

    it("selecting only a single pack should filter down to that pack", () => {
        // Note all other filters must still pass
        let packs: Array<Pack> = service.getPackInstances();
        let cards: Array<Card> = service.determineCardLegality();
        comp.allCards = cards;
        fixture.detectChanges(); // Ensure the other filters are initialized

        let checkCards: Array<Card> = comp.selectionFilters();
        expect(cards.length).toBe(checkCards.length, "All cards should be returnedl");

        comp.packSelection = {};
        checkCards = comp.selectionFilters();
        expect(checkCards.length).toBe(0, "No legal packs, no cards.");

        comp.packSelection = {};
        let pack = packs[10]; // Find one in particular
        comp.packSelection[pack.code] = true; // Enable only one pack

        let expectPack: Array<Card> = comp.selectionFilters();
        expect(expectPack.length > 0).toBe(true, "We should have some cards");
        expect(expectPack.length < cards.length).toBe(true, "But not all cards should be allowed");
    });

    it("Can use the rotation filter to figure out what is actually legal", () => {
        let cards: Array<Card> = service.determineCardLegality();
        let checkCards: Array<Card> = comp.rotationFilters(cards, ROTATION.ALL);
        expect(checkCards.length).toBe(cards.length, "Null is the default, it is all cards.");

        // Test out cards that have rotated out (note a card can still be playable)
        let rotatedOut: Array<Card> = comp.rotationFilters(cards, ROTATION.OUT);
        expect(rotatedOut.length < cards.length).toBe(true, "It should rotate a bunch out.");
        let parasite = _.find(rotatedOut, {title: 'Parasite'});
        expect(parasite).not.toBe(undefined, "We should have parasite as a rotated card.");
        let crowdFunding = _.find(rotatedOut, {title: 'Crowd Funding'});
        expect(crowdFunding).toBe(undefined, "Crowd funding is super new, it should not rotate.");
        let eli = _.find(rotatedOut, {title: 'Eli 1.0'});
        expect(eli).not.toBe(undefined, "Eli is both rotated, and also not");
        expect(eli.pack.cycle.code).toBe('genesis', 'Str 4 ftw');

        // Test out currently legal cards
        let notRotated: Array<Card> = comp.rotationFilters(cards, ROTATION.IN);
        expect(notRotated.length < cards.length).toBe(true, "We should have legal cards.");
        expect(notRotated.length > rotatedOut.length).toBe(true, "There are more legal then rotated");
        expect(_.find(notRotated, {title: 'Noise: Hacker Extraordinaire'})).toBe(
            undefined, "Noise is a DJ"
        );
        expect(_.find(notRotated, {title: 'Oracle May'})).not.toBe(undefined, "May is fine");
        let newEli = _.find(notRotated, {title: 'Eli 1.0'});
        expect(newEli).not.toBe(undefined, "New eli is fine, it is in system_core_2019");
        expect(newEli.pack.cycle.code).toBe('sc19', "Ensure it is a new card.");
    });


    it("Should be able to handle the cycle filter which requires packs to all be defined.", () => {
        let cycles = service.getCycleInstances();
        let cards = service.determineCardLegality();
        comp.allCards = cards;
        fixture.detectChanges(); // Sets up all the filters

        let cycleCards: Array<Card> = comp.cycleFilter(cards, comp.cycleSelection);
        expect(cycleCards.length).toBe(cards.length, "All cycles are checked, they should come back.");

        let genesis = _.find(cycles, {name: 'Genesis'});
        expect(genesis).not.toBe(undefined, "We should have genesis");

        // Enable only this cycle
        comp.cycleSelection = {};
        comp.cycleSelection['sc19'] = false;
        comp.cycleSelection[genesis.code] = true;

        let genesisCards: Array<Card> = comp.cycleFilter(cards, comp.cycleSelection);
        expect(genesisCards.length < cards.length).toBe(true, "We should not have all cards.");
        expect(genesisCards.length > 0).toBe(true, "But we should have a bunch of cards.");
    });
});

