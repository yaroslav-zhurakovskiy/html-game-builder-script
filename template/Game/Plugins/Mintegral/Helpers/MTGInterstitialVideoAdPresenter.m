#import "MTGInterstitialVideoAdPresenter.h"
#import "NSObject+Logging.h"
#import "Game-Swift.h"

@interface MTGInterstitialVideoAdPresenter () <MTGInterstitialVideoDelegate>

@property (nonatomic, strong) WebGameController *viewController;
@property (nonatomic, strong) MTGInterstitialVideoAdManager * ivAdManager;

@end

@implementation MTGInterstitialVideoAdPresenter


- (void)presentFromViewController:(WebGameController *)viewController unitID:(NSString *)unitID {
    self.viewController = viewController;
    
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
    self.viewController = nil;
}

- (void)onInterstitialVideoLoadFail:(nonnull NSError *)error
                          adManager:(MTGBidInterstitialVideoAdManager *_Nonnull)adManager {
    NSLog(@"%@", error);
    NSDictionary *param = @{
        @"error": @{@"code": @(error.code), @"msg": error.localizedDescription}
    };
    [self.viewController invokeCallbackWithName:@"onFailed" param:param];
}


- (void)onInterstitialVideoShowFail:(nonnull NSError *)error
                          adManager:(MTGBidInterstitialVideoAdManager *_Nonnull)adManager {
    NSLog(@"%@", error);
    NSDictionary *param = @{
        @"error": @{@"code": @(error.code), @"msg": error.localizedDescription}
    };
    [self.viewController invokeCallbackWithName:@"onFailed" param:param];
}

- (void)onInterstitialVideoShowSuccess:(MTGInterstitialVideoAdManager *)adManager {
    [self.viewController invokeCallbackWithName:@"onShown" param:nil];
}
@end
