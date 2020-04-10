import BUAdSDK

class BytedanceRewardedPresenter: NSObject {
    private var videoAd: BUNativeExpressRewardedVideoAd?
    private var viewController: WebGameController?
    
    func present(withSlotID slotID: String, from viewController: WebGameController) {
        self.viewController = viewController
        
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
        viewController?.invokeCallback(withName: .onFailed, param: ["error": error!.localizedDescription])
        print("\(#function) \(error!)")
    }
    
    func nativeExpressRewardedVideoAdDidClose(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
        videoAd = nil
    }

    func nativeExpressRewardedVideoAdServerRewardDidSucceed(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd, verify: Bool) {
        viewController?.invokeCallback(withName: .onReward, param: ["verify": verify])
    }
    
    func nativeExpressRewardedVideoAdDidVisible(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
        viewController?.invokeCallback(withName: .onShown)
    }
}
