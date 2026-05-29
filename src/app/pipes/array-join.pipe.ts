import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayJoin',
  standalone: true
})
export class ArrayJoinPipe implements PipeTransform {
  transform(value: any[], field: string, separator: string = ', '): string {
    if (!value || !Array.isArray(value)) return 'N/E';
    return value.map(item => item[field]).join(separator);
  }
}