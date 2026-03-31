import { MIN_VIDEOS_FOR_LEARNING } from '../../utils/constants.js'

export function shouldActivateLearning(analyzedVideos: number): boolean {
  return analyzedVideos >= MIN_VIDEOS_FOR_LEARNING
}
