#import "MTGBannerAdViewPresenter.h"


@interface MTGBannerAdViewPresenter() <MTGBannerAdViewDelegate>

@property (nonatomic, strong) MTGBannerAdView *bannerAdView;

@end

@implementation MTGBannerAdViewPresenter

- (void)presentFromViewController:(nonnull UIViewController *)controller
                             size:(MTGBannerSizeType)size
                  autoRefreshTime:(NSNumber *)autoRefreshTime
                           unitID:(nonnull NSString *)unitID {
    [self dismiss];
    self.bannerAdView = [[MTGBannerAdView alloc] initBannerAdViewWithBannerSizeType:size
                                                                             unitId:unitID rootViewController:controller];
    
    if (autoRefreshTime) {
        self.bannerAdView.autoRefreshTime = [autoRefreshTime integerValue];
    }
    
    self.bannerAdView.delegate = self;
    [controller.view addSubview:self.bannerAdView];
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
