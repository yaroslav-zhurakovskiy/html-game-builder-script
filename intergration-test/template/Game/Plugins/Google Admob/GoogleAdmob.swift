import UIKit

class GoogleAdmob: SandboxObject {
    enum Method: String {
        case present
        case initialize
    }
    
    enum Argument: String, Hashable {
        case adUnitID
    }
    
    
    private let presenter = GoogleInterstitialPresenter()
    
    func invoke(_ method: String, with args: [String : Any], from controller: WebGameController) {
        guard let result: (Method, [Argument: String]) = convertToTypedValues(method: method, arguments: args) else {
            return
        }
        
        let (method, input) = result
        
        switch method {
        case .initialize:
            if let adUnitID = input[.adUnitID] {
                presenter.initialize(withAdUnitID: adUnitID)
            }
        case .present:
            presenter.present(from: controller)
        }
    }
}
