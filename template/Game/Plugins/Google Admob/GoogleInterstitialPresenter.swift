import GoogleMobileAds

class GoogleInterstitialPresenter: NSObject, GADInterstitialDelegate {
    private var interstitial: GADInterstitial?
    private var adUnitID: String?
    
    var viewControllerToPresentIn: UIViewController?
    
    override init() {
        super.init()
    }
    
    func initialize(withAdUnitID id: String) {
        adUnitID = id
        interstitial = createAndLoadInterstitial(delegate: self, adUnitID: id)
    }
    
    func present(from viewController: UIViewController) {
        guard let interstitial = interstitial else {
            return
        }
        
        if interstitial.isReady {
            viewControllerToPresentIn = nil
            interstitial.present(fromRootViewController: viewController)
        } else {
            viewControllerToPresentIn = viewController
        }
    }
    
    func interstitialDidDismissScreen(_ interstitial: GADInterstitial) {
        reloadAd()
    }
    
    func interstitial(_ ad: GADInterstitial, didFailToReceiveAdWithError error: GADRequestError) {
        reloadAd()
    }
    
    func interstitialDidReceiveAd(_ interstitial: GADInterstitial) {
        if let controller = viewControllerToPresentIn {
            viewControllerToPresentIn = nil
            interstitial.present(fromRootViewController: controller)
        }
    }
    
    private func reloadAd() {
        if let adUnitID = adUnitID {
            self.interstitial = createAndLoadInterstitial(delegate: self, adUnitID: adUnitID)
        }
    }
}

private func createAndLoadInterstitial(delegate: GADInterstitialDelegate, adUnitID: String) -> GADInterstitial {
    let interstitial = GADInterstitial(adUnitID: adUnitID)
    interstitial.delegate = delegate
    interstitial.load(GADRequest())
    return interstitial
}