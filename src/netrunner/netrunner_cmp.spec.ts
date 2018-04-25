import {async, fakeAsync, getTestBed, tick, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {DebugElement} from '@angular/core';

import { RouterTestingModule } from '@angular/router/testing';
import {NetrunnerCmp} from './netrunner_cmp';
import {NetrunnerService} from './netrunner_service';
import {NetrunnerModule} from './netrunner_module';
import {Card, Cycle, Pack} from './types';

import * as _ from 'lodash';
declare var $;
fdescribe('TestingNetrunnerCmp', () => {
    let fixture: ComponentFixture<NetrunnerCmp>;
    let service: NetrunnerService;
    let comp: NetrunnerCmp;
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
        fixture = TestBed.createComponent(NetrunnerCmp);
        comp = fixture.componentInstance;

        de = fixture.debugElement.query(By.css('.netrunner-cmp'));
        el = de.nativeElement;
    }));

    function getTotalCards() {
        return _.get(service.getCards(), 'total');
    }

    it('Should create a netrunner component', () => {
        expect(comp).toBeDefined("We should have the Netrunner comp");
        expect(el).toBeDefined("We should have a top level element");
    });


    it('Should be able to build out all the basic object types without error', () => {
        let cards: Array<Card> = service.getCardInstances();
        expect(cards).toBeDefined("What the shit, cards didn't even build?");
        expect(cards.length).toBe(getTotalCards(), "We should have like 1K cards.");

        let cycles: Array<Cycle> = service.getCycleInstances();
        expect(cycles).toBeDefined("Did you forget a return you monkey");
        expect(cycles.length).toBe(17, "Should have 17 cycles... what the fuck, how?");

        let packs: Array<Pack> = service.getPackInstances();
        expect(packs).toBeDefined("Packs not loading, wget / check in the json api?");
        expect(packs.length).toBe(57, "FML, just take all my money already");
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

        let revisedCore: Array<Card> = service.getRevisedCoreCards();
        expect(revisedCore).toBeDefined("We should have a bunch of revised cards");
        expect(revisedCore.length < cards.length).toBe(true, "We should have many fewer revised core cards.");
        expect(revisedCore.length > 800).toBe(true, "There should be a lot of them.");
    });

    it("Should be able to determine specific known cards as a base test", () => {
        let bannedNoise: Card = new Card({pack_code: 'core', title: "Noise: Hacker Extraordinaire"});
        let bannedSanSan: Card = new Card({pack_code: 'ta', title: 'Vamp'});
        let legalBeale: Card = new Card({pack_code: 'core2', title: 'Project Beale'});

        let nopes: Array<Card> = service.determineCardLegality([bannedNoise, bannedSanSan, legalBeale]);
        expect(nopes.length).toBe(3, "We should get ALL cards back, just determine legal play");
        expect(bannedNoise.can_play).toBe(false, "No more Noise, This should not be legal");
        expect(bannedSanSan.can_play).toBe(false, "SanSan nope, This should not be legal");
        expect(legalBeale.can_play).toBe(true, "This made it into core2");


        let allCards = service.determineCardLegality();
        let bannedCards = service.getBannedCoreCards();
        let legalCards = service.getRevisedCoreCards();

        expect(allCards.length > bannedCards.length).toBe(true, "The total should be more than the bans.");
        expect(allCards.length > legalCards.length).toBe(true, "Same for the count of legal to all cards.");
        expect(legalCards.length + bannedCards.length).toBe(allCards.length, "We should still add up to the total");
    });

});

