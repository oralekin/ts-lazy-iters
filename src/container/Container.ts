import CIterator from "../Iterator";

export interface CContainer<I> {
    from_iter(iter: CIterator<I>): CContainer<I>
}