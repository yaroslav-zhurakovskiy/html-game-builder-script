import Foundation

class AdsTimer {
    private let interval: TimeInterval = 600
    private let webGameController: WebGameController
    private let objectName: String = sandboxAdObjectSystemName
    private let methodName: String = "showInterstitial"
    
    private var timer: Timer?
    
    init(webGameController: WebGameController) {
        self.webGameController = webGameController
    }
    
    func start() {
        timer = Timer.scheduledTimer(
            timeInterval: interval,
            target: self,
            selector: #selector(tick),
            userInfo: nil,
            repeats: true
        )
        
    }
    
    deinit {
        timer?.invalidate()
    }
    
    @objc private func tick() {
        webGameController.request(SandboxObjectRequest(
            object: objectName,
            method: methodName,
            arguments: [:]
        ))
    }
}
