import BUAdSDK

class BytedanceSplashPresenter: NSObject  {
    private var splashView: BUNativeExpressSplashView?
    private var viewController: WebGameController?
    private var callbacks: [Callback: String]?
    
    func present(
        withSlotID slotID: String,
        adSize: CGSize,
        tolerateTimeout: TimeInterval?,
        from viewController: WebGameController,
        callbacks: [Callback: String]
    ) {
        self.viewController = viewController
        self.callbacks = callbacks
        
        splashView = BUNativeExpressSplashView(
            slotID: slotID,
            adSize: adSize,
            rootViewController: viewController
        )
        
        splashView?.delegate = self
        if let tolerateTimeout = tolerateTimeout {
            splashView?.tolerateTimeout = tolerateTimeout
        }
        splashView?.loadAdData()
    }
}

extension BytedanceSplashPresenter: BUNativeExpressSplashViewDelegate {
    func nativeExpressSplashViewRenderSuccess(_ splashAdView: BUNativeExpressSplashView) {
        viewController?.view.addSubview(splashAdView)
    }
    
    func nativeExpressSplashViewDidLoad(_ splashAdView: BUNativeExpressSplashView) {
        
    }
    
    func nativeExpressSplashView(_ splashAdView: BUNativeExpressSplashView, didFailWithError error: Error?) {
        splashView?.remove()
        splashView?.removeFromSuperview()

        if let callback = callbacks?[.onFail] {
            viewController?.invokeCallback(callback, param: ["error": error?.localizedDescription])
        }

        GameTimer.notifyRestart()
    }
    
    func nativeExpressSplashViewRenderFail(_ splashAdView: BUNativeExpressSplashView, error: Error?) {
        splashView?.remove()
        splashView?.removeFromSuperview()


        if let callback = callbacks?[.onFail] {
            viewController?.invokeCallback(callback, param: ["error": error?.localizedDescription])
        }

        GameTimer.notifyRestart()
    }
    
    func nativeExpressSplashViewWillVisible(_ splashAdView: BUNativeExpressSplashView) {
        if let callback = callbacks?[.onShown] {
            viewController?.invokeCallback(callback)
        }
    }
    
    func nativeExpressSplashViewDidClick(_ splashAdView: BUNativeExpressSplashView) {
        if let callback = callbacks?[.onClicked] {
            viewController?.invokeCallback(callback)
        }
    }
    
    func nativeExpressSplashViewDidClickSkip(_ splashAdView: BUNativeExpressSplashView) {
        if let callback = callbacks?[.onDismissed] {
            viewController?.invokeCallback(callback)
        }
        GameTimer.notifyRestart()
    }
    
    func nativeExpressSplashViewCountdown(toZero splashAdView: BUNativeExpressSplashView) {
        
    }
    
    func nativeExpressSplashViewDidClose(_ splashAdView: BUNativeExpressSplashView) {
        splashView?.remove()
        splashView?.removeFromSuperview()

        if let callback = callbacks?[.onDismissed] {
            viewController?.invokeCallback(callback)
        }
        GameTimer.notifyRestart()
    }
    
    func nativeExpressSplashViewFinishPlayDidPlayFinish(_ splashView: BUNativeExpressSplashView, didFailWithError error: Error) {
        if let callback = callbacks?[.onFail] {
            viewController?.invokeCallback(callback, param: ["error": error.localizedDescription])
        }
    }
    
    func nativeExpresInterstitialAdRenderSuccess(_ interstitialAd: BUNativeExpressInterstitialAd) {
        if let viewController = viewController {
            interstitialAd.show(fromRootViewController: viewController)
        }
    }
}
