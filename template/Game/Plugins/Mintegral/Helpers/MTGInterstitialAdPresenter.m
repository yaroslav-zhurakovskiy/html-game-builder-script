#import "MTGInterstitialAdPresenter.h"
#import "Game-Swift.h"

#import <UIKit/UIKit.h>
#import <MTGSDK/MTGSDK.h>
#import <MTGSDKInterstitial/MTGInterstitialAdManager.h>

@interface MTGInterstitialAdPresenter () <MTGInterstitialAdLoadDelegate, MTGInterstitialAdShowDelegate>

@property (nonatomic, strong) WebGameController *viewController;
@property (nonatomic, strong) MTGInterstitialAdManager * ivAdManager;

@end

@implementation MTGInterstitialAdPresenter

- (void)presentFromWebGameController:(WebGameController *)viewController
                              unitID:(NSString *)unitID {
    self.viewController = viewController;
    
    if (!self.ivAdManager && ![[self.ivAdManager currentUnitId] isEqualToString:unitID]) {
        self.ivAdManager = [[MTGInterstitialAdManager alloc] initWithUnitID:unitID
                                                                 adCategory:MTGInterstitial_AD_CATEGORY_ALL];
    }
    
    [self.ivAdManager loadWithDelegate:self];
}

- (void)onInterstitialLoadSuccess:(MTGInterstitialAdManager *)adManager {
    [adManager showWithDelegate:self presentingViewController:self.viewController];
}

- (void)onInterstitialShowFail:(NSError *)error adManager:(MTGInterstitialAdManager *)adManager {
    NSDictionary *param = @{
        @"error": @{
            @"code": @(error.code),
            @"msg": error.localizedDescription
        }
    };
    [self.viewController invokeCallbackWithName:@"onFailed"
                                          param:param];
}

- (void)onInterstitialShowSuccess:(MTGInterstitialAdManager *)adManager {
    [self.viewController invokeCallbackWithName:@"onShown"
                                          param:nil];
}

- (void)onInterstitialAdClick:(MTGInterstitialAdManager *)adManager {
    [self.viewController invokeCallbackWithName:@"onAdClicked"
                                          param:nil];
}

@end
