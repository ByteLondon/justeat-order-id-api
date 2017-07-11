import { logger } from './logger'
import * as config from './config'
import { fetchInsights } from './facebook/insights'
import { fetchPosts } from './facebook/posts'
import { fetchCreatives, fetchCreativeId } from './facebook/creatives'
import * as Creatives from './model/facebook-creatives'
import * as async from 'async'
import { forIn } from 'lodash'

process.on('unhandledRejection', (err, promise) => {
  console.log('unhandled rejection', err, { promise })
})

const params = {
  since: '2017-05-06',
  until: '2017-07-07'
}

interface Params {
  since: string
  until: string
}

const posts = async (params: Params) =>
  await fetchPosts(config.facebookAccessToken, config.page.jeUk, params.since)

/*There will be ad_ids in the facebook_creatives table which will not 
be in the facebook_insights table due to those ads being inactive */
const creatives = async (params: Params) => {
  const creativeId = async id =>
    await fetchCreatives(config.facebookAccessToken, id, params.since)

  forIn(config.adAcount, async (val: string) => {
    const data = await fetchCreativeId(
      config.facebookAccessToken,
      val,
      params.since
    )
    async.map(
      data,
      async (ad, next) => {
        const creative = await creativeId(ad.adcreatives.data[0].id)
        next(null, {
          ad_id: ad.id,
          post_id: creative.effective_object_story_id
        })
      },
      (err, results) => results.forEach(async a => await Creatives.insert(a))
    )
  })
}

const insights = (params: Params) => {
  forIn(config.adAcount, async (val: string) => {
    await fetchInsights(
      config.facebookAccessToken,
      val,
      params.since,
      params.until
    )
  })
}

// insights(params)
// posts(params)
creatives(params)
