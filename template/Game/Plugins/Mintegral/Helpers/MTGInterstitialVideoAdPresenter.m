#import "MTGInterstitialVideoAdPresenter.h"
#import "NSObject+Logging.h"
#import "Game-Swift.h"

@interface MTGInterstitialVideoAdPresenter () <MTGInterstitialVideoDelegate>

@property (nonatomic, weak) WebGameController *viewController;
@property (nonatomic, strong) MTGInterstitialVideoAdManager * ivAdManager;
@property (nonatomic, copy) NSDictionary *callbacks;

@end

@implementation MTGInterstitialVideoAdPresenter


- (void)presentFromWebGameController:(WebGameController *)viewController
                              unitID:(NSString *)unitID
                           callbacks:(NSDictionary<NSString *, NSString *> *)callbacks {
    self.viewController = viewController;
    self.callbacks = callbacks;
    
    if (!self.ivAdManager && ![[self.ivAdManager currentUnitId] isEqualToString:unitID]) {
        self.ivAdManager = [[MTGInterstitialVideoAdManager alloc] initWithUnitID:unitID
                                                                        delegate:self];
        self.ivAdManager.delegate = self;
    }
    
    [self.ivAdManager loadAd];
}

- (void)onInterstitialAdLoadSuccess:(MTGInterstitialVideoAdManager *)adManager {
    
}

- (void)onInterstitialVideoLoadSuccess:(MTGInterstitialVideoAdManager *)adManager {
    [self.ivAdManager showFromViewController:self.viewController];
}

- (void)onInterstitialVideoLoadFail:(nonnull NSError *)error
                          adManager:(MTGBidInterstitialVideoAdManager *_Nonnull)adManager {
    NSLog(@"%@", error);
    NSDictionary *param = @{
        @"error": @{@"code": @(error.code), @"msg": error.localizedDescription}
    };
    
    NSString *callback = self.callbacks[@"onFail"];
    if (callback) {
        [self.viewController invokeCallback:callback param:param];
    }
}


- (void)onInterstitialVideoShowFail:(nonnull NSError *)error
                          adManager:(MTGBidInterstitialVideoAdManager *_Nonnull)adManager {
    NSLog(@"%@", error);
    NSDictionary *param = @{
        @"error": @{@"code": @(error.code), @"msg": error.localizedDescription}
    };
    
    NSString *callback = self.callbacks[CallbackName.onFail];
    if (callback) {
        [self.viewController invokeCallback:callback param:param];
    }
}

- (void)onInterstitialVideoShowSuccess:(MTGInterstitialVideoAdManager *)adManager {
    NSString *callback = self.callbacks[CallbackName.onShown];
    if (callback) {
        [self.viewController invokeCallback:callback param:nil];
    }
}

- (void)onInterstitialVideoAdClick:(MTGInterstitialVideoAdManager *)adManager {
    NSString *callback = self.callbacks[CallbackName.onClicked];
    if (callback) {
        [self.viewController invokeCallback:callback param:nil];
    }
}

- (void)onInterstitialVideoAdDidClosed:(MTGInterstitialVideoAdManager *)adManager {
    NSString *callback = self.callbacks[CallbackName.onDismissed];
    if (callback) {
        [self.viewController invokeCallback:callback param:nil];
    }
    [GameTimer notifyRestart];
    self.viewController = nil;
}

@end
