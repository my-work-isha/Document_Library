import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItsmtsTransComponent } from './itsmts-trans.component';


describe('ItsmtsTransComponent', () => {
  let component: ItsmtsTransComponent;
  let fixture: ComponentFixture<ItsmtsTransComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItsmtsTransComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItsmtsTransComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
