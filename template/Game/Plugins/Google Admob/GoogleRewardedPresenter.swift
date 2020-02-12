import UIKit
import GoogleMobileAds

class GoogleRewardedBannerPresenter: NSObject {
    private var rewardedAd: GADRewardedAd?
    
    func present(from viewController: UIViewController, withAdUnitID adUnitID: String) {
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
        
    }
}
