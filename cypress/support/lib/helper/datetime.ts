import { Moment } from 'moment';

export function formatDatetime(moment: Moment) {
  return moment.format('YYYY-MM-DD HH:mm:ss')
}


export function formatDate(moment: Moment) {
  return moment.format('YYYY-MM-DD')
}