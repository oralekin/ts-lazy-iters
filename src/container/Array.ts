import { CContainer } from "./Container";
import CIterator from "../Iterator";

export default class CArray<I> extends Array<I> implements CContainer<I> {
    from_iter(iter: CIterator<I>): CArray<I> {
        const arr = new CArray<I>();

        let item = iter.next();
        while (item.isSome) {
            arr.push(item.unwrap());
            item = iter.next()
        }

        return arr;
    }
}