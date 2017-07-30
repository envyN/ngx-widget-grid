/* Copyright VMware, Inc. All rights reserved. VMware Confidential */
import {Component} from "@angular/core";

@Component({
  moduleId: module.id,
  styleUrls: ['./demo.component.scss'],
  templateUrl: './demo.component.html'
})
export class DemoComponent {
  pos = {
    top: 2,
    left: 2,
    height: 1,
    width: 1
  };

  onWidgetChange(pos: any) {
    console.log('position changed : ', pos);
  }
}
