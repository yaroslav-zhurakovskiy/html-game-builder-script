import BUAdSDK

class BytedanceVideo: NSObject, SandboxObject, BUNativeAdsManagerDelegate {
    let adManager = BUNativeAdsManager()
    private var controller: WebGameController
    private var nativeAD: BUNativeAd?
    
    init(controller: WebGameController) {
        self.controller = controller
        super.init()
    }
    
    func invoke(_ method: String, with args: [String : Any], from viewController: WebGameController) {
    }
    
    func load(slotID: String, controller: UIViewController) {
        if self.nativeAD == nil {
            let slot1 = BUAdSlot()
            slot1.id = slotID;
            slot1.adType = .fullscreenVideo
            slot1.position = .fullscreen
            slot1.imgSize = BUSize(by: .drawFullScreen)
            slot1.isSupportDeepLink = true;
            slot1.isOriginAd = true
            
            let nativeAD = BUNativeAd(slot: slot1)
            nativeAD.rootViewController = controller
            nativeAD.delegate = self
            self.nativeAD = nativeAD
        }
        
        nativeAD?.loadData()
    }
}


extension BytedanceVideo: BUNativeAdDelegate {
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
