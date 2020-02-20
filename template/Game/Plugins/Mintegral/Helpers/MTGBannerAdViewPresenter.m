#import "MTGBannerAdViewPresenter.h"


@interface MTGBannerAdViewPresenter() <MTGBannerAdViewDelegate>

@property (nonatomic, strong) MTGBannerAdView *bannerAdView;

@end

@implementation MTGBannerAdViewPresenter

- (void)presentFromViewController:(nonnull UIViewController *)controller
                             size:(MTGBannerSizeType)sizeType
                        placement:(NSInteger)placement
                  autoRefreshTime:(NSNumber *)autoRefreshTime
                           unitID:(nonnull NSString *)unitID {
    [self dismiss];
    self.bannerAdView = [[MTGBannerAdView alloc] initBannerAdViewWithBannerSizeType:sizeType
                                                                             unitId:unitID
                                                                 rootViewController:controller];
    
    if (autoRefreshTime) {
        self.bannerAdView.autoRefreshTime = [autoRefreshTime integerValue];
    }
    
    [controller.view addSubview:self.bannerAdView];
    self.bannerAdView.translatesAutoresizingMaskIntoConstraints = NO;

    [NSLayoutConstraint activateConstraints:^NSArray *{
        CGSize size = [MTGAdSize getSizeBySizeType:sizeType];

        if (@available(iOS 9.0, *)) {
            NSMutableArray *constraints = [@[
                [self.bannerAdView.centerXAnchor constraintEqualToAnchor: controller.view.centerXAnchor],
                [self.bannerAdView.widthAnchor constraintEqualToConstant:size.width],
                [self.bannerAdView.heightAnchor constraintEqualToConstant:size.height]
            ] mutableCopy];
            
             if (@available(iOS 11.0, *)) {
                if (placement == 0) { // top
                    [constraints addObject:[self.bannerAdView.topAnchor constraintEqualToAnchor: controller.view.safeAreaLayoutGuide.topAnchor]];
                } else {
                    [constraints addObject:[self.bannerAdView.bottomAnchor constraintEqualToAnchor: controller.view.safeAreaLayoutGuide.bottomAnchor]];
                }
             } else {
                if (placement == 0) { // top
                    [constraints addObject:[self.bannerAdView.topAnchor constraintEqualToAnchor: controller.view.topAnchor]];
                } else {
                    [constraints addObject:[self.bannerAdView.bottomAnchor constraintEqualToAnchor: controller.view.bottomAnchor]];
                }
             }
            return constraints;
        } else {
            return @[];
        }
    }()];
    self.bannerAdView.delegate = self;
    [self.bannerAdView loadBannerAd];
}

- (void)dismiss {
    [self.bannerAdView destroyBannerAdView];
}

- (void)adViewCloseFullScreen:(MTGBannerAdView *)adView {
    
}

- (void)adViewClosed:(MTGBannerAdView *)adView {
    
}

- (void)adViewDidClicked:(MTGBannerAdView *)adView {
    
}

- (void)adViewLoadFailedWithError:(NSError *)error adView:(MTGBannerAdView *)adView {
    NSLog(@"Failed to load ads, error:%@", error.localizedDescription);
    [adView loadBannerAd];

}

- (void)adViewLoadSuccess:(MTGBannerAdView *)adView {
    
}

- (void)adViewWillLeaveApplication:(MTGBannerAdView *)adView {
    
}

- (void)adViewWillLogImpression:(MTGBannerAdView *)adView {
    
}

- (void)adViewWillOpenFullScreen:(MTGBannerAdView *)adView {
    
}

@end
