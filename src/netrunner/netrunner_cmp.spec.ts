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

    it('Should create a netrunner component', () => {
        expect(comp).toBeDefined("We should have the Netrunner comp");
        expect(el).toBeDefined("We should have a top level element");
    });

    it("We should be able to search for images by text", () => {
        comp.allCards = []; // Render nothing, do not load actual image data.

        let none = comp.checkCards(comp.allCards, 'narp', 2);
        expect(_.isEmpty(none)).toBe(true, "No cards to sort, so yeah it should be empty");

        comp.searchFullText = false;
        comp.allCards = service.getDistinctNamedCards();
        let noiseCard = comp.checkCards(comp.allCards, 'Noise', 5);
        expect(noiseCard.length).toBe(1, "There is only one card with noise in the title.");

        comp.searchFullText = true;
        let fullTextNoise = comp.checkCards(comp.allCards, 'Noise', 20);
        expect(fullTextNoise.length).toBe(11, "There appear to be about 11 of these");

        let restrictResults = comp.checkCards(comp.allCards, 'Noise', 3);
        expect(restrictResults.length).toBe(3, "Ensure we are only rendering an amount asked for");
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
        expect(comp.showImagesAfterDelay(5)).toBe(false, "No searches made, it has no lastSearchTime");

        comp.lastSearchTime = moment().subtract('seconds', 2);
        expect(comp.showImagesAfterDelay(5)).toBe(false, "We have a last update time, BUT it is too soon");

        comp.lastSearchTime = moment().subtract('seconds', 6);
        expect(comp.showImagesAfterDelay(5)).toBe(true, "Now we have a search time, AND it also is long enough");
    });
});

