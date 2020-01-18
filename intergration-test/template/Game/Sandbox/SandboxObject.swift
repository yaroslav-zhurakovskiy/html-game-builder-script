protocol SandboxNameRepresentable: RawRepresentable where RawValue == String {
    
}

typealias SandboxMethodName = SandboxNameRepresentable
typealias SandboxArgumentName = SandboxNameRepresentable & Hashable

protocol SandboxObject: class {
//    associatedtype Method: SandboxMethodName
//    associatedtype Argument: SandboxArgumentName
    
    static var name: String { get }
    
    func invoke(
        _ method: String,
        with args: [String: Any],
        from viewController: WebGameController
    )
}

extension SandboxObject {
    static var name: String { "\(self)" }
}
