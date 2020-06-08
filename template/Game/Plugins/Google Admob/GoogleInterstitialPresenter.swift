import GoogleMobileAds

class GoogleInterstitialPresenter: NSObject, GADInterstitialDelegate {
    private var interstitial: GADInterstitial?
    private var adUnitID: String?
    private var callbacks: [Callback: String]?
    
    private var viewControllerToPresentIn: WebGameController?
    
    override init() {
        super.init()
    }
    
    func initialize(withAdUnitID id: String) {
        adUnitID = id
        interstitial = createAndLoadInterstitial(delegate: self, adUnitID: id)
    }
    
    func present(from viewController: WebGameController, callbacks: [Callback: String]) {
        self.callbacks = callbacks
        
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
        if let callback = callbacks?[.onDismissed] {
            viewControllerToPresentIn?.invokeCallback(callback)
        }
        GameTimer.notifyRestart()
        viewControllerToPresentIn = nil
        reloadAd()
    }
    
    func interstitial(_ ad: GADInterstitial, didFailToReceiveAdWithError error: GADRequestError) {
        if let callback = callbacks?[.onFail] {
            viewControllerToPresentIn?.invokeCallback(
                callback,
                param: ["error": ["code": error.code, "msg": error.localizedDescription]]
            )
        }
        reloadAd()
    }
    
     func interstitialWillPresentScreen(_ ad: GADInterstitial) {
        if let callback = callbacks?[.onShown] {
            viewControllerToPresentIn?.invokeCallback(callback)
        }
    }
    
    func interstitialDidReceiveAd(_ interstitial: GADInterstitial) {
        if let controller = viewControllerToPresentIn {
            interstitial.present(fromRootViewController: controller)
        }
    }

    func interstitialWillLeaveApplication(_ ad: GADInterstitial) {
        if let callback = callbacks?[.onClicked] {
            viewControllerToPresentIn?.invokeCallback(callback)
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
