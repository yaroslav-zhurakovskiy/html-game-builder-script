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
        if let object = handlers[request.object], let method = request.method {
            object.invoke(method, with: request.arguments, from: viewController)
        } else if request.object == sandboxAdObjectSystemName, let method = request.method {
            forEachSandboxAdObject { $0.invoke(method, with: request.arguments, from: viewController) }
        } else {
            if request.object == "banner" {
                var args: [String: Any] = request.arguments
                args["adUnitID"] = extractIdentifier(fromRequestMethod: request.method)
                forEachSandboxAdObject { $0.showBanner(args: args, from: viewController) }
            } else if request.object.starts(with: "interstitial") {
                var args: [String: Any] = request.arguments
                args["adUnitID"] = extractIdentifier(fromRequestMethod: request.method)
                forEachSandboxAdObject { $0.showInterstitial(args: args, from: viewController) }
            } else if request.object == "video" {
                var args: [String: Any] = request.arguments
                args["adUnitID"] = extractIdentifier(fromRequestMethod: request.method)
                forEachSandboxAdObject { $0.showVideo(args: args, from: viewController) }
            } else if request.object == "splash" {
                var args: [String: Any] = request.arguments
                args["adUnitID"] = extractIdentifier(fromRequestMethod: request.method)
                forEachSandboxAdObject { $0.showSplash(args: args, from: viewController) }
            }
        }
    }
    
    private func forEachSandboxAdObject(block: (SandboxAdObject) -> Void) {
        for (_, handler) in handlers {
            if let object = handler as? SandboxAdObject {
                block(object)
            }
        }
    }
    
    private func extractIdentifier(fromRequestMethod method: String?) -> String? {
        guard let method = method else {
            return nil
        }
        
        if method.contains("/") {
            return method.components(separatedBy: "/").last
        } else {
            return method
        }
    }
    
    func viewWillTransition(_ view: UIView, to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        handlers.values.forEach { $0.viewWillTransition(view, to: size, with: coordinator) }
    }
    
    func viewDidLayoutSubviews(_ view: UIView) {
        handlers.values.forEach { $0.viewDidLayoutSubviews(view) }
    }
}
