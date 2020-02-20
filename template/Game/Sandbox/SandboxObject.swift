import UIKit

protocol SandboxNameRepresentable: RawRepresentable where RawValue == String {
    
}

typealias SandboxMethodName = SandboxNameRepresentable
typealias SandboxArgumentName = SandboxNameRepresentable & Hashable

protocol SandboxObject: class {
    static var name: String { get }
    
    func invoke(
        _ method: String,
        with args: [String: Any],
        from viewController: WebGameController
    )
    
    func viewWillTransition(_ view: UIView, to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator)
    
    func viewDidLayoutSubviews(_ view: UIView)
}

extension SandboxObject {
    func viewWillTransition(_ view: UIView, to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        
    }
    
    func viewDidLayoutSubviews(_ view: UIView) {
        
    }
}

protocol SandboxAdObject: SandboxObject {
    
}

let sandboxAdObjectSystemName = "$Ads"

extension SandboxObject {
    static var name: String { "\(self)" }
}
