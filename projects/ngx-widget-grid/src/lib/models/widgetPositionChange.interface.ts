import { Rectangle } from './Rectangle.model';

export interface WidgetPositionChange {
  index: number;
  newPosition: Rectangle;
}
