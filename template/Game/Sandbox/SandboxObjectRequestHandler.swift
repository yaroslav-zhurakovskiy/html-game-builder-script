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
        if let object = handlers[request.object] {
            object.invoke(request.method, with: request.arguments, from: viewController)
        } else if request.object == sandboxAdObjectSystemName {
            forEachSandboxAdObject { $0.invoke(request.method, with: request.arguments, from: viewController) }
        } else {
            if request.method.starts(with: "banner_ads") {
                let id = extractIdentifier(fromRequestMethod: request.method)
                forEachSandboxAdObject { $0.showBanner(adIdentifier: id, from: viewController) }
            } else if request.method.starts(with: "interstitial_ads") {
                let id = extractIdentifier(fromRequestMethod: request.method)
                forEachSandboxAdObject { $0.showInterstitial(adIdentifier: id, from: viewController) }
            } else if request.method.starts(with: "video_ads") {
                let id = extractIdentifier(fromRequestMethod: request.method)
                forEachSandboxAdObject { $0.showVideo(adIdentifier: id, from: viewController) }
            } else if request.method.starts(with: "interstitial_video") {
                let id = extractIdentifier(fromRequestMethod: request.method)
                forEachSandboxAdObject { $0.showInterstitialVideo(adIdentifier: id, from: viewController) }
            } else if request.method.starts(with: "interactive_ads") {
                let id = extractIdentifier(fromRequestMethod: request.method)
                forEachSandboxAdObject { $0.showInteractive(adIdentifier: id, from: viewController) }
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
    
    private func extractIdentifier(fromRequestMethod method: String) -> String? {
        if method.contains("/") {
            return method.components(separatedBy: "/").last
        } else {
            return nil
        }
    }
    
    func viewWillTransition(_ view: UIView, to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        handlers.values.forEach { $0.viewWillTransition(view, to: size, with: coordinator) }
    }
    
    func viewDidLayoutSubviews(_ view: UIView) {
        handlers.values.forEach { $0.viewDidLayoutSubviews(view) }
    }
}
