import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Postear } from './postear';

describe('Postear', () => {
  let component: Postear;
  let fixture: ComponentFixture<Postear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Postear],
    }).compileComponents();

    fixture = TestBed.createComponent(Postear);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
