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

    it('Should create a netrunner component', () => {
        expect(comp).toBeDefined("We should have the Netrunner comp");
        expect(el).toBeDefined("We should have a top level element");
    });
    // Needs more
});

