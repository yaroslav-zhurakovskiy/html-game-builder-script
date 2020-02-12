import UIKit
import GoogleMobileAds

class GoogleBannerPresenter: NSObject {
    private let bannerView: GADBannerView
    
    override init() {
        bannerView = GADBannerView()
        bannerView.translatesAutoresizingMaskIntoConstraints = false
        super.init()
    }
    
    func present(from viewController: UIViewController, withAdUnitID adUnitID: String) {
        bannerView.adUnitID = adUnitID
        bannerView.rootViewController = viewController
        
        if bannerView.superview == nil {
            viewController.view.addSubview(bannerView)
            if #available(iOS 11.0, *) {
                NSLayoutConstraint.activate([
                    bannerView.topAnchor.constraint(equalTo: viewController.view.safeAreaLayoutGuide.topAnchor),
                    bannerView.leftAnchor.constraint(equalTo: viewController.view.safeAreaLayoutGuide.leftAnchor),
                    bannerView.rightAnchor.constraint(equalTo: viewController.view.safeAreaLayoutGuide.rightAnchor)
                ])
            } else if #available(iOS 9, *) {
                NSLayoutConstraint.activate([
                    bannerView.topAnchor.constraint(equalTo: viewController.view.topAnchor),
                    bannerView.leftAnchor.constraint(equalTo: viewController.view.leftAnchor),
                    bannerView.rightAnchor.constraint(equalTo: viewController.view.rightAnchor)
                ])
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
        
    }
    
    func adView(_ bannerView: GADBannerView, didFailToReceiveAdWithError error: GADRequestError) {
        
    }
}
