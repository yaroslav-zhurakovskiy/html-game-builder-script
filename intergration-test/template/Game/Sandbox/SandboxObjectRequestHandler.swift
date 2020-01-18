public class SandboxObjectRequestHandler {
    private var handlers: [String: SandboxObject] = [:]
    
    func register<Object: SandboxObject>(_ object: Object) {
        handlers[Object.name] = object
    }
    
    func handle(
        _ request: SandboxObjectRequest,
        from viewController: WebGameController
    ) {
        if let object = handlers[request.object] {
            object.invoke(request.method, with: request.arguments, from: viewController)
        }
    }
}
