#import <UIKit/UIKit.h>
#import <MTGSDK/MTGSDK.h>
#import <MTGSDKInterstitialVideo/MTGInterstitialVideoAdManager.h>

NS_ASSUME_NONNULL_BEGIN

@class WebGameController;

@interface MTGInterstitialVideoAdPresenter : NSObject

- (void)presentFromWebGameController:(WebGameController *)viewController
                              unitID:(NSString *)unitID
                           callbacks:(NSDictionary<NSString *, NSString *> *)callbacks;

@end

NS_ASSUME_NONNULL_END
