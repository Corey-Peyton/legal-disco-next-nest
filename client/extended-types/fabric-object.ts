import { HorizontalDirection, VerticalDirection } from '@/enums/direction';
import { fabric } from 'fabric';

export class FabricObject extends fabric.Object {
    horizontal = HorizontalDirection.Left;
    horizontalOffset = 0;
    vertical = VerticalDirection.Top;
    verticalOffset = 0;
}
