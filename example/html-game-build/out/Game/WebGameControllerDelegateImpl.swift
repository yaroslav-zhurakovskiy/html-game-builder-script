class WebGameControllerDelegateImpl: WebGameControllerDelegate {
    private let handler = SandboxObjectRequestHandler()
    
    init() {
        
        
        handler.register(MintegralBanner())
        handler.register(MintegralInterstitialVideoAd())
        
    }
    
    func webGameConroller(_ controller: WebGameController, didReceiveRequest request: SandboxObjectRequest) {   
        handler.handle(request, from: controller)
    }
}
