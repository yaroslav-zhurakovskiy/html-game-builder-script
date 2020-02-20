import BUAdSDK

class BytedanceBannerPresenter: NSObject {
    private var controller: UIViewController?
    private var bannerView: BUNativeExpressBannerView?
    private var placement: BannerPlacement?
    private var size: BUProposalSize?
    private var slotID: String?
    
    func present(
        withSlotID slotID: String,
        size: BUProposalSize,
        placement: BannerPlacement,
        from viewController: UIViewController
    ) {
        self.controller = viewController
        self.placement = placement
        self.size = size
        self.slotID = slotID
        
        recreateBanner()
        bannerView?.loadAdData()
    }
    
    func viewDidLayoutSubviews(_ view: UIView) {
        
    }
    
    private func recreateBanner() {
        guard
            let viewController = controller,
            let slotID = slotID,
            let size = size,
            let placement = placement
        else {
            return
        }
        
        self.bannerView?.removeFromSuperview()
        
       let addSize: CGSize = {
            let size = BUSize(by: size)!
            let screenWidth = viewController.view.bounds.width
            let bannerHeigh = screenWidth / CGFloat(size.width) * CGFloat(size.height);
            return CGSize(width: screenWidth, height: bannerHeigh)
        }()
        let bannerView = BUNativeExpressBannerView(
            slotID: slotID,
            rootViewController: viewController,
            adSize: addSize,
            isSupportDeepLink: true
        )
        
        bannerView.translatesAutoresizingMaskIntoConstraints = false
        bannerView.delegate = self
        
        viewController.view.addSubview(bannerView)
        resetConstraints(
            bannerView: bannerView,
            viewController: viewController,
            placement: placement,
            addSize: addSize
        )
        self.bannerView = bannerView
    }
    
    private func resetConstraints(
        bannerView: UIView,
        viewController: UIViewController,
        placement: BannerPlacement,
        addSize: CGSize
    ) {
        if #available(iOS 11.0, *) {
            NSLayoutConstraint.activate(
                {
                    let width = bannerView.widthAnchor.constraint(lessThanOrEqualToConstant: addSize.width)
                    let left = bannerView.leftAnchor.constraint(equalTo: viewController.view.safeAreaLayoutGuide.leftAnchor)
                    let right = bannerView.rightAnchor.constraint(equalTo: viewController.view.safeAreaLayoutGuide.rightAnchor)
                    let center = bannerView.centerXAnchor.constraint(equalTo: viewController.view.centerXAnchor)
                    let height = bannerView.heightAnchor.constraint(equalToConstant: addSize.height)
                    
                    left.priority = .defaultHigh
                    right.priority = .defaultHigh
                    var anchors = [left, right, center, width, height]
                    var finalAnchor: NSLayoutConstraint
                    switch placement {
                    case .top:
                        finalAnchor = bannerView.topAnchor.constraint(
                            equalTo: viewController.view.safeAreaLayoutGuide.topAnchor
                        )
                    case .bottom:
                        finalAnchor = bannerView.bottomAnchor.constraint(
                            equalTo: viewController.view.safeAreaLayoutGuide.bottomAnchor
                        )
                    }
                    anchors.append(finalAnchor)
                    
                    return anchors
                }()
            )
        } else if #available(iOS 9, *) {
            NSLayoutConstraint.activate(
                {
                    var anchors = [
                        bannerView.centerXAnchor.constraint(equalTo: viewController.view.centerXAnchor),
                        bannerView.widthAnchor.constraint(equalToConstant: addSize.width),
                        bannerView.heightAnchor.constraint(equalToConstant: addSize.height)
                    ]
                    var finalAnchor: NSLayoutConstraint
                    switch placement {
                    case .top:
                        finalAnchor = bannerView.topAnchor.constraint(
                            equalTo: viewController.view.topAnchor
                        )
                    case .bottom:
                        finalAnchor = bannerView.bottomAnchor.constraint(
                            equalTo: viewController.view.bottomAnchor
                        )
                    }
                    anchors.append(finalAnchor)
                    
                    return anchors
                }()
            )
        }
        
    }
}


extension BytedanceBannerPresenter: BUNativeExpressBannerViewDelegate {
    func nativeExpressBannerAdViewRenderSuccess(_ bannerAdView: BUNativeExpressBannerView) {
        print("Did load")
    }
    
    func nativeExpressBannerAdViewRenderFail(_ bannerAdView: BUNativeExpressBannerView, error: Error?) {
        print("Failed to load banner due to: \(error!)")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            bannerAdView.loadAdData()
        }
    }
    
    func nativeExpressBannerAdView(_ bannerAdView: BUNativeExpressBannerView, didLoadFailWithError error: Error?) {
        print("Failed to load banner due to: \(error!)")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            bannerAdView.loadAdData()
        }
    }
}