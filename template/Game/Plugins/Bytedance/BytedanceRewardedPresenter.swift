import BUAdSDK

class BytedanceRewardedPresenter: NSObject,  BUNativeAdsManagerDelegate {
    let adManager = BUNativeAdsManager()
    private var nativeAD: BUNativeAd?
    
    func present(withSlotID slotID: String, from viewController: UIViewController) {
        if self.nativeAD == nil {
            let slot1 = BUAdSlot()
            slot1.id = slotID;
            slot1.adType = .rewardVideo
            slot1.position = .fullscreen
            slot1.isSupportDeepLink = true;
            slot1.isOriginAd = true
            
            let nativeAD = BUNativeAd(slot: slot1)
            nativeAD.rootViewController = viewController
            nativeAD.delegate = self
            self.nativeAD = nativeAD
        }
        
        nativeAD?.loadData()
    }
}


extension BytedanceRewardedPresenter: BUNativeAdDelegate {
    func nativeAdDidLoad(_ nativeAd: BUNativeAd) {
        
    }
    
    func nativeAd(_ nativeAd: BUNativeAd, didFailWithError error: Error?) {
        guard
            let error = error,
            let erroCode = BUErrorCode(rawValue: (error as NSError).code)
            else {
                return
        }
        
        print("Video error", erroCode)
    }
    
    func nativeAdDidClick(_ nativeAd: BUNativeAd, with view: UIView?) {
        
    }
}
