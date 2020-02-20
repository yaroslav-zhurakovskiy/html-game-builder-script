import BUAdSDK

class BytedanceVideoPresenter: NSObject {
    private var videoAd: BUNativeExpressFullscreenVideoAd?
    private var viewController: UIViewController?
        
    func present(withSlotID slotID: String, from viewController: UIViewController) {
        self.viewController = viewController
        
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
        videoAd?.loadData()
    }
    
    func nativeExpressFullscreenVideoAd(_ fullscreenVideoAd: BUNativeExpressFullscreenVideoAd, didFailWithError error: Error?) {
       print("\(#function) failed: \(error!)")
    }
    
    func nativeExpressFullscreenVideoAdDidClose(_ fullscreenVideoAd: BUNativeExpressFullscreenVideoAd) {
        videoAd = nil
    }
}
