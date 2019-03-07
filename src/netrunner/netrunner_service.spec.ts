import {async, fakeAsync, getTestBed, tick, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {DebugElement} from '@angular/core';

import { RouterTestingModule } from '@angular/router/testing';
import {NetrunnerService} from './netrunner_service';
import {NetrunnerModule} from './netrunner_module';
import {Card, Cycle, Pack} from './types';

import * as _ from 'lodash';
declare var $;
describe('TestingNetrunnerService', () => {
    let fixture: ComponentFixture<NetrunnerService>;
    let service: NetrunnerService;
    let el: HTMLElement;
    let de: DebugElement;


    beforeEach(async( () => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, NetrunnerModule, HttpClientTestingModule],
            providers: [
                NetrunnerService
            ]
        }).compileComponents();

        service = TestBed.get(NetrunnerService);
    }));

    function getTotalCards() {
        return _.get(service.getCards(), 'total');
    }

    it('Should create a netrunner service', () => {
        expect(service).toBeDefined("Should have a service created by the test bed.");
    });


    it('Should be able to build out all the basic object types without error', () => {
        let cards: Array<Card> = service.getCardInstances();
        expect(cards).toBeDefined("What the shit, cards didn't even build?");
        expect(cards.length).toBe(getTotalCards(), "We should have like 1K cards.");

        let cycles: Array<Cycle> = service.getCycleInstances();
        expect(cycles).toBeDefined("Did you forget a return you monkey");
        expect(cycles.length).toBe(20, "Should have 20 cycles now");

        let packs: Array<Pack> = service.getPackInstances();
        expect(packs).toBeDefined("Packs not loading, wget / check in the json api?");
        expect(packs.length).toBe(60, "FML, just take all my money already");
    });


    it('Should be able to determine if a card is legal quickly', () => {
        let packs: Array<Pack> = service.determineLegalPacks();
        expect(packs).toBeDefined("We shouldn't be returning nothing");
        expect(packs.length > 0).toBe(true, "We should have a bunch of packs.");

        _.each(packs, pack => {
            expect(pack.cycle).toBeDefined("Each pack should have a cycle defined.");
        });
    });


    it('Should be able to determine the legality of every card', () => {
        let cards: Array<Card> = service.determineCardLegality();
        expect(cards).toBeDefined("Fucking list of all the damn cards.");
        expect(cards.length).toBe(getTotalCards(), "All the card objects are here, we have not filtered down yet.");
        _.each(cards, card => {
            expect(card.pack).toBeDefined("We should have assigned a pack to each and every card.");
        });

        let revisedCore: Array<Card> = service.getLegalCards();
        expect(revisedCore).toBeDefined("We should have a bunch of revised cards");
        expect(revisedCore.length < cards.length).toBe(true, "We should have many fewer revised core cards.");
        expect(revisedCore.length > 800).toBe(true, "There should be a lot of them.");
    });

    it("Should be able to determine specific known cards as a base test", () => {
        let bannedNoise: Card = new Card({pack_code: 'core', title: "Noise: Hacker Extraordinaire"});
        let bannedSanSan: Card = new Card({pack_code: 'ta', title: 'Vamp'});
        let core2Beale: Card = new Card({pack_code: 'core2', title: 'Project Beale'});
        let eliLegal: Card = new Card({pack_code: 'sc19', title: 'Eli 1.0'});
        let corroder: Card = new Card({pack_code: 'sc19', title: 'Corroder'});

        let nopes: Array<Card> = service.determineCardLegality([
            bannedNoise, bannedSanSan, core2Beale, eliLegal, corroder
        ]);
        expect(nopes.length).toBe(5, "We should get ALL cards back, just determine legal play");
        expect(bannedNoise.can_play).toBe(false, "No more Noise, This should not be legal");
        expect(bannedSanSan.can_play).toBe(false, "SanSan nope, This should not be legal");
        expect(core2Beale.can_play).toBe(false, "This made it into core2");
        expect(eliLegal.can_play).toBe(true, "Eli 1.0 is now legal");
        expect(corroder.can_play).toBe(true, "Corroder is now legel");


        let allCards = service.determineCardLegality();
        let bannedCards = service.getBannedCards();
        let legalCards = service.getLegalCards();

        expect(allCards.length > bannedCards.length).toBe(true, "The total should be more than the bans.");
        expect(allCards.length > legalCards.length).toBe(true, "Same for the count of legal to all cards.");
        expect(legalCards.length + bannedCards.length).toBe(allCards.length, "We should still add up to the total");
    });

    it('Should be able to get a distinct list of all the cards merging the legal core2 vs core', () => {
        let mergedCards = service.getDistinctNamedCards();
        let allCards = service.determineCardLegality();
        let bannedCards = service.getBannedCards();
        let legalCards = service.getLegalCards();

        expect(mergedCards.length < allCards.length).toBe(true,
            "We should have a lot of cards, but definitely some are banned"
        );

        let groups = _.groupBy(mergedCards, 'can_play');
        let mergedLegal = groups[true];
        let mergedBanned = groups[false];

        let count = 0;
        let mergedLookup = _.groupBy(mergedLegal, 'title');
        _.each(legalCards, function(card) {
            let mergedCard = mergedLookup[card.title];
            expect(!!mergedCard).toBe(true, "We should have all legal cards " + card.title);
            count++;
        });
        expect(count).toBe(legalCards.length, "We should have checked all legal Cards.");
    });
});
