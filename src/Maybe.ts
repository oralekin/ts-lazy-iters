enum State {
  None,
  Some,
}

export default class Maybe<T> {
  private readonly state: State;
  private readonly inner?: T;

  constructor(value?: T) {
    if (value === undefined) {
      this.state = State.None;
    } else {
      this.state = State.Some;
      this.inner = value;
    }
  }

  unwrap(): T {
    switch (this.state) {
      case State.None:
        throw "tried to unwrap none";
      case State.Some:
        return this.inner as T;
    }
  }

  unwrap_or(value: T): T {
    switch (this.state) {
      case State.None:
        return value;
      case State.Some:
        return this.inner as T;
    }
  }

  unwrap_or_else(fn: () => T): T {
    switch (this.state) {
      case State.None:
        return fn();
      case State.Some:
        return this.inner as T;
    }
  }


  map<U>(f: (value: T) => U): Maybe<U> {
    switch (this.state) {
      case State.None:
        return new Maybe();
      case State.Some:
        return new Maybe(f(this.inner!));
    }
  }

  flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U> {
    switch (this.state) {
      case State.None:
        return new Maybe();
      case State.Some:
        return f(this.inner!);
    }
  }

  get isSome(): boolean {
    switch (this.state) {
      case State.None:
        return false;
      case State.Some:
        return true;
    }
  }

  get isNone(): boolean {
    return !this.isSome;
  }
}

export const some = (v: any) => new Maybe(v);
export const none = <T>(): Maybe<T> => new Maybe(); 
