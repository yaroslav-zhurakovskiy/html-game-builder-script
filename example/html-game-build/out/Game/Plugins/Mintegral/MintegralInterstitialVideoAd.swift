class MintegralInterstitialVideoAd: SandboxObject {
    enum Method: String {
        case show
    }
    enum Argument: String, Hashable {
        case unitID
    }
    
    private let presenter = MTGInterstitialVideoAdPresenter()
    
    func invoke(_ method: String, with args: [String : Any], from viewController: WebGameController) {
        
        guard let result: (Method, [Argument: String]) = convertToTypedValues(method: method, arguments: args) else {
            return
        }
        
        let (method, input) = result
        
        switch method {
        case .show:
            if let unitID = input[.unitID] {
                presenter.present(from: viewController, unitID: unitID)
            }
        }
    }
}
