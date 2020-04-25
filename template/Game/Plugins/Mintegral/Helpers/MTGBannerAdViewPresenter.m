#import "MTGBannerAdViewPresenter.h"
#import "Game-Swift.h"


@interface MTGBannerAdViewPresenter() <MTGBannerAdViewDelegate>

@property (nonatomic, strong) MTGBannerAdView *bannerAdView;

@property (nonatomic, weak) WebGameController *webGameController;
@property (nonatomic, copy) NSDictionary<NSString *, NSString *> *callbacks;

@end

@implementation MTGBannerAdViewPresenter

- (void)presentFromWebGameController:(nonnull WebGameController *)controller
                                size:(MTGBannerSizeType)sizeType
                           placement:(NSInteger)placement
                     autoRefreshTime:(NSNumber *)autoRefreshTime
                              unitID:(nonnull NSString *)unitID
                           callbacks:(NSDictionary<NSString *, NSString *> *)callbacks
{
    [self dismiss];
    
    self.webGameController = controller;
    self.callbacks = callbacks;
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
    NSString *callback = self.callbacks[CallbackName.onDismissed];
    if (callback) {
        [self.webGameController invokeCallback:callback param:nil];
    }
}

- (void)adViewDidClicked:(MTGBannerAdView *)adView {
    NSString *callback = self.callbacks[CallbackName.onClicked];
    if (callback) {
        [self.webGameController invokeCallback:callback param:nil];
    }
}

- (void)adViewLoadFailedWithError:(NSError *)error adView:(MTGBannerAdView *)adView {
    NSLog(@"Failed to load ads, error:%@", error.localizedDescription);
    
    NSString *callback = self.callbacks[CallbackName.onFail];
    if (callback) {
        [self.webGameController invokeCallback:callback param:@{@"error": error.localizedDescription}];
    }
    
    [adView loadBannerAd];

}

- (void)adViewLoadSuccess:(MTGBannerAdView *)adView {
    NSString *callback = self.callbacks[CallbackName.onShown];
    if (callback) {
        [self.webGameController invokeCallback:callback param:nil];
    }
}

- (void)adViewWillLeaveApplication:(MTGBannerAdView *)adView {
    
}

- (void)adViewWillLogImpression:(MTGBannerAdView *)adView {
    
}

- (void)adViewWillOpenFullScreen:(MTGBannerAdView *)adView {
    
}

@end
