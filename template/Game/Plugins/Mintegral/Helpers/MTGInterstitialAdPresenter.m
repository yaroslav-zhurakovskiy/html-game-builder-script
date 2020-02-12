#import "MTGInterstitialAdPresenter.h"

#import <UIKit/UIKit.h>
#import <MTGSDK/MTGSDK.h>
#import <MTGSDKInterstitial/MTGInterstitialAdManager.h>

@interface MTGInterstitialAdPresenter () <MTGInterstitialAdLoadDelegate, MTGInterstitialAdShowDelegate>

@property (nonatomic, strong) UIViewController *viewController;
@property (nonatomic, strong) MTGInterstitialAdManager * ivAdManager;

@end

@implementation MTGInterstitialAdPresenter

- (void)presentFromViewController:(UIViewController *)viewController
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


@end
