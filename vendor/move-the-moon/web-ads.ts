// Native ads are unavailable in the bundled offline web game. No ad requests or rewards.
export const AdEventType = { CLOSED: 'closed', ERROR: 'error' };
export const RewardedAdEventType = { LOADED: 'loaded', EARNED_REWARD: 'earned' };
export const TestIds = { REWARDED: 'disabled' };
export const RewardedAd = { createForAdRequest: (_id: string) => ({ addAdEventListener: (_event: string, _callback: (...args: any[]) => void) => () => {}, load() {}, show() {} }) };
