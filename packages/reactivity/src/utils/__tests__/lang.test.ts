import { isReserved, isSymbol } from "../lang";

describe('utils -> lang', () => {
  it('isReserved', () => {
    expect(isReserved('$global')).toBeTruthy();
  })

  it('isSymbol', () => {
    expect(isSymbol(Symbol('sss'))).toBeTruthy();
  })
})
