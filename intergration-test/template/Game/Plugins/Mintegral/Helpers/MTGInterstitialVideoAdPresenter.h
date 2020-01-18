#import <UIKit/UIKit.h>
#import <MTGSDK/MTGSDK.h>
#import <MTGSDKInterstitialVideo/MTGInterstitialVideoAdManager.h>

NS_ASSUME_NONNULL_BEGIN

@interface MTGInterstitialVideoAdPresenter : NSObject

- (void)presentFromViewController:(UIViewController *)viewController
                           unitID:(NSString *)unitID;

@end

NS_ASSUME_NONNULL_END
