import UIKit
import GoogleMobileAds

class GoogleRewardedBannerPresenter: NSObject {
    private var rewardedAd: GADRewardedAd?
    private var webGameController: WebGameController?
    
    func present(from viewController: WebGameController, withAdUnitID adUnitID: String) {
        rewardedAd = GADRewardedAd(adUnitID: adUnitID)
       
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
        webGameController?.invokeCallback(
            withName: .onShown,
            param: ["reward": ["type": reward.type, "amount": reward.amount]]
        )
    }
    
    func rewardedAd(_ rewardedAd: GADRewardedAd, didFailToPresentWithError error: Error) {
        webGameController?.invokeCallback(withName: .onFailed, param: ["error": ["msg": error.localizedDescription]])
    }
}
