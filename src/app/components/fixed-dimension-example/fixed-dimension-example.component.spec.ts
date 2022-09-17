import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDimensionExampleComponent } from './fixed-dimension-example.component';

describe('BasicExampleComponent', () => {
  let component: FixedDimensionExampleComponent;
  let fixture: ComponentFixture<FixedDimensionExampleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDimensionExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDimensionExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
