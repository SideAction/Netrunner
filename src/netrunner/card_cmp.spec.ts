import {async, fakeAsync, getTestBed, tick, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {DebugElement} from '@angular/core';

import { RouterTestingModule } from '@angular/router/testing';
import {CardCmp} from './card_cmp';
import {NetrunnerService} from './netrunner_service';
import {NetrunnerModule} from './netrunner_module';
import {Card, Cycle, Pack} from './types';

import * as _ from 'lodash';
declare var $;
describe('TestingCardCmp', () => {
    let fixture: ComponentFixture<CardCmp>;
    let service: NetrunnerService;
    let comp: CardCmp;
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
        fixture = TestBed.createComponent(CardCmp);
        comp = fixture.componentInstance;

        de = fixture.debugElement.query(By.css('.card-cmp'));
        el = de.nativeElement;
    }));

    function getTotalCards() {
        return _.get(service.getCards(), 'total');
    }

    it('Should create a Card component', () => {
        expect(comp).toBeDefined("We should have the Netrunner comp");
        expect(el).toBeDefined("We should have a top level element");

    });

    it('Should be able to render a card without exploading and also have a class based on can_play', () => {
        let card = new Card({title: 'test', faction_code: 'test_faction'});
        comp.card = card;
        fixture.detectChanges();
        expect($('.card-details').length).toBe(1, "It should be rendered at this point");
    });

    it("Should not show the image by default, and cards should eval the two types of imageUrl correctly", () => {
        let card = new Card({title: 'test', image_url: "pass", code: "0"});
        expect(card.getImageUrl("fail")).toBe("pass", "It should prefer an image url set in the json data");

        let cardNoImg = new Card({title: "NoImg", image_url: "", code: "1"});
        expect(cardNoImg.getImageUrl("{code}_Pass")).toBe("1_Pass", "We should use the code + an image url  here");

        comp.card = card;
        fixture.detectChanges();
        expect($('.card-img').length).toBe(0, "By default we should NOT be showing an image");

        comp.showImage = true;
        fixture.detectChanges();
        expect($('.card-img').length).toBe(1, "Now we should be showing an image.");
    });

    it("Will render a card", () => {
        let card = new Card({title: 'TITLE', text: "some shit it does", image_url: "pass", code: "0"});
        comp.card = card;

        fixture.detectChanges();
        expect($('.card-text').text()).toBe(card.text);
    });

});

