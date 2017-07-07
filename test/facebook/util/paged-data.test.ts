import 'mocha'
import { expect } from 'chai'
import { determinePagination } from '../../../src/facebook/util/paged-data'
import insights from './insights-data.test'
import adCreativeIds from './adcreativeIds-data.test'

describe('It should paginate:', () => {
  const since = '2017-07-04'
  it('insight data correctly', () => {
    expect(determinePagination(insights, since)).to.be.true
  })
  it('adcreative data correctly', () => {
    expect(determinePagination(adCreativeIds, since)).to.be.true
  })
})
