import BUAdSDK

class BytedanceBannerPresenter: NSObject,  BUNativeAdsManagerDelegate {
    let adManager = BUNativeAdsManager()
    private var controller: UIViewController?
    private var nativeAD: BUNativeAd?
     
    func present(withSlotID slotID: String, from viewController: UIViewController) {
        self.controller = viewController
        
        if self.nativeAD == nil {
            let slot1 = BUAdSlot()
            slot1.id = slotID;
            slot1.adType = .banner; //must
            slot1.position = .top;
            slot1.imgSize = BUSize(by: .banner600_90)
            slot1.isSupportDeepLink = true;
            slot1.isOriginAd = true
            
            let nativeAD = BUNativeAd(slot: slot1)
            nativeAD.rootViewController = viewController
            nativeAD.delegate = self
            self.nativeAD = nativeAD
        }
        
        nativeAD?.loadData()
    }
    
    func nativeAdsManagerSuccess(toLoad adsManager: BUNativeAdsManager, nativeAds nativeAdDataArray: [BUNativeAd]?) {
        
        guard let nativeAdDataArray = nativeAdDataArray else {
            return
        }
        
        
        guard let controller = controller else {
            return
        }
        
        let nativeAd = nativeAdDataArray[0];
        nativeAd.rootViewController = controller
        nativeAd.registerContainer(controller.view, withClickableViews: [controller.view])
        nativeAd.loadData()
        
//        for (BUNativeAd *model in nativeAdDataArray) {
//            NSUInteger index = rand() % dataSources.count;
//            [dataSources insertObject:model atIndex:index];
//        }
        
    }
    
    func nativeAdsManager(_ adsManager: BUNativeAdsManager, didFailWithError error: Error?) {
        if let error = error {
            print("FAILED:", error)
        }
    }
}



extension BytedanceBannerPresenter: BUNativeAdDelegate {
    func nativeAdDidLoad(_ nativeAd: BUNativeAd) {
        
    }
    
    func nativeAd(_ nativeAd: BUNativeAd, didFailWithError error: Error?) {
        guard
            let error = error,
            let erroCode = BUErrorCode(rawValue: (error as NSError).code)
        else {
            return
        }
        
        print(erroCode)
    }
    
    func nativeAdDidClick(_ nativeAd: BUNativeAd, with view: UIView?) {
        
    }
}

