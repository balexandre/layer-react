import Money from './Money'

describe(Money.centsToDollars, () => {
  it('turns cents into decimal', () => {
    const output = Money.centsToDollars(12345)
    expect(output).toEqual('123.45')
  })

  it('deals with round numbers', () => {
    const output = Money.centsToDollars(1230)
    expect(output).toEqual('12.30')
  })

  it('deals with rounder numbers', () => {
    const output = Money.centsToDollars(1200)
    expect(output).toEqual('12.00')
  })
})

describe(Money.dollarsToCents, () => {
  it('takes dollars and returns cents', () => {
    const output = Money.dollarsToCents('12.34')
    expect(output).toEqual(1234)
  })

  it('takes handles round numbers', () => {
    const output = Money.dollarsToCents('12.30')
    expect(output).toEqual(1230)
  })

  it('takes handles small numbers', () => {
    const output = Money.dollarsToCents('0.01')
    expect(output).toEqual(1)
  })

  it('takes handles slightly poorly formatted numbers', () => {
    const output = Money.dollarsToCents('.1')
    expect(output).toEqual(10)
  })
})
