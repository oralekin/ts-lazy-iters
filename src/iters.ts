import CIterator from "./Iterator";
import Maybe, { none, some } from "./Maybe";


export class CRange extends CIterator<number> {
  private _next: number;
  private end?: number;

  constructor(start: number, end?: number) {
    super();
    this._next = start;
    this.end = end;
  }

  next(): Maybe<number> {
    if (this._next == this.end) {
      return none();
    } else {
      const ret = this._next;
      this._next += 1;
      return some(ret);
    }
  }
}

export function range(start: number, end?: number): CRange {
  return new CRange(start, end);
}


export class CRepeat<I> extends CIterator<I> {
  private value: I;
  constructor(value: I) {
    super();
    this.value = value;
  }
  next(): Maybe<I> {
    return some(this.value);
  }
}

export function repeat<I>(value: I): CRepeat<I> {
  return new CRepeat(value);
}


export class COnce<I> extends CIterator<I> {
  private value: I;
  private ended: boolean = false;

  constructor(value: I) {
    super();
    this.value = value;
  }

  next(): Maybe<I>  {
    if (this.ended) {
      return none();
    } else {
      this.ended = true;
      return some(this.value);
    }
  }
}
export function once<I>(value: I): COnce<I> {
  return new COnce(value);
}


export class CEmpty extends CIterator<any> {
  next() {
    return none();
  }
}

export function empty(): CEmpty {return new CEmpty()}
