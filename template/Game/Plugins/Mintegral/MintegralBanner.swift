public class MintegralBanner: SandboxObject {
    
    private static let defaultAdUnitID: String? = "193837"
    private static let defaultSize: String? = "largeBannerType320x90"
    

    enum Method: String {
        case show
        case hide
    }
    
    enum Argument: String, Hashable {
        case size
        case unitID
        case autoRefreshTime
    }
    
    private let presenter = MTGBannerAdViewPresenter()
    
    func invoke(
        _ method: String,
        with args: [String : Any],
        from viewController: WebGameController
    ) {
      
        guard let result: (Method, [Argument: String]) = convertToTypedValues(method: method, arguments: args) else {
            return
        }
        
        let (method, input) = result
    
            
        switch method {
        case .show:
           show(from: viewController, with: input)
        case .hide:
            presenter.dismiss()
        }
    }
    
    private func show(from viewController: UIViewController, with input: [Argument: String]) {
        var unitID: String!
        var size: String!

        if let unitIDInput = input[.unitID], let sizeInput = input[.size] {
            unitID = unitIDInput
            size = sizeInput
        } else if let defaultAdUnitID = Self.defaultAdUnitID, let defaultSize = Self.defaultSize {
            unitID = defaultAdUnitID
            size = defaultSize
        } else {
            return
        }
        
        let autoRefreshTime: NSNumber?
        if let value = input[.autoRefreshTime] {
            let formatter = NumberFormatter()
            autoRefreshTime = formatter.number(from: value)
        } else {
            autoRefreshTime = nil
        }
        
        presenter.present(
            from: viewController,
            size: convertSizeStringToBannerSizeType(size),
            autoRefreshTime: autoRefreshTime,
            unitID: unitID
        )
    }
    
    private func convertSizeStringToBannerSizeType(_ size: String) -> MTGBannerSizeType {
        let typeMap: [String: MTGBannerSizeType] = [
            "mediumRectangularBanner300x250": .mediumRectangularBanner300x250,
            "largeBannerType320x90": .largeBannerType320x90,
            "smartBannerType": .smartBannerType,
            "standardBannerType320x50": .standardBannerType320x50
        ]
        
        return typeMap[size] ?? .smartBannerType
    }
}
