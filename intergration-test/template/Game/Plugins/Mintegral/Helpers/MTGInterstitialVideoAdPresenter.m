#import "MTGInterstitialVideoAdPresenter.h"
#import "NSObject+Logging.h"

@interface MTGInterstitialVideoAdPresenter () <MTGInterstitialVideoDelegate>

@property (nonatomic, strong) UIViewController *viewController;
@property (nonatomic, strong) MTGInterstitialVideoAdManager * ivAdManager;

@end

@implementation MTGInterstitialVideoAdPresenter


- (void)presentFromViewController:(UIViewController *)viewController
                           unitID:(NSString *)unitID {
    self.viewController = viewController;
    
    if (!self.ivAdManager && ![[self.ivAdManager currentUnitId] isEqualToString:unitID]) {
        self.ivAdManager = [[MTGInterstitialVideoAdManager alloc] initWithUnitID:unitID
                                                                        delegate:self];
        self.ivAdManager.delegate = self;
        [self.ivAdManager loadAd];
    }
}

- (void)onInterstitialAdLoadSuccess:(MTGInterstitialVideoAdManager *)adManager {
    
}

- (void)onInterstitialVideoLoadSuccess:(MTGInterstitialVideoAdManager *)adManager {
    [self.ivAdManager showFromViewController:self.viewController];
    self.viewController = nil;
}

- (void)onInterstitialVideoLoadFail:(nonnull NSError *)error adManager:(MTGBidInterstitialVideoAdManager *_Nonnull)adManager {
    NSLog(@"%@", error);
}


- (void)onInterstitialVideoShowFail:(nonnull NSError *)error adManager:(MTGBidInterstitialVideoAdManager *_Nonnull)adManager {
    NSLog(@"%@", error);
}

@end
