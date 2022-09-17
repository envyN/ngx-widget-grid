import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BasicExampleComponent } from './basic-example.component';

describe('BasicExampleComponent', () => {
  let component: BasicExampleComponent;
  let fixture: ComponentFixture<BasicExampleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
