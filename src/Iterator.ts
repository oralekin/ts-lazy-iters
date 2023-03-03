import { CContainer } from "./container/Container";
import Maybe, { none, some } from "./Maybe";

export default abstract class CIterator<I> {
  abstract next(): Maybe<I>;

  
  
  collect_as<V extends CContainer<I>>(type: V): V {
    return type.from_iter(this) as V;
  }

  nth(n: number): Maybe<I> {
    let ret = none<I>();
    for (let i = 0; i < n; i++) {
      ret = this.next();
    }
    return ret;
  }

  skip(n: number) {
    for (let i = 0; i < n; i++) {
      this.next();
    }
    return this;
  }

  last(): Maybe<I> {
    let ret = this.next();
    let next = this.next();
    while (next.isSome) {
      ret = next;
      next = this.next();
    }

    return ret;
  }

  any(predicate: (value: I) => boolean): boolean {
    let cur = this.next();
    while (cur.isSome) {
      if (predicate(cur.unwrap())) return true;
      cur = this.next();
    }

    return false;
  }

  all(predicate: (value: I) => boolean): boolean {
    let cur = this.next();
    while (cur.isSome) {
      if (!predicate(cur.unwrap())) return false;
      cur = this.next();
    }

    return true;
  }

  forEach(f: (value: I) => void) {
    let cur = this.next();
    while (cur.isSome) {
      cur.map(f);
      cur = this.next();
    }

  }



  map<U>(f: (value: I) => U): CMap<I, U> {
    return new CMap(this, f);
  }

  flatMap<U>(f: (value: I) => CIterator<U>): CFlatMap<I, U> {
    return new CFlatMap(this, f);
  }

  take(len: number): CTake<I> {
    return new CTake(this, len);
  }

  filter(predicate: (value: I) => boolean): CFilter<I> {
    return new CFilter(this, predicate);
  }

  zip<U>(other: CIterator<U>): CZip<I, U> {
    return new CZip(this, other);
  }

  enumerate(): CEnumerate<I> {
    return new CEnumerate(this);
  }

  inspect(f: (value: I) => void): CInspect<I> {
    return new CInspect<I>(this, f);
  }

  chain(other: CIterator<I>) {
    return new CChain(this, other)
  }

}

export class CFlatMap<S, I> extends CIterator<I> {
  private source: CIterator<S>;
  private current: Maybe<CIterator<I>>;
  private f: (value: S) => CIterator<I>;

  constructor(source: CIterator<S>, f: (value: S) => CIterator<I>) {
    super();
    this.source = source;
    this.f = f;
    this.current = this.source.next().map(this.f);
  }

  next(): Maybe<I> {
    if (this.current.isNone) return none();
    else {
      // is current finished?
      let ret = this.current.unwrap().next();
      while (ret.isNone) {
        this.current = this.source.next().map(this.f);

        if (this.current.isNone) return none();
        else ret = this.current.unwrap().next();
      }

      return ret;
    }
  }
}

export class CMap<S, I> extends CIterator<I> {
  private source: CIterator<S>;
  private f: (value: S) => I;

  constructor(source: CIterator<S>, f: (value: S) => I) {
    super();
    this.source = source;
    this.f = f;
  }

  next(): Maybe<I> {
    const source = this.source.next();
    return source.map(this.f);
  }
}

export class CTake<I> extends CIterator<I> {
  private lenLeft: number;
  private source: CIterator<I>;

  constructor(source: CIterator<I>, len: number) {
    super();
    this.lenLeft = len;
    this.source = source;
  }

  next(): Maybe<I> {
    if (this.lenLeft > 0) {
      this.lenLeft--;
      return this.source.next();
    } else {
      return none();
    }
  }
}

export class CFilter<I> extends CIterator<I> {
  private source: CIterator<I>;
  private predicate: (value: I) => boolean;

  constructor(source: CIterator<I>, predicate: (value: I) => boolean) {
    super();
    this.predicate = predicate;
    this.source = source;
  }

  next(): Maybe<I> {
    while (true) {
      const source = this.source.next();
      if (source.isNone) {
        return none();
      } else {
        if (source.map(this.predicate).unwrap()) return source;
      }
    }
  }
}

export class CZip<L, R> extends CIterator<[L, R]> {
  private l: CIterator<L>;
  private r: CIterator<R>;

  constructor(l: CIterator<L>, r: CIterator<R>) {
    super();
    this.l = l;
    this.r = r;
  }

  next(): Maybe<[L, R]> {
    const l = this.l.next();
    const r = this.r.next();

    if (l.isSome && r.isSome) {
      return some([l.unwrap(), r.unwrap()]);
    } else {
      return none();
    }
  }
}

export class CEnumerate<I> extends CIterator<[number, I]> {
  private i = 0;
  private source: CIterator<I>;

  constructor(source: CIterator<I>) {
    super();
    this.source = source;
  }

  next(): Maybe<[number, I]> {
    const source = this.source.next();
    return source.map((v) => [this.i++, v]);
  }
}

export class CInspect<I> extends CIterator<I> {
  private source: CIterator<I>;
  private f: (value: I) => void;

  constructor(source: CIterator<I>, f: (value: I) => void) {
    super();
    this.source = source;
    this.f = f;
  }

  next(): Maybe<I> {
    return this.source.next().map((value) => {
      this.f(value);
      return value;
    });
  }
}

export class CChain<I> extends CIterator<I> {
  private current: CIterator<I>;
  private s: Maybe<CIterator<I>>;


  constructor(f: CIterator<I>, s: CIterator<I>) {
    super();
    this.current = f;
    this.s = some(s);  
  }


  next(): Maybe<I> {
    const next = this.current.next();
    if (next.isNone) {
      if (this.s.isNone) return none();
      this.current = this.s.unwrap();
      this.s = none();
      return this.current.next();
    }
    return next;
  }
}
