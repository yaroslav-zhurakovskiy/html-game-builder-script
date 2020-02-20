import UIKit

public class SandboxObjectRequestHandler {
    private var handlers: [String: SandboxObject] = [:]
    
    func register<Object: SandboxObject>(_ object: Object) {
        handlers[Object.name] = object
    }
    
    func handle(
        _ request: SandboxObjectRequest,
        from viewController: WebGameController
    ) {
        if request.object == sandboxAdObjectSystemName {
            handlers.values.compactMap { $0 as? SandboxAdObject }.forEach { object in
                object.invoke(request.method, with: request.arguments, from: viewController)
            }
        } else if let object = handlers[request.object] {
            object.invoke(request.method, with: request.arguments, from: viewController)
        }
    }
    
    func viewWillTransition(_ view: UIView, to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        handlers.values.forEach { $0.viewWillTransition(view, to: size, with: coordinator) }
    }
    
    func viewDidLayoutSubviews(_ view: UIView) {
        handlers.values.forEach { $0.viewDidLayoutSubviews(view) }
    }
}
