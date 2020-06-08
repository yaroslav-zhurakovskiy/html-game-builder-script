import BUAdSDK

class BytedanceInterstitialPresenter: NSObject  {
    private var interstitialAd: BUNativeExpressInterstitialAd?
    private var viewController: WebGameController?
    private var callbacks: [Callback: String]?
    
    func present(withSlotID slotID: String, adSize: CGSize, from viewController: WebGameController, callbacks: [Callback: String]) {
        self.viewController = viewController
        self.callbacks = callbacks
        
        interstitialAd = BUNativeExpressInterstitialAd(slotID: slotID, adSize:adSize )
        interstitialAd?.delegate = self
        interstitialAd?.loadData()
    }
}

extension BytedanceInterstitialPresenter: BUNativeExpresInterstitialAdDelegate {
    func nativeExpresInterstitialAdRenderSuccess(_ interstitialAd: BUNativeExpressInterstitialAd) {
        if let viewController = viewController {
            interstitialAd.show(fromRootViewController: viewController)
        }
    }
    
    func nativeExpresInterstitialAdDidClick(_ interstitialAd: BUNativeExpressInterstitialAd) {
        if let callback = callbacks?[.onClicked] {
            viewController?.invokeCallback(callback)
        }
    }
    
    func nativeExpresInterstitialAdDidClose(_ interstitialAd: BUNativeExpressInterstitialAd) {
        if let callback = callbacks?[.onDismissed] {
            viewController?.invokeCallback(callback)
        }

        GameTimer.notifyRestart()
    }
    
    func nativeExpresInterstitialAdWillVisible(_ interstitialAd: BUNativeExpressInterstitialAd) {
        if let callback = callbacks?[.onShown] {
            viewController?.invokeCallback(callback)
        }
    }
    
    func nativeExpresInterstitialAdRenderFail(_ interstitialAd: BUNativeExpressInterstitialAd, error: Error?) {
        if let callback = callbacks?[.onFail] {
            viewController?.invokeCallback(callback, param: ["error": error?.localizedDescription])
        }

        GameTimer.notifyRestart()
    }
    
    func nativeExpresInterstitialAd(_ interstitialAd: BUNativeExpressInterstitialAd, didFailWithError error: Error?) {
        if let callback = callbacks?[.onFail] {
            viewController?.invokeCallback(callback, param: ["error": error?.localizedDescription])
        }

        GameTimer.notifyRestart()
    }
}
