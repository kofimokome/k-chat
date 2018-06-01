import {Pipe, PipeTransform} from '@angular/core';
@Pipe({
    name: 'filter',
    pure: false
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], term: string): any {
        return term ? items.filter(item => (item.userDetails.username).match(new RegExp(term, 'g'))) : items;
    }
}

@Pipe({
    name: 'sortBy'
})
export class SortByPipe implements PipeTransform {
    transform(items: any[], sortedBy: string): any {
        return items.sort((a, b) => {
            return b[sortedBy] - a[sortedBy];
        });
    }
}