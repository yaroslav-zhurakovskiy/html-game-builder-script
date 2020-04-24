import UIKit
import GoogleMobileAds

class GoogleBannerPresenter: NSObject {
    private let bannerView: GADBannerView
    
    private weak var webGameController: WebGameController?
    private var callbacks: [Callback: String]?
    
    override init() {
        bannerView = GADBannerView()
        bannerView.translatesAutoresizingMaskIntoConstraints = false
        super.init()
    }
    
    func present(
        from viewController: WebGameController,
        placement: BannerPlacement,
        withAdUnitID adUnitID: String,
        callbacks: [Callback: String]
    ) {
        bannerView.adUnitID = adUnitID
        bannerView.rootViewController = viewController
        
        self.webGameController = viewController
        self.callbacks = callbacks
        
        if bannerView.superview == nil {
            viewController.view.addSubview(bannerView)
            if #available(iOS 11.0, *) {
                NSLayoutConstraint.activate({
                    var constraints = [
                        bannerView.centerXAnchor.constraint(equalTo: viewController.view.safeAreaLayoutGuide.centerXAnchor),
                    ]
                    switch placement {
                    case .top:
                        constraints.append(bannerView.topAnchor.constraint(
                            equalTo: viewController.view.safeAreaLayoutGuide.topAnchor
                        ))
                    case .bottom:
                        constraints.append(bannerView.bottomAnchor.constraint(
                            equalTo: viewController.view.safeAreaLayoutGuide.bottomAnchor
                        ))
                    }
                    return constraints
                }())
            } else if #available(iOS 9, *) {
                NSLayoutConstraint.activate({
                    var constraints = [
                        bannerView.centerXAnchor.constraint(equalTo: viewController.view.centerXAnchor),
                    ]
                    switch placement {
                    case .top:
                        constraints.append(bannerView.topAnchor.constraint(
                            equalTo: viewController.view.topAnchor
                        ))
                    case .bottom:
                        constraints.append(bannerView.bottomAnchor.constraint(
                            equalTo: viewController.view.bottomAnchor
                        ))
                    }
                    return constraints
                }())
            }
        }
        
        loadBannerAd(view: viewController.view)
    }
    
    func viewWillTransition(
        _ view: UIView,
        to size: CGSize,
        with coordinator: UIViewControllerTransitionCoordinator
    ) {
        coordinator.animate(alongsideTransition: { _ in
            self.loadBannerAd(view: view)
        })
    }
    
    private func loadBannerAd(view: UIView) {
        let viewWidth: CGFloat
        if #available(iOS 11.0, *) {
            viewWidth = view.frame.inset(by: view.safeAreaInsets).width
        } else {
            viewWidth = view.frame.width
        }
        
        bannerView.adSize = GADCurrentOrientationAnchoredAdaptiveBannerAdSizeWithWidth(viewWidth)
        bannerView.delegate = self
        bannerView.load(GADRequest())
    }
}

extension GoogleBannerPresenter: GADBannerViewDelegate {
    func adViewDidReceiveAd(_ bannerView: GADBannerView) {
        if let callback = callbacks?[.onShown] {
            webGameController?.invokeCallback(callback)
        }
    }
    
    func adView(_ bannerView: GADBannerView, didFailToReceiveAdWithError error: GADRequestError) {
        if let callback = callbacks?[.onFail] {
            webGameController?.invokeCallback(callback, param: ["error": error.localizedRecoverySuggestion])
        }
    }
    
}
