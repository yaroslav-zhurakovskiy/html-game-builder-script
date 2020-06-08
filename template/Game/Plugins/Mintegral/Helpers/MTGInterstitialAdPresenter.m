#import "MTGInterstitialAdPresenter.h"
#import "Game-Swift.h"

#import <UIKit/UIKit.h>
#import <MTGSDK/MTGSDK.h>
#import <MTGSDKInterstitial/MTGInterstitialAdManager.h>

@interface MTGInterstitialAdPresenter () <MTGInterstitialAdLoadDelegate, MTGInterstitialAdShowDelegate>

@property (nonatomic, weak) WebGameController *viewController;
@property (nonatomic, strong) MTGInterstitialAdManager * ivAdManager;
@property (nonatomic, strong) NSDictionary<NSString *, NSString *> *callbacks;

@end

@implementation MTGInterstitialAdPresenter

- (void)presentFromWebGameController:(WebGameController *)viewController
                              unitID:(NSString *)unitID
                           callbacks:( NSDictionary<NSString *, NSString *> *)callbacks
{
    self.viewController = viewController;
    self.callbacks = callbacks;
    
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
    NSString *callback = self.callbacks[CallbackName.onFail];
    if (callback) {
        [self.viewController invokeCallback:callback param:param];
    }

    [GameTimer notifyRestart];
}

- (void)onInterstitialLoadFail:(NSError *)error adManager:(MTGInterstitialAdManager *)adManager {
    NSDictionary *param = @{
        @"error": @{
                @"code": @(error.code),
                @"msg": error.localizedDescription
        }
    };
    NSString *callback = self.callbacks[CallbackName.onFail];
    if (callback) {
        [self.viewController invokeCallback:callback param:param];
    }
    
    [GameTimer notifyRestart];
}

- (void)onInterstitialShowSuccess:(MTGInterstitialAdManager *)adManager {
    NSString *callback = self.callbacks[CallbackName.onShown];
    if (callback) {
        [self.viewController invokeCallback:callback param:nil];
    }
}

- (void)onInterstitialClosed:(MTGInterstitialAdManager *)adManager {
    NSString *callback = self.callbacks[CallbackName.onDismissed];
    if (callback) {
        [self.viewController invokeCallback:callback param:nil];
    }
    [GameTimer notifyRestart];
}

- (void)onInterstitialAdClick:(MTGInterstitialAdManager *)adManager {
    NSString *callback = self.callbacks[CallbackName.onClicked];
    if (callback) {
        [self.viewController invokeCallback:callback param:nil];
    }
}

@end
