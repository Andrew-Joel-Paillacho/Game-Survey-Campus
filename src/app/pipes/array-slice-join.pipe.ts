import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arraySliceJoin',
  standalone: true
})
export class ArraySliceJoinPipe implements PipeTransform {
  transform(value: any[], field: string, limit: number = 3, separator: string = ', '): string {
    if (!value || !Array.isArray(value)) return 'N/E';
    return value.slice(0, limit).map(item => item[field]).join(separator);
  }
}