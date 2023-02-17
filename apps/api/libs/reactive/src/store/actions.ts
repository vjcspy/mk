import { generateAction } from '@lib/reactive/util/store/createAction';

/*
 * Viết chuẩn là như thế này nhưng hơi dài dòng, bù lại lúc debug thì toẹt vời
 * */
const dummy = generateAction('DUMMY');
export const dummyAction = dummy.ACTION;
export const dummyAfter = dummy.AFTER;

export const dummyA = generateAction('DUMMY_A');
export const dummyB = generateAction('DUMMY_B');
export const dummyC = generateAction('DUMMY_C');
