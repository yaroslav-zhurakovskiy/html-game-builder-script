import BUAdSDK

class BytedanceRewardedPresenter: NSObject {
    private var videoAd: BUNativeExpressRewardedVideoAd?
    private var viewController: WebGameController?
    private var callbacks: [Callback: String]?
    
    func present(withSlotID slotID: String, from viewController: WebGameController, callbacks: [Callback: String]) {
        self.viewController = viewController
        self.callbacks = callbacks
        
        let model = BURewardedVideoModel()
        model.userId = "123"
        videoAd = BUNativeExpressRewardedVideoAd(slotID: slotID, rewardedVideoModel: model)
        videoAd?.delegate = self
        videoAd?.loadData()
    }
}

extension BytedanceRewardedPresenter: BUNativeExpressRewardedVideoAdDelegate {
    func nativeExpressRewardedVideoAdViewRenderSuccess(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
        guard let videoAd = videoAd, videoAd.isAdValid else {
            return
        }
        
        if let viewController = viewController {
            videoAd.show(fromRootViewController: viewController)
        }
    }
    
    func nativeExpressRewardedVideoAdDidLoad(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
        print("\(#function)")
    }
    
    func nativeExpressRewardedVideoAdDidDownLoadVideo(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
        print("\(#function)")
    }
    
    func nativeExpressRewardedVideoAdViewRenderFail(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd, error: Error?) {
        print("\(#function) \(error!)")
        videoAd?.loadData()
    }
    
    func nativeExpressRewardedVideoAd(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd, didFailWithError error: Error?) {
        if let callback = callbacks?[.onFail] {
            viewController?.invokeCallback(callback, param: ["error": error!.localizedDescription])
        }
        print("\(#function) \(error!)")
    }
    
    func nativeExpressRewardedVideoAdDidClose(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
        videoAd = nil
    }

    func nativeExpressRewardedVideoAdServerRewardDidSucceed(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd, verify: Bool) {
        if let callback = callbacks?[.onRewarded] {
            viewController?.invokeCallback(callback, param: ["verify": verify])
        }
    }
    
    func nativeExpressRewardedVideoAdDidVisible(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
        if let callback = callbacks?[.onShown] {
            viewController?.invokeCallback(callback)
        }
    }
}
