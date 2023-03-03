import { CContainer } from "./Container";
import CIterator from "../Iterator";

export default class CSet<I> extends Set<I> implements CContainer<I> {
    from_iter(iter: CIterator<I>): CSet<I> {
        const set = new CSet<I>();

        let item = iter.next();
        while (item.isSome) {
            set.add(item.unwrap());
            item = iter.next()
        }

        return set;
    }

}