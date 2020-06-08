import UIKit
import GoogleMobileAds

class GoogleRewardedBannerPresenter: NSObject {
    private var rewardedAd: GADRewardedAd?
    private var webGameController: WebGameController?
    private var callbacks: [Callback: String]?
    
    func present(from viewController: WebGameController, withAdUnitID adUnitID: String, callbacks: [Callback: String]) {
        rewardedAd = GADRewardedAd(adUnitID: adUnitID)
        self.callbacks = callbacks
       
        rewardedAd?.load(GADRequest()) { [weak self] error in
            guard let self = self else { return }
            
            if let error = error {
                print("Loading failed: \(error)")
            } else {
                self.rewardedAd?.present(fromRootViewController: viewController, delegate: self)
            }
        }
    }
}

extension GoogleRewardedBannerPresenter: GADRewardedAdDelegate {
    func rewardedAd(_ rewardedAd: GADRewardedAd, userDidEarn reward: GADAdReward) {
        if let callback = callbacks?[.onRewarded] {
            webGameController?.invokeCallback(
                callback,
                param: ["reward": ["type": reward.type, "amount": reward.amount]]
            )
        }
    }
    
    func rewardedAd(_ rewardedAd: GADRewardedAd, didFailToPresentWithError error: Error) {
        if let callback = callbacks?[.onFail] {
            webGameController?.invokeCallback(callback, param: ["error": ["msg": error.localizedDescription]])
        }
    }
    
    func rewardedAdDidPresent(_ rewardedAd: GADRewardedAd) {
        if let callback = callbacks?[.onShown] {
            webGameController?.invokeCallback(callback)
        }
    }
    
    func rewardedAdDidDismiss(_ rewardedAd: GADRewardedAd) {
        if let callback = callbacks?[.onDismissed] {
            webGameController?.invokeCallback(callback)
        }
        GameTimer.notifyRestart()
    }
}
