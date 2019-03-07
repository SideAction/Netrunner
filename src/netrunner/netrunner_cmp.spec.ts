import {async, fakeAsync, getTestBed, tick, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {DebugElement} from '@angular/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import { RouterTestingModule } from '@angular/router/testing';
import {NetrunnerCmp} from './netrunner_cmp';
import {NetrunnerService} from './netrunner_service';
import {NetrunnerModule} from './netrunner_module';
import {Card, Cycle, Faction, Pack} from './types';

import * as _ from 'lodash';
import * as moment from 'moment';
declare var $;
describe('TestingNetrunnerCmp', () => {
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

    it('Can render a card', () => {
         let cards = service.getDistinctNamedCards();
         fixture.detectChanges();
         expect($('.card-cmp').length).toBe(comp.limit, "We should start with no cards visible.");

         comp.showImages = false;
         let evt = {cards: [cards[0], cards[1]]};
         comp.onCardsMatch(evt);
         fixture.detectChanges();
         expect($('.card-cmp').length).toBe(2, "We should be rendering count cards");
         expect($('.card-img').length).toBe(0, "It should NOT be rendering the images.");
    });
});

