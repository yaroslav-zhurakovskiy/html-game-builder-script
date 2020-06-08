import BUAdSDK

class BytedanceVideoPresenter: NSObject {
    private var videoAd: BUNativeExpressFullscreenVideoAd?
    private var viewController: WebGameController?
    private var callbacks: [Callback: String]?
        
    func present(withSlotID slotID: String, from viewController: WebGameController, callbacks: [Callback: String]) {
        self.viewController = viewController
        self.callbacks = callbacks
        
        videoAd = BUNativeExpressFullscreenVideoAd(slotID: slotID)
        videoAd?.delegate = self
        videoAd?.loadData()
    }
}

extension BytedanceVideoPresenter: BUNativeExpressFullscreenVideoAdDelegate {
    func nativeExpressFullscreenVideoAdViewRenderSuccess(_ rewardedVideoAd: BUNativeExpressFullscreenVideoAd) {
        if let viewController = viewController {
            videoAd?.show(fromRootViewController: viewController)
        }
    }
    
    func nativeExpressFullscreenVideoAdViewRenderFail(_ rewardedVideoAd: BUNativeExpressFullscreenVideoAd, error: Error?) {
        print("\(#function) failed: \(error!)")
        if let callback = callbacks?[.onFail] {
            viewController?.invokeCallback(callback, param: ["error": error?.localizedDescription])
        }
        videoAd?.loadData()

        GameTimer.notifyRestart()
    }
    
    func nativeExpressFullscreenVideoAd(_ fullscreenVideoAd: BUNativeExpressFullscreenVideoAd, didFailWithError error: Error?) {
       print("\(#function) failed: \(error!)")
        if let callback = callbacks?[.onFail] {
            viewController?.invokeCallback(callback, param: ["error": error?.localizedDescription])
        }

        GameTimer.notifyRestart()
    }
    
    func nativeExpressFullscreenVideoAdDidClose(_ fullscreenVideoAd: BUNativeExpressFullscreenVideoAd) {
        if let callback = callbacks?[.onDismissed] {
            viewController?.invokeCallback(callback)
        }
        GameTimer.notifyRestart()
        videoAd = nil
    }
    
    func nativeExpressFullscreenVideoAdDidVisible(_ fullscreenVideoAd: BUNativeExpressFullscreenVideoAd) {
        if let callback = callbacks?[.onShown] {
            viewController?.invokeCallback(callback)
        }
    }
    
    func nativeExpressFullscreenVideoAdDidClick(_ fullscreenVideoAd: BUNativeExpressFullscreenVideoAd) {
        if let callback = callbacks?[.onClicked] {
            viewController?.invokeCallback(callback)
        }
    }
}
