#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface MTGInterstitialAdPresenter : NSObject

- (void)presentFromViewController:(UIViewController *)viewController
                           unitID:(NSString *)unitID;

@end

NS_ASSUME_NONNULL_END
