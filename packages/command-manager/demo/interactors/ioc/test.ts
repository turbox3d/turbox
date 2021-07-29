import { Inject, Injectable } from './index';


@Injectable()
class A {
    log(str: string) {
        console.log(str);
    }
}

class B {
    @Inject() a: A;

    log() {
        this.a.log('quan');
    }
}

const b = new B();
b.log();